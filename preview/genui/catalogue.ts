// What Claude can draw with Loupe, as the JSON schema of render_ui's one argument, a tree of blocks. Each block is a
// component, or a layout of them, and takes data rather than markup: a Table's columns and rows, a Select's options.
// The closed sets, such as Button's variants, are read from the source through virtual:details, so a variant added
// or taken away there is one here too, and the catalogue fails to load if a prop it names has gone. Nothing takes a
// class or a style, so every tree is drawn with Loupe's own tokens.
//
// A view can also come with controls to tweak it, as a playground has. Its values are named, a block's prop reads one
// with {"$value": name}, and a block's when shows it only while a true-or-false value is on. A control names only its
// label and its value: what kind of control it is, and how far it goes, comes from the props that read the value, so a
// gap gets a slider over Loupe's own steps, and no setting of any control can draw a view the catalogue wouldn't
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
const bound = { $ref: '#/$defs/bound' };
const text = (description: string): Schema => ({ type: 'string', description });
const oneOf = (values: readonly (string | number)[], description?: string): Schema => ({ enum: [...values], ...(description && { description }) });
// Loupe's 4px steps, as Tailwind's gap-1 to gap-10
export const gaps = [1, 2, 3, 4, 6, 8, 10] as const;
// A date as text, since JSON has no dates: the renderer parses it into one
const day = (description: string): Schema => ({ type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: `${description}, as YYYY-MM-DD` });
const time = (description: string): Schema => ({ type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', description: `${description}, as HH:MM on a 24 hour clock` });
const number = (description: string): Schema => ({ type: 'number', description });
const option = { type: 'object', properties: { id: text('Unique within the list'), name: text('What it says') }, required: ['id', 'name'], additionalProperties: false };
// The icons a List's items can take, which say something on their own, such as what a plan has or hasn't
export const icons = ['checkmark', 'xmark', 'minus', 'plus', 'star', 'bolt', 'arrow-right', 'person', 'calendar', 'envelope'] as const;
// The icons an EmptyState can take, each a kind of thing that will fill it
export const emptyIcons = ['folder', 'person', 'envelope', 'calendar', 'chart-bar', 'bubble-left', 'archivebox', 'briefcase', 'bookmark', 'star', 'link', 'square-grid-2x2', 'magnifyingglass'] as const;
// One of a Menu's actions, or a table row's
const menuAction = { type: 'object', properties: { label: text('Says what happens'), action: text('Sent back to you as the next message when it is picked'), isDanger: { type: 'boolean', description: 'Deletes or can’t be undone. Goes last' } }, required: ['label'], additionalProperties: false };

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
		Stack: { doc: 'Blocks one above another. The usual root', props: { gap: oneOf(gaps, '4px steps: 2 within a group, 4 between groups, 8 between sections'), width: oneOf(['full', 'narrow'], 'narrow holds a form or settings to a 36rem column, as an app would, so its fields don’t stretch across a wide page') }, children: true },
		Split: { doc: 'Two columns, a narrow one beside a wide one, such as filters beside results or a summary beside a form. They fold one above the other when the space is under 42rem, so never for things that must sit side by side. Its two children go in the order they sit, so with side end the wide one comes first', props: { side: oneOf(['start', 'end'], 'Where the narrow column goes: start for navigation or filters, end for a summary or details'), gap: oneOf(gaps) }, required: ['side'], children: true },
		Row: { doc: 'Blocks side by side, wrapping when there is no room, such as a heading with its actions', props: { gap: oneOf(gaps), justify: oneOf(['start', 'between', 'end']), align: oneOf(['start', 'center', 'end']) }, children: true },
		Grid: { doc: 'Cards or stats in equal columns, fewer as the space narrows', props: { columns: oneOf([2, 3, 4]), gap: oneOf(gaps) }, required: ['columns'], children: true },
		Card: { doc: 'One of a few things side by side in a Grid, such as plans or stats. A section on its own is not a card, and a Table never goes in one. Its buttons sit at its foot, so a row of cards lines them up', props: { title: text('What it is, such as Team or Revenue'), figure: text('A stat’s figure, such as £18,430, drawn large and grouped with the title as its value'), description: text('A line under the title, such as who a plan is for, or with a figure, under that, such as Up 12% on last week'), fill: oneOf(options('Card', 'fill'), 'raised unless it sits inside something raised already'), actions: { type: 'array', minItems: 1, maxItems: 2, items: { $ref: '#/$defs/cardButton' }, description: 'Its buttons, at the foot. One card in a row may have the primary, as the one to pick' } }, children: true },
		List: { doc: 'Things to read, one under another, such as what a plan includes or an account’s details. Nothing in it is pressed: items to open are a GridList, and records to compare are a Table', props: { label: text('Names the list for a screen reader, where no heading does'), variant: oneOf(options('List', 'variant'), 'divided to scan rows, plain for short points such as a plan’s'), items: { type: 'array', minItems: 1, items: { type: 'object', properties: { title: text('What it says'), description: text('A line under it'), icon: oneOf(icons, 'Before it, such as checkmark for what a plan includes'), end: { anyOf: [{ type: 'string' }, { type: 'number' }, { $ref: '#/$defs/status' }], description: 'A value at the end, such as an amount or a Status' } }, required: ['title'], additionalProperties: false } } }, required: ['items'] },
		Heading: { doc: 'page: the one title. section: heads a section. group: a quiet label over a small group', props: { text: text('Sentence case'), level: oneOf(['page', 'section', 'group']) }, required: ['text', 'level'] },
		Text: { doc: 'A paragraph or a figure', props: { text: text('The words'), tone: oneOf(['default', 'muted', 'danger'], 'muted for secondary words, danger only for an error'), size: oneOf(['body', 'title', 'label'], 'title for a price or a figure in a sentence; a stat card’s figure is the Card’s figure') }, required: ['text'] },
		Separator: { doc: 'A rule between groups that space alone does not part', props: {} },
		Button: { doc: 'An action. primary for the one main action in the whole tree, at most one; secondary otherwise; ghost in tight spaces; danger to delete', props: { label: text('Says what happens, such as Save changes'), variant: oneOf(options('Button', 'variant')), size: oneOf(options('Button', 'size')), action: text('Sent back to you as the next message when it is pressed, such as "Show overdue invoices"') }, required: ['label', 'variant'] },
		Status: status,
		Alert: { doc: 'Something about this view, there when it shows. One at most', props: { tone: oneOf(tones), variant: oneOf(options('Alert', 'variant'), 'alert to draw the eye, notice for a quieter line'), title: text('A short line'), text: text('The detail') }, required: ['tone', 'text'] },
		EmptyState: { doc: 'There is nothing to show yet: says what will be here and how to start', props: { icon: oneOf(emptyIcons, 'What will be here, on a tile above the title, such as folder for projects. magnifyingglass for a search that found nothing. Leave out if none says it'), title: text('Such as No invoices yet'), text: text('How to start'), action: { $ref: '#/$defs/button' } }, required: ['title'] },
		ProgressBar: { doc: 'How far along a task is', props: { label: text('What is in progress'), value: { type: 'number', minimum: 0, maximum: 100, description: 'Percent. Leave out while unknown' }, valueLabel: text('Such as 3 of 8 files') }, required: ['label'] },
		Meter: { doc: 'How much of a known limit is used, such as storage', props: { label: text('What is measured'), value: { type: 'number', minimum: 0, maximum: 100, description: 'Percent used' }, valueLabel: text('Such as 7.2 of 10 GB') }, required: ['label', 'value'] },
		Avatar: { doc: 'A person, or with a square an organisation', props: { name: text('Gives the initials'), size: oneOf(options('Avatar', 'size').map(Number)), shape: oneOf(options('Avatar', 'shape')) }, required: ['name'] },
		Quote: { doc: 'Words someone said', props: { text: text('The quote'), cite: text('Who said it'), variant: oneOf(options('Quote', 'variant')) }, required: ['text'] },
		TextField: { doc: 'Text to type', props: { label: text('Sentence case'), description: text('A hint under it'), placeholder: text('An example, never the label'), value: text('What it starts with'), isMultiline: { type: 'boolean' } }, required: ['label'] },
		Switch: { doc: 'A setting that takes effect straight away, with no Save, on its own. Several under a heading are a SwitchGroup', props: { label: text('The setting'), isSelected: { type: 'boolean' } }, required: ['label'] },
		Checkbox: { doc: 'One of several choices made together, or agreeing to something before a submit', props: { label: text('The choice'), isSelected: { type: 'boolean' } }, required: ['label'] },
		Select: { doc: 'Picks one of 6 to 15 options', props: { label: text('Sentence case'), options: { type: 'array', items: option, minItems: 2 }, selected: text('The id picked to start with') }, required: ['label', 'options'] },
		DatePicker: { doc: 'One date, such as a due date or a birthday. For a start and an end, a DateRangePicker', props: { label: text('Sentence case'), description: text('A hint under it'), value: day('The date it starts with'), minValue: day('The earliest it takes, such as today for a booking') }, required: ['label'] },
		DateRangePicker: { doc: 'A start and an end in one field, such as a stay or a report’s period. Never two DatePickers', props: { label: text('Sentence case'), description: text('A hint under it'), start: day('The first day it starts with'), end: day('The last day it starts with'), minValue: day('The earliest it takes') }, required: ['label'] },
		NumberField: { doc: 'A number to type or step, such as a quantity, a price or a percentage. For a rough value in a range, a Slider', props: { label: text('Sentence case'), description: text('A hint under it'), value: number('What it starts with'), minValue: number('The least it takes'), maxValue: number('The most it takes'), step: number('How far each step moves it'), format: oneOf(['plain', 'percent', 'currency'], 'percent takes 0.15 for 15%'), currency: text('An ISO code, such as GBP. Only with format currency') }, required: ['label'] },
		Slider: { doc: 'A rough value between two limits, dragged, such as volume or a price range. For an exact number, a NumberField', props: { label: text('Sentence case'), description: text('A hint under it'), value: number('What it starts with'), end: number('Makes it a range from value to end'), minValue: number('The low limit, 0 if left out'), maxValue: number('The high limit, 100 if left out'), step: number('How far it moves at a time'), format: oneOf(['plain', 'percent', 'currency'], 'percent takes 0.15 for 15%'), currency: text('An ISO code, such as GBP. Only with format currency') }, required: ['label'] },
		SearchField: { doc: 'A search over the view, above the list or table it searches', props: { label: text('Names it for a screen reader, such as Search invoices'), placeholder: text('What it searches, such as Search by name or email') }, required: ['label'] },
		ComboBox: { doc: 'Picks one of many options, more than 15, filtered by typing, such as a country or a person', props: { label: text('Sentence case'), description: text('A hint under it'), placeholder: text('An example, never the label'), options: { type: 'array', items: option, minItems: 2 }, selected: text('The id picked to start with') }, required: ['label', 'options'] },
		SwitchGroup: { doc: 'A few settings under one heading that take effect straight away, such as which emails to get on a settings screen: each a row with its label first and its switch at the end, with a line between. Several groups for several headings, such as Email and Push. Its label is the heading, so no Heading goes above it. Ticking options in a form that is sent is a CheckboxGroup', props: { label: text('The heading, such as Email, drawn as its section’s heading'), settings: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'object', properties: { id: text('Unique within the group'), name: text('The setting, in sentence case'), description: text('What it does, if the name doesn’t say, as a line under it'), isSelected: { type: 'boolean' } }, required: ['id', 'name'], additionalProperties: false } } }, required: ['label', 'settings'] },
		CheckboxGroup: { doc: 'Picks any of 2 to 8 options, all in view, under one label, such as which emails to get', props: { label: text('Sentence case'), description: text('A hint under it'), options: { type: 'array', items: option, minItems: 2, maxItems: 8 }, selected: { type: 'array', items: text('An option’s id'), description: 'The ids ticked to start with' } }, required: ['label', 'options'] },
		ToggleButtonGroup: { doc: 'A segmented control: 2 to 5 views or modes of the same thing, switched straight away, such as List and Board, or Week and Month. Picking one of a form’s fields is a RadioGroup', props: { label: text('Names it for a screen reader'), options: { type: 'array', items: option, minItems: 2, maxItems: 5 }, selected: text('The id picked to start with, the first if left out'), size: oneOf(options('ToggleButtonGroup', 'size')), width: oneOf(options('ToggleButtonGroup', 'width'), 'fill to span its container, as on a phone') }, required: ['label', 'options'] },
		TimeField: { doc: 'A time of day, such as an opening time or a reminder', props: { label: text('Sentence case'), description: text('A hint under it'), value: time('The time it starts with') }, required: ['label'] },
		TagGroup: { doc: 'Short labels on a record, such as skills or topics, or with selectionMode multiple, filters to toggle above a list', props: { label: text('Sentence case'), description: text('A hint under it'), tags: { type: 'array', items: option, minItems: 1 }, selectionMode: oneOf(['none', 'single', 'multiple'], 'none for labels to read, multiple for filters'), selected: { type: 'array', items: text('A tag’s id'), description: 'The ids chosen to start with' } }, required: ['label', 'tags'] },
		DropZone: { doc: 'Somewhere to drop files to upload, with a button to choose them as well', props: { label: text('What to drop, such as Drop your logo here'), button: text('Such as Choose a file'), isMultiple: { type: 'boolean', description: 'Takes several files' }, types: { type: 'array', items: text('A MIME type, such as image/png'), description: 'The kinds of file it takes' } }, required: ['label'] },
		Link: { doc: 'Words that take you somewhere, in a sentence or a list, such as View all invoices. Something that changes data is a Button', props: { text: text('Says where it goes'), action: text('Sent back to you as the next message when it is pressed') }, required: ['text'] },
		Breadcrumbs: { doc: 'Where a page sits, as a trail up to it, over the page heading. Only for pages two or more levels deep', props: { trail: { type: 'array', minItems: 2, items: text('A page’s name'), description: 'From the top down. The last is the page you’re on' } }, required: ['trail'] },
		Pagination: { doc: 'Pages of a long list or table, under it', props: { page: { type: 'integer', minimum: 1, description: 'The page it starts on' }, count: { type: 'integer', minimum: 2, description: 'How many pages there are' } }, required: ['page', 'count'] },
		Menu: { doc: 'More actions than fit, behind one button, such as a page’s Export, Duplicate and Delete. Two or three actions that fit go as Buttons. A table row’s actions go in the row’s own actions', props: { label: text('The button’s words, such as More, or Actions'), variant: oneOf(options('Button', 'variant'), 'secondary or ghost; never primary'), actions: { type: 'array', minItems: 2, items: menuAction } }, required: ['label', 'actions'] },
		GridList: { doc: 'Items to scan and open, such as projects, files or notifications, each with a line under it and an end to say where it’s up to. Records with several fields to compare are a Table', props: { label: text('Names the list for a screen reader'), layout: oneOf(options('GridList', 'layout'), 'grid for tiles, stack for rows'), items: { type: 'array', minItems: 1, items: { type: 'object', properties: { id: text('Unique'), title: text('Its name'), description: text('A line under it, such as when it changed'), status: { $ref: '#/$defs/status' }, action: text('Sent back to you as the next message when it is opened') }, required: ['id', 'title'], additionalProperties: false } }, empty: text('What it says when there are no items') }, required: ['label', 'items'] },
		AvatarGroup: { doc: 'The people on something, such as a project’s members, overlapping in a row', props: { names: { type: 'array', minItems: 2, items: text('A person’s name') }, maxVisible: { type: 'integer', minimum: 2, description: 'How many show before a count of the rest' }, size: oneOf(options('AvatarGroup', 'size').map(Number)) }, required: ['names'] },
		Disclosure: { doc: 'A section that opens and closes under its title, such as an FAQ answer or advanced settings. Several in a row make an accordion', props: { title: text('Sentence case, such as Advanced settings'), isExpanded: { type: 'boolean', description: 'Open to start with' } }, required: ['title'], children: true },
		Code: { doc: 'Code to copy, such as how to install or use something', props: { code: text('The code, with real line breaks'), title: text('Such as the file name, or Terminal') }, required: ['code'] },
		Dialog: { doc: 'Something to confirm or fill in over the page, opened by a button, such as Delete project or Invite someone. Its children are what it holds; the dialog’s own buttons are cancel and confirm', props: { trigger: { $ref: '#/$defs/button' }, heading: text('Sentence case, such as Delete this project?'), confirm: text('Says what happens, such as Delete project'), tone: oneOf(['default', 'danger'], 'danger when confirming deletes or can’t be undone'), action: text('Sent back to you as the next message when it is confirmed'), cancel: text('Cancel if left out'), size: oneOf(options('Modal', 'size').filter((size) => size !== 'full'), 'medium, the default, for a confirmation or a short form. small only for a sentence with one-word buttons, as two buttons that say what happens fill it. large for a long form') }, required: ['trigger', 'heading', 'confirm'], children: true },
		RadioGroup: { doc: 'Picks one of 2 to 5 options, all in view', props: { label: text('Sentence case'), options: { type: 'array', items: option, minItems: 2, maxItems: 5 }, selected: text('The id picked to start with') }, required: ['label', 'options'] },
		Table: {
			doc: 'Records with several fields to compare. Its own box, so never in a Card',
			props: {
				label: text('Names the table for a screen reader'),
				density: oneOf(options('Table', 'density')),
				variant: oneOf(options('Table', 'variant'), 'raised among other things, flush when the table is the whole view'),
				columns: { type: 'array', minItems: 1, items: { type: 'object', properties: { id: text('Unique'), name: text('Sentence case'), align: oneOf(options('Column', 'align'), 'end for numbers and amounts, which are drawn with tabular figures'), isRowHeader: { type: 'boolean', description: 'The column that names each row. Exactly one' } }, required: ['id', 'name'], additionalProperties: false } },
				rows: { type: 'array', items: { type: 'object', properties: { id: text('Unique'), cells: { type: 'array', description: 'One per column, in order', items: { anyOf: [{ type: 'string' }, { type: 'number' }, { $ref: '#/$defs/status' }] } }, actions: { type: 'array', minItems: 1, items: menuAction, description: 'What can be done to this row, such as Change role and Remove, in a menu at its end. Not a column of buttons' } }, required: ['id', 'cells'], additionalProperties: false } },
				empty: text('What the table says when there are no rows'),
			},
			required: ['label', 'columns', 'rows'],
		},
		Tabs: { doc: 'Panels of one subject, one at a time', props: { label: text('Names the tabs for a screen reader'), tabs: { type: 'array', minItems: 2, items: { type: 'object', properties: { id: text('Unique'), name: text('Sentence case'), content: node }, required: ['id', 'name', 'content'], additionalProperties: false } } }, required: ['label', 'tabs'] },
	};
}

