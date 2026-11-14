import { Header as AriaHeader, type HeaderProps } from 'react-aria-components';
import { tv } from './tv.js';

export const header = tv({
	base: 'px-3 pt-2 pb-1 font-mono text-label text-muted',
});

/** A section’s heading, as the first thing in a ListBoxSection or MenuSection */
export function Header(props: HeaderProps) {
	return <AriaHeader {...props} className={header({ className: props.className })} />;
}
