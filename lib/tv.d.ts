export declare const tv: import("tailwind-variants/config").TV<import("tailwind-variants/config").TVCustomConfig>;
/**
 * The focus ring every control shares, shown for keyboard focus only, through React Aria's isFocusVisible. Set
 * data-show-focus on a control to show its ring without focus, as a preview or a screenshot needs. Where the ring is
 * on something inside, such as a checkbox's box or a field, that shows it
 */
export declare const focusRing: import("tailwind-variants/config").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight] data-[show-focus]:outline-2", undefined, undefined, undefined>;
/** A className prop, a string or a function of React Aria's render props, merged over a component's own classes */
export declare function composeClassName<T>(className: string | ((values: T) => string) | undefined, own: string): string | ((values: T) => string);
