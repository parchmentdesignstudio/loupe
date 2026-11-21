// What Claude can draw with Loupe, as the JSON schema of render_ui's one argument, a tree of blocks. Each block is a
// component, or a layout of them, and takes data rather than markup: a Table's columns and rows, a Select's options.
// The closed sets, such as Button's variants, are read from the source through virtual:details, so a variant added
// or taken away there is one here too, and the catalogue fails to load if a prop it names has gone. Nothing takes a
// class or a style, so every tree is drawn with Loupe's own tokens
import type { Details } from '../details.mjs';

export type Schema = { [key: string]: unknown };

export interface Block {
	/** When to use it, for Claude */
	doc: string;
	props: Record<string, Schema>;
	required?: string[];
	/** Holds other blocks */
	children?: boolean;
}

export interface Node {
	type: string;
	children?: Node[];
	[prop: string]: unknown;
}

const node = { $ref: '#/$defs/node' };
const text = (description: string): Schema => ({ type: 'string', description });
const oneOf = (values: readonly (string | number)[], description?: string): Schema => ({ enum: [...values], ...(description && { description }) });
// Loupe's 4px steps, as Tailwind's gap-1 to gap-10
export const gaps = [1, 2, 3, 4, 6, 8, 10] as const;
const option = { type: 'object', properties: { id: text('Unique within the list'), name: text('What it says') }, required: ['id', 'name'], additionalProperties: false };

export function blocksOf(details: Details): Record<string, Block> {
	// A prop's options as the source has them, so the two can't drift apart
	const options = (component: string, prop: string) => {
		const found = details.components[component]?.props?.find((p) => p.name === prop)?.options;
		if (!found?.length) throw new Error(`The generative UI catalogue names ${component}'s ${prop}, which the source no longer has options for`);
		return found;
	};
	const tones = options('Status', 'tone');
	const status: Block = { doc: 'Where a record is up to. The label says it on its own; the colour only backs it up', props: { label: text('Such as Overdue'), tone: oneOf(tones, 'neutral: not started or archived. info: new or in progress. success: done or paid. warning: waiting or due soon. danger: failed or overdue'), variant: oneOf(options('Status', 'variant'), 'dot in tables and lists, badge in a card or beside a heading') }, required: ['label', 'tone'] };

	return {
		Stack: { doc: 'Blocks one above another. The usual root', props: { gap: oneOf(gaps, '4px steps: 2 within a group, 4 between groups, 8 between sections') }, children: true },
		Row: { doc: 'Blocks side by side, wrapping when there is no room, such as a heading with its actions', props: { gap: oneOf(gaps), justify: oneOf(['start', 'between', 'end']), align: oneOf(['start', 'center', 'end']) }, children: true },
		Grid: { doc: 'Cards or stats in equal columns, fewer as the space narrows', props: { columns: oneOf([2, 3, 4]), gap: oneOf(gaps) }, required: ['columns'], children: true },
		Card: { doc: 'A raised panel, only among other cards, such as stats in a Grid. A section on its own is not a card, and a Table never goes in one', props: {}, children: true },
		Heading: { doc: 'page: the one title. section: heads a section. group: a quiet label over a small group', props: { text: text('Sentence case'), level: oneOf(['page', 'section', 'group']) }, required: ['text', 'level'] },
		Text: { doc: 'A paragraph or a figure', props: { text: text('The words'), tone: oneOf(['default', 'muted', 'danger'], 'muted for secondary words, danger only for an error'), size: oneOf(['body', 'title', 'label'], 'title for a big figure in a stat card') }, required: ['text'] },
		Separator: { doc: 'A rule between groups that space alone does not part', props: {} },
		Button: { doc: 'An action. primary for the one main action in the whole tree, at most one; secondary otherwise; ghost in tight spaces; danger to delete', props: { label: text('Says what happens, such as Save changes'), variant: oneOf(options('Button', 'variant')), size: oneOf(options('Button', 'size')), action: text('Sent back to you as the next message when it is pressed, such as "Show overdue invoices"') }, required: ['label', 'variant'] },
		Status: status,
		Alert: { doc: 'Something about this view, there when it shows. One at most', props: { tone: oneOf(tones), variant: oneOf(options('Alert', 'variant'), 'alert to draw the eye, notice for a quieter line'), title: text('A short line'), text: text('The detail') }, required: ['tone', 'text'] },
		EmptyState: { doc: 'There is nothing to show yet: says what will be here and how to start', props: { title: text('Such as No invoices yet'), text: text('How to start'), action: { $ref: '#/$defs/button' } }, required: ['title'] },
		ProgressBar: { doc: 'How far along a task is', props: { label: text('What is in progress'), value: { type: 'number', minimum: 0, maximum: 100, description: 'Percent. Leave out while unknown' }, valueLabel: text('Such as 3 of 8 files') }, required: ['label'] },
		Meter: { doc: 'How much of a known limit is used, such as storage', props: { label: text('What is measured'), value: { type: 'number', minimum: 0, maximum: 100, description: 'Percent used' }, valueLabel: text('Such as 7.2 of 10 GB') }, required: ['label', 'value'] },
		Avatar: { doc: 'A person, or with a square an organisation', props: { name: text('Gives the initials'), size: oneOf(options('Avatar', 'size').map(Number)), shape: oneOf(options('Avatar', 'shape')) }, required: ['name'] },
		Quote: { doc: 'Words someone said', props: { text: text('The quote'), cite: text('Who said it'), variant: oneOf(options('Quote', 'variant')) }, required: ['text'] },
		TextField: { doc: 'Text to type', props: { label: text('Sentence case'), description: text('A hint under it'), placeholder: text('An example, never the label'), value: text('What it starts with'), isMultiline: { type: 'boolean' } }, required: ['label'] },
		Switch: { doc: 'A setting that takes effect straight away, with no Save', props: { label: text('The setting'), isSelected: { type: 'boolean' } }, required: ['label'] },
		Checkbox: { doc: 'One of several choices made together, or agreeing to something before a submit', props: { label: text('The choice'), isSelected: { type: 'boolean' } }, required: ['label'] },
		Select: { doc: 'Picks one of 6 to 15 options', props: { label: text('Sentence case'), options: { type: 'array', items: option, minItems: 2 }, selected: text('The id picked to start with') }, required: ['label', 'options'] },
		RadioGroup: { doc: 'Picks one of 2 to 5 options, all in view', props: { label: text('Sentence case'), options: { type: 'array', items: option, minItems: 2, maxItems: 5 }, selected: text('The id picked to start with') }, required: ['label', 'options'] },
		Table: {
			doc: 'Records with several fields to compare. Its own box, so never in a Card',
			props: {
				label: text('Names the table for a screen reader'),
				density: oneOf(options('Table', 'density')),
				variant: oneOf(options('Table', 'variant'), 'raised among other things, flush when the table is the whole view'),
				columns: { type: 'array', minItems: 1, items: { type: 'object', properties: { id: text('Unique'), name: text('Sentence case'), align: oneOf(options('Column', 'align'), 'end for numbers and amounts, which are drawn with tabular figures'), isRowHeader: { type: 'boolean', description: 'The column that names each row. Exactly one' } }, required: ['id', 'name'], additionalProperties: false } },
				rows: { type: 'array', items: { type: 'object', properties: { id: text('Unique'), cells: { type: 'array', description: 'One per column, in order', items: { anyOf: [{ type: 'string' }, { type: 'number' }, { $ref: '#/$defs/status' }] } } }, required: ['id', 'cells'], additionalProperties: false } },
				empty: text('What the table says when there are no rows'),
			},
			required: ['label', 'columns', 'rows'],
		},
		Tabs: { doc: 'Panels of one subject, one at a time', props: { label: text('Names the tabs for a screen reader'), tabs: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: text('Unique'), name: text('Sentence case'), content: node }, required: ['id', 'name', 'content'], additionalProperties: false } } }, required: ['label', 'tabs'] },
	};
}

