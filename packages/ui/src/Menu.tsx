import { Menu as AriaMenu, MenuItem as AriaMenuItem, type MenuItemProps as AriaMenuItemProps, type MenuProps as AriaMenuProps, MenuSection as AriaMenuSection, type MenuSectionProps, Separator, composeRenderProps } from 'react-aria-components';
import { Check, ChevronRight } from './glyphs.js';
import { option, section } from './ListBox.js';
import { Popover, type PopoverProps } from './Popover.js';
import { tv } from './tv.js';

export { MenuTrigger, SubmenuTrigger } from 'react-aria-components';
export type { MenuSectionProps };

export interface MenuProps<T> extends AriaMenuProps<T> {
	placement?: PopoverProps['placement'];
}

/** A menu of actions, opened by the Button beside it in a MenuTrigger */
export function Menu<T extends object>({ placement, ...props }: MenuProps<T>) {
	return (
		<Popover placement={placement} className="min-w-52">
			<AriaMenu {...props} className="max-h-[inherit] overflow-auto p-1.5 outline-0" />
		</Popover>
	);
}

const menuItem = tv({
	extend: option,
	variants: {
		variant: {
			default: '',
			danger: 'text-danger',
		},
	},
});

export interface MenuItemProps extends AriaMenuItemProps {
	/** danger for an action that destroys something */
	variant?: 'default' | 'danger';
}

export function MenuItem({ variant, ...props }: MenuItemProps) {
	const textValue = props.textValue ?? (typeof props.children === 'string' ? props.children : undefined);
	return (
		<AriaMenuItem {...props} textValue={textValue} className={composeRenderProps(props.className, (className, state) => menuItem({ ...state, variant, className }))}>
			{composeRenderProps(props.children, (children, { selectionMode, isSelected, hasSubmenu }) => (
				<>
					{selectionMode !== 'none' && <span className="flex size-4 shrink-0">{isSelected && <Check />}</span>}
					<span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
					{hasSubmenu && <ChevronRight className="size-4 shrink-0 fill-none stroke-current stroke-[1.5] text-muted" />}
				</>
			))}
		</AriaMenuItem>
	);
}

/** Menu items grouped under a Header, which goes first inside it */
export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
	return <AriaMenuSection {...props} className={section({ className: props.className })} />;
}

export function MenuSeparator() {
	return <Separator className="mx-3 my-1.5 border-b border-ink/8" />;
}
