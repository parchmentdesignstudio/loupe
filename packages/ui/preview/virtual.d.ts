declare module 'virtual:details' {
	const details: import('./details.mjs').Details;
	export default details;
}
declare module 'virtual:highlighted-code' {
	/** Each Code playground sample as Shiki's HTML, by highlightKey */
	const highlighted: Partial<Record<string, string>>;
	export default highlighted;
}
