import { field, isFileDropItem, type DropZoneProps } from '@parchment/ui'

/** A field’s label, for a control without one of its own */
export const fieldLabel = field().label()

/** The checkerboard behind artwork, so transparency shows */
export const checker = 'bg-[repeating-conic-gradient(color-mix(in_oklab,var(--bleed)_8%,var(--paper))_0_25%,var(--paper)_0_50%)] bg-size-[12px_12px]'

type DropEvent = Parameters<NonNullable<DropZoneProps['onDrop']>>[0]

/** The files among what was dropped on a DropZone */
export const filesFrom = (event: DropEvent) => Promise.all(event.items.filter(isFileDropItem).map((item) => item.getFile()))