// A block in the tree can read its props from the view's values, and be shown or hidden by one. A Status in a table's
// cells, or an EmptyState's button, keeps to fixed props, as the controls follow only the tree's own blocks
const schemaOf = (type: string, block: Block, isBindable = false): Schema => ({
	type: 'object',
	description: block.doc,
	properties: {
		type: { const: type },
		...(isBindable ? Object.fromEntries(Object.entries(block.props).map(([key, prop]) => [key, { anyOf: [prop, bound] }])) : block.props),
		...(isBindable && { when: text('The name of a true-or-false value: the block shows only while it is true') }),
		...(block.children && { children: { type: 'array', items: node } }),
	},
	required: ['type', ...(block.required ?? [])],
	additionalProperties: false,
});

/** render_ui's input schema: { ui: a block }, each block one of the catalogue's, and the values and controls to tweak it */
export function inputSchemaOf(blocks: Record<string, Block>): Schema {
	return {
		type: 'object',
		properties: {
			ui: node,
			summary: text('One sentence on what the view shows, for the conversation'),
			title: text('A few words naming the view, on the bar over it, such as Password reset'),
			values: { type: 'object', description: 'Only with controls. Named values, each a number, a string or true or false, set to what the view starts with. A prop reads one with {"$value": name}' },
			controls: {
				type: 'array',
				description: 'Only when asked for controls, or to tweak or adjust a view. Groups of controls, each moving one value. What kind of control it is, and its range, come from the props that read the value',
				items: {
					type: 'object',
					properties: {
						group: text('Sentence case, such as Spacing'),
						items: { type: 'array', minItems: 1, items: { type: 'object', properties: { label: text('Sentence case, such as Between sections'), value: text('A name in values') }, required: ['label', 'value'], additionalProperties: false } },
					},
					required: ['group', 'items'],
					additionalProperties: false,
				},
			},
		},
		required: ['ui', 'summary'],
		$defs: {
			node: { anyOf: Object.entries(blocks).map(([type, block]) => schemaOf(type, block, true)) },
			bound: { type: 'object', description: 'Reads a value from values, which a control can change', properties: { $value: text('A name in values') }, required: ['$value'], additionalProperties: false },
			status: schemaOf('Status', blocks.Status),
			button: schemaOf('Button', blocks.Button),
			cardButton: schemaOf('Button', blocks.Button, true),
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
		const named = type !== undefined && branches.find((branch) => (branch.properties as Record<string, Schema> | undefined)?.type?.const === type);
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
	if (typeof schema.pattern === 'string' && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) return errors.push(`${at}: ${JSON.stringify(value)} should be ${/, as (.+)$/.exec(String(schema.description))?.[1] ?? `like ${schema.pattern}`}`);
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
			else if (schema.additionalProperties === false) errors.push(`${at}: takes no ${key}${key === 'className' || key === 'style' ? ', as every block is drawn with Loupe’s tokens' : `, only ${Object.keys(properties).join(', ')}`}`);
		}
	}
}

