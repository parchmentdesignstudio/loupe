export declare function setOnOffLabels(isOn: boolean): void;
/** A | in a switch that's on and an O in one that's off, so its state doesn't rest on colour, as iOS's On/Off Labels.
 * For the whole page, kept between visits. They show anyway where the system asks for more contrast */
export declare function useOnOffLabels(): readonly [boolean, typeof setOnOffLabels];
