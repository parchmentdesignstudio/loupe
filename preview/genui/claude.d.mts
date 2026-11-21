/** Where the preview's chat asks Claude */
export const path: string;

/** Serves Claude for the preview's chat while it runs locally, with the key kept on the server */
export function claude(): { name: string };
