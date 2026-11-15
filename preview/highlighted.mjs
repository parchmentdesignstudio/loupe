// The Code playground's samples, highlighted as the preview builds, as virtual:highlighted-code, so they show with
// their colours at once rather than once Shiki has loaded in the browser. Highlighted again as a sample or the theme
// changes
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const id = 'virtual:highlighted-code';
const loaded = `\0${id}`;
// Fresh each time, past Node's cache of the modules, so a change to them shows
const fresh = (file) => import(`${pathToFileURL(file).href}?${Date.now()}`);

export function highlightedCode() {
	let files = [];
	return {
		name: 'highlighted-code',
		configResolved(config) {
			files = [join(config.root, 'playgrounds/code-samples.ts'), join(config.root, '../src/shiki.ts')];
		},
		resolveId: (source) => (source === id ? loaded : undefined),
		async load(module) {
			if (module !== loaded) return;
			const [{ samples, markings, mark, highlightKey }, { highlight }] = await Promise.all(files.map(fresh));
			const highlighted = {};
			for (const sample of Object.keys(samples))
				for (const marking of markings)
					for (const lineNumbers of [false, true]) {
						const { code, meta } = mark(sample, marking);
						highlighted[highlightKey(sample, marking, lineNumbers)] = await highlight(code, { language: sample, lineNumbers, meta });
					}
			return `export default ${JSON.stringify(highlighted)}`;
		},
		hotUpdate({ file, modules }) {
			if (this.environment.name !== 'client' || !files.includes(file)) return;
			const module = this.environment.moduleGraph.getModuleById(loaded);
			if (!module) return;
			this.environment.moduleGraph.invalidateModule(module);
			return [...modules, module];
		},
	};
}