// What a schema can't say: rules from the Loupe skill, and ids that must match up
function rules(ui: Node, errors: string[]) {
	let primaries = 0;
	const visit = (item: Node, at: string) => {
		if (!item || typeof item !== 'object') return;
		if ((item.type === 'Button' && item.variant === 'primary') || (item.type === 'EmptyState' && (item.action as Node | undefined)?.variant === 'primary') || (item.type === 'Dialog' && (item.trigger as Node | undefined)?.variant === 'primary')) primaries++;
		if (item.type === 'Table') {
			const columns = (item.columns as { id: string; isRowHeader?: boolean }[]) ?? [];
			const headers = columns.filter((column) => column.isRowHeader).length;
			if (headers !== 1) errors.push(`${at}: needs exactly one column with isRowHeader, not ${headers}`);
			((item.rows as { cells: unknown[] }[]) ?? []).forEach((row, index) => {
				if (row.cells?.length !== columns.length) errors.push(`${at}.rows[${index}]: has ${row.cells?.length ?? 0} cells for ${columns.length} columns`);
			});
		}
		// What's picked to start with must be one of the ids it picks from
		const choices = (item.options ?? item.tags) as { id: string }[] | undefined;
		const picked = typeof item.selected === 'string' ? [item.selected] : Array.isArray(item.selected) ? (item.selected as unknown[]) : [];
		for (const id of picked) if (choices && !choices.some((o) => o.id === id)) errors.push(`${at}.selected: ${JSON.stringify(id)} isn't one of the ${item.tags ? 'tags' : 'options'}' ids`);
		const numbers = (...keys: string[]) => keys.map((key) => (typeof item[key] === 'number' ? (item[key] as number) : undefined));
		if (item.type === 'NumberField' || item.type === 'Slider') {
			const isSlider = item.type === 'Slider';
			const [value, end, min = isSlider ? 0 : undefined, max = isSlider ? 100 : undefined] = numbers('value', 'end', 'minValue', 'maxValue');
			if (min !== undefined && max !== undefined && min >= max) errors.push(`${at}: minValue ${min} isn't below maxValue ${max}`);
			for (const [key, n] of [['value', value], ['end', end]] as const) if (n !== undefined && ((min !== undefined && n < min) || (max !== undefined && n > max))) errors.push(`${at}.${key}: ${n} is outside ${min ?? '…'} to ${max ?? '…'}`);
			if (value !== undefined && end !== undefined && value > end) errors.push(`${at}: value ${value} is after end ${end}`);
			if (item.currency !== undefined && item.format !== 'currency') errors.push(`${at}: currency goes only with format currency`);
		}
		if (item.type === 'Pagination') {
			const [page, count] = numbers('page', 'count');
			if (page !== undefined && count !== undefined && page > count) errors.push(`${at}: page ${page} is past its count of ${count}`);
		}
		if (item.type === 'Split' && item.children?.length !== 2) errors.push(`${at}: holds exactly two blocks, the two columns in the order they sit, not ${item.children?.length ?? 0}`);
		// A line sits between two things, so one at either end of its group divides nothing
		const kids = (item.children as Node[] | undefined) ?? [];
		for (const [index, edge] of [[0, 'first'], [kids.length - 1, 'last']] as const) if (kids.length && kids[index]?.type === 'Separator') errors.push(`${at}.children[${index}]: a Separator goes between two things, so it's never ${edge} in its group`);
		if (item.type === 'Menu' && item.variant === 'primary') errors.push(`${at}: a Menu's button is secondary or ghost, never primary`);
		// Dates as YYYY-MM-DD sort as text. A bound value is checked once it has one
		const dates = (...keys: string[]) => keys.map((key) => (typeof item[key] === 'string' ? (item[key] as string) : undefined));
		if (item.type === 'DateRangePicker') {
			const [start, end] = dates('start', 'end');
			if ((start === undefined) !== (end === undefined)) errors.push(`${at}: give both start and end, or neither`);
			if (start && end && start > end) errors.push(`${at}: start ${start} is after end ${end}`);
		}
		if (item.type === 'DatePicker' || item.type === 'DateRangePicker') {
			const [value, start, min] = dates('value', 'start', 'minValue');
			const first = value ?? start;
			if (first && min && first < min) errors.push(`${at}: starts on ${first}, before its minValue ${min}`);
		}
		for (const key of ['options', 'columns', 'rows', 'tabs', 'tags', 'items'] as const) {
			// A Grid's columns is a count, not a list
			const list = item[key];
			if (!Array.isArray(list)) continue;
			const ids = (list as { id: string }[]).map((entry) => entry?.id);
			const repeated = ids.find((id, index) => ids.indexOf(id) !== index);
			if (repeated !== undefined) errors.push(`${at}.${key}: the id ${JSON.stringify(repeated)} is used twice`);
		}
		if (item.type === 'Card') {
			const inside = (child: Node): boolean => child?.type === 'Table' || (child?.children ?? []).some(inside);
			if (inside(item)) errors.push(`${at}: a Table is its own box, so it never goes in a Card`);
		}
		item.children?.forEach((child, index) => visit(child, `${at}.children[${index}]`));
		(item.tabs as { content: Node }[] | undefined)?.forEach((tab, index) => visit(tab.content, `${at}.tabs[${index}].content`));
		if (item.type === 'Card') (item.actions as Node[] | undefined)?.forEach((action, index) => visit(action, `${at}.actions[${index}]`));
	};
	visit(ui, 'ui');
	if (primaries > 1) errors.push(`ui: has ${primaries} primary buttons. One at most, so the view has one next step`);
}

