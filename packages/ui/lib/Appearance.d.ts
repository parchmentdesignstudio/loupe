export type Appearance = 'light' | 'auto' | 'dark';
export declare function setAppearance(appearance: Appearance): void;
/** Light, dark, or auto to follow the system, for the whole page, kept between visits. Every control using it stays in step */
export declare function useAppearance(): readonly [Appearance, typeof setAppearance];
