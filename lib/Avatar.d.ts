import { type HTMLAttributes, type ReactNode } from 'react';
export declare const avatar: import("tailwind-variants").TVReturnType<{
    size: {
        '20': {
            base: string;
            face: string;
        };
        '24': {
            base: string;
            face: string;
        };
        '32': {
            base: string;
            face: string;
        };
        '48': {
            base: string;
            face: string;
        };
        '64': {
            base: string;
            face: string;
        };
    };
    shape: {
        circle: {
            base: string;
        };
        square: string;
    };
    status: {
        online: {
            dot: string;
        };
        away: {
            dot: string;
        };
        busy: {
            dot: string;
        };
    };
    isCount: {
        false: string;
        true: string;
    };
    isLoaded: {
        true: {
            image: string;
        };
    };
    isGrouped: {
        true: {
            face: string;
        };
    };
}, {
    base: string;
    face: string[];
    image: string[];
    dot: string[];
}, undefined, undefined, undefined, undefined>;
export type AvatarSize = 20 | 24 | 32 | 48 | 64;
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'away' | 'busy';
/** The tint a name always gets, the same on every visit, as a CSS variable from the palette */
export declare function avatarTint(name: string): string;
/**
 * The initials for a name: the first letters of its first and last words, or one letter when there's one word, the
 * avatar is small, the name opens with an emoji, or it's written in Chinese, Japanese or Korean
 */
export declare function initials(name: string, { max }?: {
    max?: 1 | 2;
}): string;
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** Whose avatar it is. It names the avatar for screen readers, and gives the initials and the tint behind them */
    name: string;
    /** A photo or logo. The initials show until it loads, and stay if it fails */
    src?: string;
    /** In pixels. 20 sits on a line of text with one initial, and 32 matches a button. In a group, the group sets it */
    size?: AvatarSize;
    /** A circle for a person, a square for an organisation or project */
    shape?: AvatarShape;
    /** A dot on the edge, read out after the name */
    status?: AvatarStatus;
    /** The status as read out, in place of “online”, “away” or “busy” */
    statusLabel?: string;
}
/** A person, as a round photo, or an organisation or project, as a square one, with their initials on a tint until the photo loads or if there isn’t one */
export declare function Avatar({ name, src, size, shape, status, statusLabel, className, style, ...props }: AvatarProps): import("react").JSX.Element;
export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Avatars, in the order they overlap */
    children: ReactNode;
    /** How many avatars to show. Past it, the last one shows how many more there are, as in +3 */
    max?: number;
    /** Every avatar's size, in pixels */
    size?: AvatarSize;
    /** Every avatar's shape */
    shape?: AvatarShape;
}
export declare const avatarGroup: import("tailwind-variants").TVReturnType<{}, undefined, "inline-flex items-center align-top *:not-first:-ms-[calc(var(--avatar-size)/6)]", undefined, undefined, undefined>;
/**
 * Avatars overlapping in a row, each parted from the next by a ring in the colour of what it sits on: set
 * --avatar-ring to that colour off the panel. It's named for screen readers by the people in it, as in “Sam Smith,
 * Alex Lee and 3 others”, or by an aria-label
 */
export declare function AvatarGroup({ children, max, size, shape, className, ...props }: AvatarGroupProps): import("react").JSX.Element;
