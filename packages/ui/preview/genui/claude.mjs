// Claude for the preview's chat, while it runs locally: POST /__loupe/claude with the conversation so far, and it
// answers in words and, when a view says it better, a tree of Loupe blocks drawn through render_ui. The key is read
// on this side, from ANTHROPIC_API_KEY or packages/ui/.env.local, so it never reaches the page. A tree that breaks
// the catalogue goes back to Claude with what's wrong, for it to draw again, so the page only gets one that draws
import Anthropic, { APIError, AuthenticationError, RateLimitError } from '@anthropic-ai/sdk';
import { dirname } from 'node:path';
import { loadEnv } from 'vite';

export const path = '/__loupe/claude';
const model = 'claude-opus-5-5';
// Drawing again after an error is rare, and three goes is plenty to tell a tree that won't come right
const attempts = 3;

const system = `You answer questions in a chat inside Loupe, a component library's preview. When a view would answer better than words, such as a table of records, a form, a few stats or a settings panel, call render_ui once with a tree of Loupe's blocks, and say in a sentence or two what it shows. Otherwise answer in words alone.

The schema is the whole of what exists: every block, prop and option is listed, and nothing else can be drawn. Sample data you make up should be plausible and specific, with real-looking names, dates and amounts in British English.

How Loupe is used:
- One primary Button in the whole view, for its one next step. Everything else is secondary, or ghost where space is tight. A Button's action is sent back to you as the next message, so give it one that asks for what it would do.
- A page's root is a Stack with gap 8 between sections. A Heading with level page names the view once. A section is a Heading with level section over its content at gap 4.
- A Table is its own box: never in a Card. Amounts and counts are align end. Exactly one column is the row header, the one that names each row. Status goes in its own column as a Status, never a word on its own.
- Cards are only for things among other cards, such as stats in a Grid: a group label, then the figure as Text with size title.
- Settings are Switches, which take effect at once, with no Save button. A form that is submitted ends with its one primary Button.
- Labels and headings are sentence case. Buttons say what happens, such as Send invoice, never Submit or OK.`;

let client;
let renderTool;
let validate;

async function setUp(server) {
	// The preview's root is preview, so the package's own .env.local is a folder up
	const env = loadEnv(server.config.mode, dirname(server.config.root), '');
	// With no key in either place, the SDK looks for an ant auth login profile of its own
	client ??= new Anthropic(process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY ? { apiKey: process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY } : {});
	// Loaded each time, so the catalogue follows the source as it changes, as virtual:details does
	const { default: details } = await server.ssrLoadModule('virtual:details');
	const catalogue = await server.ssrLoadModule('/genui/catalogue.ts');
	const schema = catalogue.inputSchemaOf(catalogue.blocksOf(details));
	renderTool = {
		name: 'render_ui',
		description: 'Draws a view with Loupe’s components, in the conversation under your reply. Use it when the answer is records, a form, stats or settings, and say in words what it shows',
		input_schema: schema,
		eager_input_streaming: true,
	};
	validate = (input) => catalogue.validate(input, schema);
}

// What the page sends: each turn's words, and the tree it was shown, which Claude is told of as words of its own
const historyOf = (messages) =>
	messages.map(({ role, text, ui }) => ({
		role,
		content: ui ? `${text}\n\n[The view drawn with render_ui]\n${JSON.stringify(ui)}` : text,
	}));

async function answer(messages) {
	const conversation = historyOf(messages);
	let ui;
	let summary;
	for (let attempt = 0; attempt <= attempts; attempt++) {
		const response = await client.beta.messages
			.stream({
				model,
				max_tokens: 64000,
				// Opus 5.5 starts at medium; said here so a change of model doesn't quietly change it
				output_config: { effort: 'medium' },
				// A decline goes on to a model picked for its kind, rather than ending the reply
				betas: ['server-side-fallback-2026-07-01'],
				fallbacks: 'default',
				cache_control: { type: 'ephemeral' },
				system,
				tools: [renderTool],
				messages: conversation,
			})
			.finalMessage();
		const words = response.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n\n').trim();
		if (response.stop_reason === 'refusal') return { text: words || 'Claude couldn’t help with that one.' };
		if (response.stop_reason === 'max_tokens') return { text: words || 'That reply ran too long to finish.', ui, summary };
		const calls = response.content.filter((block) => block.type === 'tool_use');
		if (response.stop_reason !== 'tool_use' || !calls.length) return { text: words, ui, summary };

		// Every call gets its result back in the one message, and only a tree that passes is kept
		const results = calls.map((call) => {
			if (call.name !== 'render_ui') return { type: 'tool_result', tool_use_id: call.id, is_error: true, content: `There's no tool called ${call.name}` };
			const errors = validate(call.input);
			if (errors.length) return { type: 'tool_result', tool_use_id: call.id, is_error: true, content: `It can't be drawn:\n${errors.join('\n')}\nFix these and call render_ui again.` };
			ui = call.input.ui;
			summary = call.input.summary;
			return { type: 'tool_result', tool_use_id: call.id, content: 'Drawn under your reply.' };
		});
		conversation.push({ role: 'assistant', content: response.content }, { role: 'user', content: results });
	}
	return { text: 'Claude couldn’t draw a view that fits Loupe, so here are its words alone.', ui, summary };
}

export function claude() {
	return {
		name: 'claude',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(path, (req, res) => {
				const reply = (status, body) => {
					res.statusCode = status;
					res.setHeader('content-type', 'application/json');
					res.end(JSON.stringify(body));
				};
				if (req.method !== 'POST') return reply(405, { error: 'POST the conversation' });
				void (async () => {
					try {
						let body = '';
						for await (const chunk of req) body += chunk;
						const { messages } = JSON.parse(body);
						if (!Array.isArray(messages) || !messages.length) return reply(400, { error: 'Send { messages: [{ role, text }] }' });
						await setUp(server);
						reply(200, await answer(messages));
					} catch (error) {
						if (error instanceof AuthenticationError || (!(error instanceof APIError) && /authentication method/i.test(String(error)))) return reply(503, { error: 'No key for Claude. Put ANTHROPIC_API_KEY in packages/ui/.env.local and start the preview again' });
						if (error instanceof RateLimitError) return reply(429, { error: 'Claude is busy. Try again in a moment' });
						if (error instanceof APIError) return reply(502, { error: `Claude said ${error.status}: ${error.message}` });
						reply(500, { error: error instanceof Error ? error.message : String(error) });
					}
				})();
			});
		},
	};
}
