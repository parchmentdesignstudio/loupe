import { marked } from 'marked';
import type { Story } from './stories.js';
import { Prose } from '../src/index.js';

// The Loupe skill, as an agent reads it, from skills/loupe. Its own Markdown, so the page and the plugin can't drift
const files = import.meta.glob<string>('../skills/loupe/**/*.md', { query: '?raw', import: 'default', eager: true });

// The frontmatter is for the agent that loads it, so the page leaves it out
const body = (source: string) => source.replace(/^---\n[\s\S]*?\n---\n/, '');

const names: Record<string, string> = {
	'SKILL.md': 'The skill: rules and where to look',
	'tokens.md': 'Tokens',
	'actions.md': 'Actions',
	'forms.md': 'Forms',
	'overlays.md': 'Overlays',
	'collections.md': 'Collections',
	'feedback.md': 'Feedback',
	'content.md': 'Content',
};
const order = Object.keys(names);
// Links between the files are for the agent, and each file is a section of this page, so here they're plain text
const html = (source: string) => marked.parse(body(source), { async: false }).replace(/<a href="[^"]*\.md">(.*?)<\/a>/g, '$1');
const fileName = (path: string) => path.split('/').pop() ?? path;

export const skillStories: Story[] = Object.entries(files)
	.toSorted(([a], [b]) => order.indexOf(fileName(a)) - order.indexOf(fileName(b)))
	.map(([path, source]) => ({
		name: names[fileName(path)] ?? fileName(path),
		render: () => <Prose className="w-full max-w-160" dangerouslySetInnerHTML={{ __html: html(source) }} />,
	}));
