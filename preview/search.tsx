import type { DocsSearchPage } from '../src/docs.js';
import { href } from './routes.js';
import { areas, blocks, library } from './stories.js';

// Every page, for DocsSearch
export const pages: DocsSearchPage[] = [
	{ href: '#/ui', name: 'Components', group: 'Loupe' },
	...areas.map((area) => ({ href: href(area), name: area.name, group: 'Loupe' })),
	...blocks.map((entry) => ({ href: href(entry), name: entry.name, group: 'Blocks' })),
	...library.flatMap((group) => group.components.map((entry) => ({ href: href(entry), name: entry.name, group: group.name }))),
];