export type Values = Record<string, string | number | boolean>;

/** What a control is, from the props that read its value */
export type Control =
	| { kind: 'slider'; steps?: number[]; min: number; max: number; scale: number; unit?: 'px' }
	| { kind: 'choice'; options: string[] }
	| { kind: 'switch' }
	| { kind: 'text' };

export interface Panel {
	group: string;
	items: { label: string; value: string; control: Control }[];
}

interface Input {
	ui: Node;
	summary?: string;
	title?: string;
	values?: Values;
	controls?: { group: string; items: { label: string; value: string }[] }[];
}

const isBound = (value: unknown): value is { $value: string } => typeof value === 'object' && value !== null && !Array.isArray(value) && typeof (value as { $value?: unknown }).$value === 'string';

// What a prop takes, as a control: numbers from a set on a slider that snaps to them, a few words as a choice, a
// number between limits on a slider, true or false on a switch, and words in a field. A gap is shown in pixels
function controlOf(key: string, prop: Schema): Control | undefined {
	if (Array.isArray(prop.enum)) {
		if (prop.enum.every((item) => typeof item === 'number')) {
			const steps = (prop.enum as number[]).toSorted((a, b) => a - b);
			const scale = key === 'gap' ? 4 : 1;
			return { kind: 'slider', steps, min: steps[0], max: steps.at(-1)!, scale, unit: key === 'gap' || key === 'size' ? 'px' : undefined };
		}
		return { kind: 'choice', options: prop.enum.map(String) };
	}
	if (prop.type === 'number' || prop.type === 'integer') return { kind: 'slider', min: typeof prop.minimum === 'number' ? prop.minimum : 0, max: typeof prop.maximum === 'number' ? prop.maximum : 100, scale: 1 };
	if (prop.type === 'boolean') return { kind: 'switch' };
	if (prop.type === 'string') return { kind: 'text' };
}

