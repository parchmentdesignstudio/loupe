import type { ReactNode } from 'react';
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, type CheckboxGroupProps as AriaCheckboxGroupProps, type CheckboxProps, composeRenderProps } from 'react-aria-components';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { composeClassName, focusRing, tv } from './tv.js';

// A choice and its label. The label is part of what's pressed, so it's a large target
// Relative, so React Aria's hidden input stays inside the label. Otherwise focusing it can scroll the whole page. The box
// centres on the label's first line, so it stays put when the label wraps
export const choice = tv({
	base: 'group relative flex cursor-default items-start gap-3 py-1 text-control text-ink [-webkit-tap-highlight-color:transparent]',
	variants: {
		// Muted rather than faded, as a disabled button is, with each control going flat
		isDisabled: {
			true: 'text-muted',
		},
	},
});

// The box stays white whether it's ticked or not, and the tick draws itself in, so the mark alone says it's chosen
export const box = tv({
	extend: focusRing,
	base: 'my-[calc((1lh-1.25rem)/2)] flex size-5 shrink-0 items-center justify-center rounded-md bg-raised text-ink shadow-raised transition-[scale] duration-150 ease-out motion-reduce:transition-none',
	variants: {
		isPressed: {
			true: 'scale-90',
		},
		isInvalid: {
			true: 'text-danger shadow-invalid',
		},
		isDisabled: {
			true: 'bg-bleed/12 text-muted shadow-none',
		},
	},
});

// The tick comes into focus as it grows from three-quarters size, and goes quicker than it came
const mark = tv({
	base: 'size-4 shrink-0 fill-none stroke-current stroke-[1.5] motion-reduce:transition-none',
	variants: {
		isSelected: {
			false: 'scale-75 opacity-0 blur-[3px] transition-[scale,opacity,filter] duration-100 ease-in',
			true: 'transition-[scale,opacity,filter] duration-200 ease-out',
		},
	},
});

/** A checkbox with its label as children. isIndeterminate shows a dash, for a parent of others that are mixed */
export function Checkbox(props: CheckboxProps) {
	return (
		<AriaCheckbox {...props} className={composeRenderProps(props.className, (className, state) => choice({ ...state, className }))}>
			{composeRenderProps(props.children, (children, { isSelected, isIndeterminate, ...state }) => (
				<>
					<span className={box(state)}>
						{/* One svg for the tick and the dash, so going from none to some chosen animates as going to all does */}
						<svg aria-hidden="true" viewBox="0 0 16 16" className={mark({ isSelected: isSelected || isIndeterminate })}>
							{isIndeterminate ? <path d="M4 8h8" strokeLinecap="round" /> : <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />}
						</svg>
					</span>
					{children}
				</>
			))}
		</AriaCheckbox>
	);
}

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children'>, FieldTextProps {
	children?: ReactNode;
}

/** Checkboxes under one label, sent as one field */
export function CheckboxGroup({ label, description, errorMessage, children, ...props }: CheckboxGroupProps) {
	return (
		<AriaCheckboxGroup {...props} className={composeClassName(props.className, 'flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<div className="flex flex-col">{children}</div>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaCheckboxGroup>
	);
}
