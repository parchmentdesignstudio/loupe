import type { HTMLAttributes } from 'react';
import { tv } from './tv.js';

// The prose class is in styles/prose.css, so a site without React, such as one writing in Astro, sets it itself
const prose = tv({ base: 'prose' });

export type ProseProps = HTMLAttributes<HTMLDivElement>;

/** Writing at length as plain HTML, such as a post from Markdown or a CMS, set in Loupe's type with no classes inside */
export function Prose(props: ProseProps) {
	return <div {...props} className={prose({ className: props.className })} />;
}
