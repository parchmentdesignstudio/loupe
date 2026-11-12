import { Button } from '../lib/Button.js';
import { Dialog as UiDialog, DialogActions, DialogHeading } from '../lib/Dialog.js';
import { TextField } from '../lib/TextField.js';

// The dialog's own surface, which a Modal or Popover holds, drawn open and in the flow
export function Dialog({ heading = 'Rename project', field = 'Name', value = 'Loupe', confirm = 'Save', cancel = 'Cancel' }: { heading?: string; field?: string; value?: string; confirm?: string; cancel?: string }) {
	return (
		<div className="w-96 overflow-hidden rounded-xl bg-paper shadow-overlay">
			<UiDialog>
				<DialogHeading>{heading}</DialogHeading>
				<TextField label={field} value={value} onChange={() => {}} className="mt-4" />
				<DialogActions>
					<Button variant="ghost">{cancel}</Button>
					<Button>{confirm}</Button>
				</DialogActions>
			</UiDialog>
		</div>
	);
}