// Two props reading one value: the control is what both take, such as the gap steps they share
function merge(a: Control, b: Control): Control | undefined {
	if (a.kind !== b.kind) return;
	if (a.kind === 'choice' && b.kind === 'choice') {
		const options = a.options.filter((option) => b.options.includes(option));
		return options.length > 1 ? { kind: 'choice', options } : undefined;
	}
	if (a.kind === 'slider' && b.kind === 'slider') {
		if (a.steps || b.steps) {
			const steps = (a.steps ?? b.steps!).filter((step) => (b.steps ?? a.steps!).includes(step));
			return steps.length > 1 && a.scale === b.scale ? { ...a, steps, min: steps[0], max: steps.at(-1)! } : undefined;
		}
		return { ...a, min: Math.max(a.min, b.min), max: Math.min(a.max, b.max) };
	}
	return a;
}

const fits = (control: Control, value: unknown) =>
	control.kind === 'slider' ? typeof value === 'number' && (control.steps ? control.steps.includes(value) : value >= control.min && value <= control.max) : control.kind === 'choice' ? control.options.includes(value as string) : control.kind === 'switch' ? typeof value === 'boolean' : typeof value === 'string';

/**
 * The controls a view comes with, each with what it is, from the props that read its value. Errors where a value is
 * read by props that can't share one control, or isn't one of those props' own, or a control names no value
 */
