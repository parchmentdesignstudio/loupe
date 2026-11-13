import type { ReactNode } from 'react';
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup, type RadioGroupProps as AriaRadioGroupProps, type RadioProps, composeRenderProps } from 'react-aria-components';
import { choice } from './Checkbox.js';
import { Description, FieldError, type FieldTextProps, Label } from './Field.js';
import { composeClassName, focusRing, tv } from './tv.js';

// White whether chosen or not, as a checkbox is, with an ink dot that grows in when it's chosen
const dot = tv({
	slots: {
		base: 'my-[calc((1lh-1.25rem)/2)] flex size-5 shrink-0 items-center justify-center rounded-full bg-raised shadow-raised transition-[scale] duration-150 ease-out motion-reduce:transition-none',
		mark: 'size-2 rounded-full bg-ink transition-[scale] motion-reduce:transition-none',
	},
	variants: {
		isSelected: {
			false: { mark: 'scale-0 duration-100 ease-in' },
			true: { mark: 'scale-100 duration-200 ease-out' },
		},
		isPressed: {
			true: { base: 'scale-90' },
		},
		isInvalid: {
			true: { base: 'shadow-invalid', mark: 'bg-danger' },
		},
		isDisabled: {
			true: { base: 'bg-bleed/12 shadow-none', mark: 'bg-muted' },
		},
	},
});

/** One option in a RadioGroup, with its label as children */
export function Radio(props: RadioProps) {
	return (
		<AriaRadio {...props} className={composeRenderProps(props.className, (className, state) => choice({ ...state, className }))}>
			{composeRenderProps(props.children, (children, state) => {
				const styles = dot(state);
				return (
					<>
						<span className={styles.base({ className: focusRing({ isFocusVisible: state.isFocusVisible }) })}>
							<span className={styles.mark()} />
						</span>
						{children}
					</>
				);
			})}
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