const schemaOf = (type: string, block: Block): Schema => ({
	type: 'object',
	description: block.doc,
	properties: { type: { const: type }, ...block.props, ...(block.children && { children: { type: 'array', items: node } }) },
	required: ['type', ...(block.required ?? [])],
	additionalProperties: false,
});

/** render_ui's input schema: { ui: a block }, each block one of the catalogue's */
export function inputSchemaOf(blocks: Record<string, Block>): Schema {
	return {
		type: 'object',
		properties: { ui: node, summary: text('One sentence on what the view shows, for the conversation') },
		required: ['ui', 'summary'],
		$defs: {
			node: { anyOf: Object.entries(blocks).map(([type, block]) => schemaOf(type, block)) },
			status: schemaOf('Status', blocks.Status),
			button: schemaOf('Button', blocks.Button),
		},
	};
}

// The schema the tree is checked against, followed as far as render_ui's own uses it
function check(value: unknown, schema: Schema, at: string, defs: Record<string, Schema>, errors: string[]) {
	if (typeof schema.$ref === 'string') return check(value, defs[schema.$ref.split('/').pop()!], at, defs, errors);
	if (Array.isArray(schema.anyOf)) {
		// A block is picked by its type, so its own errors can be told rather than every block's
		const branches = schema.anyOf as Schema[];
		const type = (value as Node | null)?.type;
		const named = branches.find((branch) => (branch.properties as Record<string, Schema> | undefined)?.type?.const === type);
		if (named) return check(value, named, at, defs, errors);
		const tried = branches.map((branch) => {
			const found: string[] = [];
			check(value, branch, at, defs, found);
			return found;
		});
		if (tried.some((found) => found.length === 0)) return;
		const types = branches.map((branch) => (branch.properties as Record<string, Schema> | undefined)?.type?.const).filter(Boolean);
		errors.push(types.length ? `${at}: ${type === undefined ? 'needs a type' : `${JSON.stringify(type)} is not a block`}. The blocks are ${types.join(', ')}` : (tried.find((found) => found.length) ?? [])[0]);
		return;
	}
	if ('const' in schema && value !== schema.const) return errors.push(`${at}: should be ${JSON.stringify(schema.const)}`);
	if (Array.isArray(schema.enum) && !schema.enum.includes(value)) return errors.push(`${at}: ${JSON.stringify(value)} isn't one of ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`);
	const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
	if (schema.type && schema.type !== type && !(schema.type === 'integer' && Number.isInteger(value))) return errors.push(`${at}: should be ${schema.type === 'array' ? 'an array' : `a ${schema.type}`}`);
	if (typeof value === 'number') {
		if (typeof schema.minimum === 'number' && value < schema.minimum) errors.push(`${at}: below ${schema.minimum}`);
		if (typeof schema.maximum === 'number' && value > schema.maximum) errors.push(`${at}: above ${schema.maximum}`);
	}
	if (Array.isArray(value)) {
		if (typeof schema.minItems === 'number' && value.length < schema.minItems) errors.push(`${at}: needs at least ${schema.minItems}`);
		if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) errors.push(`${at}: takes at most ${schema.maxItems}`);
		if (schema.items) value.forEach((item, index) => check(item, schema.items as Schema, `${at}[${index}]`, defs, errors));
	}
	if (type === 'object' && schema.properties) {
		const properties = schema.properties as Record<string, Schema>;
		const object = value as Record<string, unknown>;
		for (const key of (schema.required as string[] | undefined) ?? []) if (object[key] === undefined) errors.push(`${at}: needs ${key}`);
		for (const [key, item] of Object.entries(object)) {
			if (properties[key]) check(item, properties[key], `${at}.${key}`, defs, errors);
			else if (schema.additionalProperties === false) errors.push(`${at}: takes no ${key}${key === 'className' || key === 'style' ? ', as every block is drawn with Loupe’s tokens' : ''}`);
		}
	}
}

