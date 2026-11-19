import { Icon } from '@parchment/icons/react';
import { Fragment, type ReactNode, isValidElement } from 'react';
import * as aria from 'react-aria-components';
import details from 'virtual:details';
import * as ui from '../src/index.js';
import * as card from './blocks/card.js';

// A playground's component as JSX to paste, from the element it renders. Handlers and render functions are left out, as
// they're the preview's own, and so is any prop at its default

// Each component by the name it's imported as, since React Aria's are minified. The library's own come after, where it
// re-exports one of React Aria's under the same name, and the blocks' last
const names = new Map<unknown, string>();
for (const [name, value] of [...Object.entries(aria), ...Object.entries(ui), ['Icon', Icon] as const, ...Object.entries(card)]) if (/^[A-Z]/.test(name)) names.set(value, name);

// Icon comes from the icons package, which details doesn't read
const outside: Record<string, Record<string, string>> = { Icon: { variant: "'solid'", size: '16' } };

const isDefault = (component: string, prop: string, value: unknown) => {
	const fallback = details.components[component]?.props?.find((entry) => entry.name === prop)?.default ?? outside[component]?.[prop];
	return fallback !== undefined && fallback === (typeof value === 'string' ? `'${value}'` : String(value));
};

function attribute(component: string, prop: string, value: unknown, depth: number): string | undefined {
	// data-source is the inspector's, added to every element in development, and data-show-focus the Focused switch's
	if (prop === 'data-source' || prop === 'data-show-focus' || value === undefined || value === null || value === false || typeof value === 'function') return;
	if (isDefault(component, prop, value)) return;
	if (value === true) return prop;
	if (typeof value === 'string') return `${prop}=${JSON.stringify(value)}`;
	if (value instanceof Set) value = [...value];
	if (Array.isArray(value) && !value.length) return;
	if (isValidElement(value)) return `${prop}={${jsx(value, depth).trimStart()}}`;
	return `${prop}={${JSON.stringify(value)}}`;
}

function jsx(node: ReactNode, depth = 0): string {
	const indent = '\t'.repeat(depth);
	if (node === null || node === undefined || typeof node === 'boolean') return '';
	if (typeof node === 'string' || typeof node === 'number') return `${indent}${node}`;
	if (Array.isArray(node)) return node.map((child) => jsx(child, depth)).filter(Boolean).join('\n');
	if (!isValidElement(node)) return '';
	const { children, ...props } = node.props as { children?: ReactNode } & Record<string, unknown>;
	// A wrapper of the preview's own, rather than the library's, isn't part of the code to copy, but what's in it is
	const name = typeof node.type === 'string' ? node.type : names.get(node.type);
	if (node.type === Fragment) return jsx(children, depth);
	if (!name) {
		if (children !== undefined || typeof node.type !== 'function') return jsx(children, depth);
		// One with no children, such as a card's example, is drawn to see what it holds. Calling it outside React fails
		// where it has hooks, and then there's nothing to show
		try {
			return jsx((node.type as (props: unknown) => ReactNode)(node.props), depth);
		} catch {
			return '';
		}
	}
	const shown = [children].flat().filter((child) => child !== null && child !== undefined && typeof child !== 'boolean');
	const text = shown.length && shown.every((child) => typeof child === 'string' || typeof child === 'number') ? shown.join('') : undefined;
	const attributes = Object.entries(props)
		// textValue is only needed where the children aren't text already
		.filter(([prop, value]) => !(prop === 'textValue' && value === text))
		.map(([prop, value]) => attribute(name, prop, value, depth))
		.filter(Boolean);
	const open = [name, ...attributes].join(' ');
	const inner = typeof children === 'function' ? '' : jsx(children, depth + 1);
	if (!inner) return `${indent}<${open} />`;
	// Text alone stays on the tag's line, as it would be written
	if (text !== undefined) return `${indent}<${open}>${text}</${name}>`;
	return `${indent}<${open}>\n${inner}\n${indent}</${name}>`;
}

export const codeOf = (node: ReactNode) => jsx(node).replace(/^\t*/, '');
