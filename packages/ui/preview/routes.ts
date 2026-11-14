import { type Entry, areas, blocks, library } from './stories.js';

// Where each page sits in loupe. The components are under ui, as #/ui/button, the blocks under Blocks, as
// #/blocks/sign-up-form, and the other areas sit at the top, as #/icons

export interface Crumb {
	name: string;
	href?: string;
}

const ui: Crumb = { name: 'ui', href: '#/ui' };
const blocksArea = areas.find((area) => area.id === 'blocks')!;

interface Page {
	entry?: Entry;
	trail: Crumb[];
}

const pages = new Map<string, Page>([['ui', { trail: [{ name: 'ui' }] }]]);
for (const area of areas) pages.set(area.id, { entry: area, trail: [{ name: area.name }] });
for (const group of library) for (const entry of group.components) pages.set(`ui/${entry.id}`, { entry, trail: [ui, { name: group.name }, { name: entry.name }] });
for (const entry of blocks) pages.set(`blocks/${entry.id}`, { entry, trail: [{ name: blocksArea.name, href: '#/blocks' }, { name: entry.name }] });

const paths = new Map([...pages].flatMap(([path, page]) => (page.entry ? [[page.entry, path] as const] : [])));

/** An entry's address, as #/ui/button */
export const href = (entry: Entry) => `#/${paths.get(entry)}`;

/** The page at an address without its #/, or nothing if there isn't one */
export const pageAt = (path: string) => pages.get(path);

/**
 * Where an address that's moved now lives: the components were at the top, as #/button, before they moved under ui.
 * There's no page for loupe itself yet, so its address opens ui
 */
export function forward(path: string) {
	if (path === '') return 'ui';
	if (!pages.has(path) && pages.has(`ui/${path}`)) return `ui/${path}`;
	return undefined;
}