// What a schema can't say: rules from the Loupe skill, and ids that must match up
function rules(ui: Node, errors: string[]) {
	let primaries = 0;
	const visit = (item: Node, at: string) => {
		if (!item || typeof item !== 'object') return;
		if ((item.type === 'Button' && item.variant === 'primary') || (item.type === 'EmptyState' && (item.action as Node | undefined)?.variant === 'primary')) primaries++;
		if (item.type === 'Table') {
			const columns = (item.columns as { id: string; isRowHeader?: boolean }[]) ?? [];
			const headers = columns.filter((column) => column.isRowHeader).length;
			if (headers !== 1) errors.push(`${at}: needs exactly one column with isRowHeader, not ${headers}`);
			((item.rows as { cells: unknown[] }[]) ?? []).forEach((row, index) => {
				if (row.cells?.length !== columns.length) errors.push(`${at}.rows[${index}]: has ${row.cells?.length ?? 0} cells for ${columns.length} columns`);
			});
		}
		if ((item.type === 'Select' || item.type === 'RadioGroup') && item.selected !== undefined && !(item.options as { id: string }[] | undefined)?.some((o) => o.id === item.selected)) errors.push(`${at}.selected: ${JSON.stringify(item.selected)} isn't one of the options' ids`);
		for (const key of ['options', 'columns', 'rows', 'tabs'] as const) {
			const ids = ((item[key] as { id: string }[] | undefined) ?? []).map((entry) => entry?.id);
			const repeated = ids.find((id, index) => ids.indexOf(id) !== index);
			if (repeated !== undefined) errors.push(`${at}.${key}: the id ${JSON.stringify(repeated)} is used twice`);
		}
		if (item.type === 'Card') {
			const inside = (child: Node): boolean => child?.type === 'Table' || (child?.children ?? []).some(inside);
			if (inside(item)) errors.push(`${at}: a Table is its own box, so it never goes in a Card`);
		}
		item.children?.forEach((child, index) => visit(child, `${at}.children[${index}]`));
		(item.tabs as { content: Node }[] | undefined)?.forEach((tab, index) => visit(tab.content, `${at}.tabs[${index}].content`));
	};
	visit(ui, 'ui');
	if (primaries > 1) errors.push(`ui: has ${primaries} primary buttons. One at most, so the view has one next step`);
}

/** Why a tree can't be drawn, as lines Claude can act on, or none */
export function validate(input: unknown, schema: Schema): string[] {
	const errors: string[] = [];
	check(input, schema, 'input', schema.$defs as Record<string, Schema>, errors);
	if (!errors.length) rules((input as { ui: Node }).ui, errors);
	return errors;
}
