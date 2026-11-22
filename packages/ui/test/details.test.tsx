import { describe, expect, it } from 'vitest';
import { type Details, details } from '../preview/details.mjs';

// Its typings name only the plugin, so the hooks the dev server calls are typed here. Any folder in the package does
// for its root, as it looks up from there for the package and the workspace
const plugin = details() as ReturnType<typeof details> & { configResolved(config: { root: string }): void; load(id: string): string };
plugin.configResolved({ root: (import.meta as ImportMeta & { dirname: string }).dirname });
const { components, componentTokens } = JSON.parse(plugin.load('\0virtual:details').split('\n')[0].replace(/^const details = |;$/g, '')) as Details;
const tokensOf = (name: string) => (componentTokens[name] ?? []).map((token) => token.name);

describe('details', () => {
	it('follow a component into the components it keeps to itself', () => {
		// ColorField draws everything through ChannelField and AnyColorField, which it doesn't export
		expect(components.ColorField.parts).toEqual(expect.arrayContaining(['Label', 'Description', 'FieldError']));
		expect(components.ColorField.styles).toContain('textFieldInput');
	});

	it('give a shared token only to what draws with it', () => {
		// Only field()'s label reads the label's weight, and only an avatar's status dot reads the tones
		expect(tokensOf('Label')).toContain('--field-label-font-weight');
		expect(tokensOf('ColorField')).toContain('--field-label-font-weight');
		expect(tokensOf('Description')).not.toContain('--field-label-font-weight');
		expect(tokensOf('FieldError')).not.toContain('--field-label-font-weight');
		expect(tokensOf('Avatar')).toContain('--tone-success');
		expect(tokensOf('AvatarGroup').filter((name) => name.startsWith('--tone-'))).toEqual([]);
	});
});