export function panelOf(input: Input, schema: Schema, errors: string[] = []): Panel[] {
	const values = input.values ?? {};
	const blocks = new Map(((schema.$defs as Record<string, Schema>).node.anyOf as Schema[]).map((branch) => {
		const properties = branch.properties as Record<string, Schema>;
		return [properties.type.const as string, properties];
	}));
	const controls = new Map<string, Control>();
	const read = (name: string, control: Control | undefined, at: string) => {
		if (!(name in values)) return errors.push(`${at}: reads ${JSON.stringify(name)}, which isn't in values`);
		if (!control) return errors.push(`${at}: can't be set from a control`);
		const was = controls.get(name);
		const both = was ? merge(was, control) : control;
		if (!both) return errors.push(`${at}: reads ${JSON.stringify(name)}, which other props read as something else. Give each its own value`);
		controls.set(name, both);
	};
	const visit = (item: Node, at: string) => {
		if (!item || typeof item !== 'object') return;
		const properties = blocks.get(item.type);
		for (const [key, value] of Object.entries(item)) {
			if (key === 'when' && typeof value === 'string') read(value, { kind: 'switch' }, `${at}.when`);
			else if (isBound(value)) {
				const prop = (properties?.[key]?.anyOf as Schema[] | undefined)?.[0];
				read(value.$value, prop && controlOf(key, prop), `${at}.${key}`);
			}
		}
		item.children?.forEach((child, index) => visit(child, `${at}.children[${index}]`));
		(item.tabs as { content: Node }[] | undefined)?.forEach((tab, index) => visit(tab.content, `${at}.tabs[${index}].content`));
		if (item.type === 'Card') (item.actions as Node[] | undefined)?.forEach((action, index) => visit(action, `${at}.actions[${index}]`));
	};
	visit(input.ui, 'ui');
	for (const [name, control] of controls) if (!fits(control, values[name])) errors.push(`values.${name}: ${JSON.stringify(values[name])} doesn't suit what reads it${control.kind === 'slider' && control.steps ? `, which takes ${control.steps.join(', ')}` : control.kind === 'choice' ? `, which takes ${control.options.join(', ')}` : ''}`);
	for (const name of Object.keys(values)) if (!controls.has(name)) errors.push(`values.${name}: nothing reads it`);
	return (input.controls ?? []).map((group, at) => ({
		group: group.group,
		items: group.items.flatMap((item, index) => {
			const control = controls.get(item.value);
			if (!control) {
				errors.push(`controls[${at}].items[${index}]: ${JSON.stringify(item.value)} isn't a value any prop reads`);
				return [];
			}
			return [{ ...item, control }];
		}),
	}));
}

