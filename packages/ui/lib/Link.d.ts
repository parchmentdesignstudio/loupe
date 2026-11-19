import { type LinkProps } from 'react-aria-components';
export declare const link: import("tailwind-variants").TVReturnType<{
    isHovered: {
        true: string;
    };
    isCurrent: {
        true: string;
    };
    isDisabled: {
        true: string;
    };
}, undefined, "rounded-sm text-ink underline decoration-(color:--underline) underline-offset-(--link-underline-offset) [--underline:var(--link-underline,color-mix(in_oklab,var(--color-ink)_32%,transparent))] transition-[text-decoration-color] duration-150 ease-out motion-reduce:transition-none", {
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, import("tailwind-variants").TVReturnType<{
    isFocusVisible: {
        false: string;
        true: string;
    };
}, undefined, "outline-offset-2 outline-ink forced-colors:outline-[Highlight] data-[show-focus]:outline-2", undefined, undefined, undefined>>;
export type { LinkProps };
/** A link to another page, or a place on this one. aria-current="page" marks the page you’re on */
export declare function Link(props: LinkProps): import("react").JSX.Element;
