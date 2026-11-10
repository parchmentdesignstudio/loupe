import { type ReactNode } from 'react';
import './compiled/styles.css';

// Wraps every code layer, setting up the page as the preview does. It leaves out React Aria's RouterProvider,
// as links on the canvas go nowhere, and the library it comes from is what Elyx can't load yet (see README)
export function CodeLayerRoot({ children }: { children?: ReactNode }) {
	return <div className="font-sans text-body text-ink">{children}</div>;
}
