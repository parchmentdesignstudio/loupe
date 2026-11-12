import { type ReactNode, createContext, useContext } from 'react';
import {
	DropZone as AriaDropZone,
	type DropZoneProps as AriaDropZoneProps,
	type DragTypes,
	type DropOperation,
	FileTrigger as AriaFileTrigger,
	type FileTriggerProps,
	ButtonContext,
	Text,
	composeRenderProps,
} from 'react-aria-components';
import { focusRing, tv } from './tv.js';

export { isFileDropItem, type FileTriggerProps } from 'react-aria-components';

// A FileTrigger in a DropZone offers the same types the zone takes
const AcceptedContext = createContext<string[] | undefined>(undefined);

/** Opens the file picker from the Button inside it. In a DropZone, it takes the zone's acceptedFileTypes unless given its own */
export function FileTrigger(props: FileTriggerProps) {
	const accepted = useContext(AcceptedContext);
	return <AriaFileTrigger acceptedFileTypes={accepted} {...props} />;
}

// Relative, so React Aria's hidden drop button stays inside. Otherwise focusing it can scroll the whole page
export const dropZone = tv({
	extend: focusRing,
	base: 'relative',
	variants: {
		variant: {
			dashed: 'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-bleed/16 p-6 text-center text-label text-muted transition-colors duration-150 ease-out motion-reduce:transition-none',
			quiet: '',
		},
		isDropTarget: {
			true: '',
		},
		isDisabled: {
			true: 'opacity-40',
		},
	},
	compoundVariants: [
		{ variant: 'dashed', isDropTarget: true, class: 'border-solid border-ink bg-bleed/4 text-ink' },
		// A quiet zone fills its panel, so its rings sit inside the edges rather than outside, where they'd be cut off
		{ variant: 'quiet', isFocusVisible: true, class: '-outline-offset-8' },
		{ variant: 'quiet', isDropTarget: true, class: 'outline-2 -outline-offset-8 outline-dashed' },
	],
	defaultVariants: {
		variant: 'dashed',
	},
});

export interface DropZoneProps extends AriaDropZoneProps {
	/** Dashed, a box that says it takes files, or quiet, for a panel or canvas that shows it's taking them only as they're dragged over */
	variant?: 'dashed' | 'quiet';
	/** What to drop here, shown in the zone and read out for its drop button. A quiet zone takes an aria-label instead */
	label?: ReactNode;
	/** The types it takes, as an input's accept has them: image/png, image/* or .pdf. A drag of anything else isn't
	 * taken, and a FileTrigger inside offers only these */
	acceptedFileTypes?: string[];
}

/** Somewhere to drop files, or paste them from its drop button. A FileTrigger inside offers the file picker too */
export function DropZone({ variant, label, acceptedFileTypes, ...props }: DropZoneProps) {
	// A drag only says what type each file is, image/png say, so an extension such as .pdf can't be checked until the
	// drop. With one in the list, any drag is taken
	const types = acceptedFileTypes?.some((type) => type.startsWith('.')) ? undefined : acceptedFileTypes;
	const getDropOperation = props.getDropOperation ?? (types ? (dragTypes: DragTypes, allowed: DropOperation[]) => (dragTypes.has(types) ? allowed[0] : 'cancel') : undefined);
	return (
		<AriaDropZone {...props} getDropOperation={getDropOperation} className={composeRenderProps(props.className, (className, state) => dropZone({ ...state, variant, className }))}>
			{composeRenderProps(props.children, (children) => (
				<AcceptedContext.Provider value={acceptedFileTypes}>
					{/* A quiet zone has no visible label, and an empty one would still be read out */}
					{variant !== 'quiet' && label != null && label !== '' && <Text slot="label">{label}</Text>}
					{/* Disabled, the zone disables the buttons in it too, such as a FileTrigger's */}
					{props.isDisabled ? <ButtonContext.Provider value={{ isDisabled: true }}>{children}</ButtonContext.Provider> : children}
				</AcceptedContext.Provider>
			))}
		</AriaDropZone>
	);
}
