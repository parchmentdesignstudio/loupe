import { type ReactNode, useId } from 'react';
import { Button, ColorPicker as AriaColorPicker, type ColorPickerProps as AriaColorPickerProps, DialogTrigger } from 'react-aria-components';
import { ColorArea } from './ColorArea.js';
import { ColorField } from './ColorField.js';
import { ColorSlider } from './ColorSlider.js';
import { ColorSwatch } from './ColorSwatch.js';
import { Dialog } from './Dialog.js';
import { field } from './Field.js';
import { Popover } from './Popover.js';
import { trigger } from './Select.js';
import { tv } from './tv.js';

const colorPicker = tv({ base: 'flex flex-col gap-1.5' });

export interface ColorPickerProps extends Omit<AriaColorPickerProps, 'children'> {
	label?: ReactNode;
	/** Names it when there's no label */
	'aria-label'?: string;
	/** What the popover holds, in place of the colour area, hue slider and hex field */
	children?: ReactNode;
	className?: string;
}

/** A colour, shown as a swatch and its hex in a field-like button that opens a colour area, a hue slider and a hex field */
export function ColorPicker({ label, 'aria-label': ariaLabel = 'Colour', children, className, ...props }: ColorPickerProps) {
	const labelId = useId();
	const valueId = useId();
	return (
		<AriaColorPicker {...props}>
			{({ color }) => (
				<div className={colorPicker({ className })}>
					{label && (
						<span id={labelId} className={field().label()}>
							{label}
						</span>
					)}
					<DialogTrigger>
						<Button
							aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
							aria-label={label ? undefined : ariaLabel}
							aria-describedby={label ? undefined : valueId}
							// The swatch sits as far in from the edge as from the top, so it reads as part of the field
							className={(state) => trigger({ ...state, className: 'pl-2' })}
						>
							<ColorSwatch className="size-4 rounded-sm" />
							<span id={valueId} className="min-w-0 flex-1 truncate tabular-nums">
								{color.toString('hex')}
							</span>
						</Button>
						<Popover placement="bottom start" className="w-64">
							<Dialog aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : ariaLabel} className="flex flex-col gap-3">
								{children ?? (
									<>
										<ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
										<ColorSlider colorSpace="hsb" channel="hue" />
										<ColorField label="Hex" />
									</>
								)}
							</Dialog>
						</Popover>
					</DialogTrigger>
				</div>
			)}
		</AriaColorPicker>
	);
}
