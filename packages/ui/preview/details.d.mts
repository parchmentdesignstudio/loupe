/** Serves virtual:details, what the preview shows of each export’s code */
export function details(): { name: string };

/** A place in the workspace’s code, as packages/ui/src/Button.tsx at 54:1 */
export interface Place {
	file: string;
	line: number;
	column: number;
}

export interface Prop {
	name: string;
	/** Its type as written, such as ReactNode */
	type?: string;
	/** A variant’s options, such as solid and quiet */
	options?: string[];
	/** Its default as written, such as 'medium' */
	default?: string;
	doc?: string;
	required?: boolean;
	/** The React Aria component a prop picked by name comes from */
	from?: string;
}

export interface Use extends Place {
	/** The package it’s in, such as device */
	project: string;
	/** Its file within the package’s src */
	path: string;
}

export type TokenKind = 'colours' | 'text' | 'fonts' | 'shadows' | 'corners' | 'animations';

export interface Detail {
	name: string;
	/** A component, a tv() style function, a class, another function or value, or one of React Aria’s, passed on as it is */
	kind: 'component' | 'styles' | 'class' | 'function' | 'value' | 'aria';
	place: Place;
	doc?: string;
	props?: Prop[];
	/** What else it takes: one of React Aria’s components’ props, or React’s, such as HTMLAttributes */
	rest?: { aria?: string; react?: string }[];
	/** The React Aria components it draws */
	aria?: string[];
	/** The library’s other components it draws */
	parts?: string[];
	states?: string[];
	/** The exported tv() style functions it uses, such as button */
	styles?: string[];
	tokens?: Partial<Record<TokenKind, string[]>>;
	uses: Use[];
}

/** A colour token, and the role in tokens.css it stands for */
export interface Colour {
	/** Its value, for a swatch, such as var(--color-ink) */
	value: string;
	/** Where tokens.css sets the role */
	place?: Place;
	/** What the role is set to, such as var(--color-pine-26), and in the dark when that differs, such as var(--color-cream-95) */
	light?: string;
	dark?: string;
}

export interface Details {
	/** The library’s own package, as a Use’s project, such as ui */
	project: string;
	components: Record<string, Detail>;
	colours: Record<string, Colour>;
}
