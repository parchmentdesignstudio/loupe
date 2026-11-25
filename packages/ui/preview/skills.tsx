import { marked } from 'marked';
import type { Entry, Story } from './stories.js';
import { Prose } from '../src/index.js';

// The Loupe skill, as an agent reads it, from skills/loupe. Its own Markdown, so the pages and the plugin can't drift
const skill = import.meta.glob<string>('../skills/loupe/SKILL.md', { query: '?raw', import: 'default', eager: true });
const references = import.meta.glob<string>('../skills/loupe/references/*.md', { query: '?raw', import: 'default', eager: true });

// The frontmatter is for the agent that loads it, and the title is the page's own, so the page leaves both out
const body = (source: string) => source.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^\s*# .*\n/, '');
const idOf = (path: string) => (path.split('/').pop() ?? path).replace(/\.md$/, '');
const titleOf = (source: string) => source.match(/^# (.*)$/m)?.[1] ?? '';

// A link to another reference opens its page here. Anything else, such as another skill, is for the agent, so it's plain text
const html = (source: string) =>
	marked
		.parse(source, { async: false })
		.replace(/<a href="(?:references\/)?([\w-]+)\.md(?:#[^"]*)?">(.*?)<\/a>/g, (_, id: string, text: string) => (id in pages ? `<a href="#/skills/${id}">${text}</a>` : text))
		.replace(/<a href="[^"#][^"]*\.md[^"]*">(.*?)<\/a>/g, '$1');

const render = (source: string) => () => <Prose className="w-full max-w-160" dangerouslySetInnerHTML={{ __html: html(source) }} />;

// Each section is a story, so a long file reads in parts. What comes before the first section is its introduction
function sections(source: string, intro: string): Story[] {
	const [first, ...rest] = body(source).split(/^## /m);
	const parts = rest.map((part) => {
		const [name, ...lines] = part.split('\n');
		return { name, render: render(lines.join('\n')) };
	});
	return first.trim() ? [{ name: intro, render: render(first) }, ...parts] : parts;
}

const [skillSource] = Object.values(skill);
// What each reference covers, from the skill's own table of them
const covers = new Map([...skillSource.matchAll(/^\| \[([\w-]+)\.md\]\([^)]*\) \| (.*) \|$/gm)].map(([, id, text]) => [id, text]));
const order = [...covers.keys()];
const pages: Record<string, string> = Object.fromEntries(Object.entries(references).map(([path, source]) => [idOf(path), source]));

export const skillStories: Story[] = sections(skillSource, 'What it is');

/** A page for each reference, under Skills, in the order the skill lists them */
export const skillPages: Entry[] = Object.entries(pages)
	.toSorted(([a], [b]) => order.indexOf(a) - order.indexOf(b))
	.map(([id, source]) => ({
		id,
		name: titleOf(source),
		description: covers.get(id) ?? '',
		stories: sections(source, 'Start here'),
	}));