/** The tree as it is with these values: each read prop takes its value, and a block whose when is off is left out */
export function resolve(ui: Node, values: Values): Node | undefined {
	if (typeof ui.when === 'string' && values[ui.when] === false) return undefined;
	const node = Object.fromEntries(Object.entries(ui).filter(([key]) => key !== 'when').map(([key, value]) => [key, isBound(value) ? values[value.$value] : value])) as Node;
	if (node.children) node.children = node.children.map((child) => resolve(child, values)).filter((child): child is Node => child !== undefined);
	if (node.type === 'Card' && Array.isArray(node.actions)) node.actions = (node.actions as Node[]).map((action) => resolve(action, values)).filter((action): action is Node => action !== undefined);
	if (Array.isArray(node.tabs)) node.tabs = (node.tabs as { content: Node }[]).map((tab) => ({ ...tab, content: resolve(tab.content, values) ?? { type: 'Stack' } }));
	return node;
}

/** Why a tree can't be drawn, as lines Claude can act on, or none */
export function validate(input: unknown, schema: Schema): string[] {
	const errors: string[] = [];
	check(input, schema, 'input', schema.$defs as Record<string, Schema>, errors);
	if (errors.length) return errors;
	const given = input as Input;
	panelOf(given, schema, errors);
	if (given.controls?.length && !given.values) errors.push('input: has controls but no values for them to move');
	// The rules hold for the view as it starts, with its values in place
	if (!errors.length) rules(resolve(given.ui, given.values ?? {}) ?? given.ui, errors);
	return errors;
}
