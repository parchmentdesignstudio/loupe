import { Menu as UiMenu, MenuItem, MenuSeparator } from '../lib/Menu.js';

// The menu's list, drawn open and in the flow
export function Menu({ first = 'Undo', second = 'Redo', third = 'Cut', fourth = 'Copy' }: { first?: string; second?: string; third?: string; fourth?: string }) {
	return (
		<div className="w-56 rounded-xl bg-paper p-1 shadow-overlay">
			<UiMenu aria-label="Edit">
				<MenuItem textValue={first}>{first}</MenuItem>
				<MenuItem textValue={second}>{second}</MenuItem>
				<MenuSeparator />
				<MenuItem textValue={third}>{third}</MenuItem>
				<MenuItem textValue={fourth}>{fourth}</MenuItem>
			</UiMenu>
		</div>
	);
}
