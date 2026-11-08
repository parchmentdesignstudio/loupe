import type { ReactNode } from 'react';
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup, type RadioGroupProps as AriaRadioGroupProps, type RadioProps, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { composeClassName, focusRing, tv } from './tv.js';

const dot = tv({
	extend: focusRing,
	base: 'flex size-5 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-150 ease-out motion-reduce:transition-none',
	variants: {
		isSelected: {
			false: 'bg-paper shadow-raised',
			true: 'bg-ink',
		},
		isHovered: {
			true: '',
		},
		isPressed: {
			true: 'scale-90',
		},
		isInvalid: {
			true: '',
		},
	},
	compoundVariants: [
		{ isSelected: false, isHovered: true, class: 'bg-surface' },
		{ isSelected: true, isHovered: true, class: 'bg-ink/88' },
		{ isSelected: false, isInvalid: true, class: 'shadow-[0_0_0_1px_var(--color-danger)]' },
		{ isSelected: true, isInvalid: true, class: 'bg-danger' },
	],
});

/** One option in a RadioGroup, with its label as children */
export function Radio(props: RadioProps) {
	return (
		<AriaRadio {...props} className={composeRenderProps(props.className, (className, state) => choice({ ...state, className }))}>
			{composeRenderProps(props.children, (children, state) => (
				<>
					<span className={dot(state)}>{state.isSelected && <span className="size-2 rounded-full bg-paper" />}</span>
					{children}
				</>
			))}
		</AriaRadio>
	);
}

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'>, FieldTextProps {
	children?: ReactNode;
}

/** Options where only one can be chosen. Set orientation to horizontal to lay them in a row */
export function RadioGroup({ label, description, errorMessage, children, ...props }: RadioGroupProps) {
	return (
		<AriaRadioGroup {...props} className={composeClassName(props.className, 'group flex flex-col gap-1.5')}>
			{label && <Label>{label}</Label>}
			<div className="flex flex-col group-data-[orientation=horizontal]:flex-row group-data-[orientation=horizontal]:flex-wrap group-data-[orientation=horizontal]:gap-x-6">{children}</div>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaRadioGroup>
	);
}
