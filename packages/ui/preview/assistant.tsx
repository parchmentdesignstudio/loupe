import { Drawer } from '../src/index.js';
import { Chat, type Conversation } from './blocks/chat.js';

// Claude, in a drawer at the card's end, as the settings are, so what it's asked about stays in view beside it. Wide
// enough for a table it draws. The conversation is kept by the page, so it carries on however often it's closed. Below
// md, as a pushing drawer becomes one, it slides over the page instead. Only while the preview runs locally, as the key
// stays on the server
export function ChatDrawer({ isOpen, onOpenChange, conversation }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; conversation: Conversation }) {
	return (
		<div className="shrink-0 self-start [--drawer-push-fill:var(--color-panel)] [--drawer-push-width:32rem] [--ground-bleed:var(--panel-bleed)] md:sticky md:top-12 md:h-[calc(100dvh-4rem)]">
			<Drawer mode="push" position="end" isOpen={isOpen} onOpenChange={onOpenChange} aria-label="Ask Claude">
				<Chat title="Ask Claude" conversation={conversation} />
			</Drawer>
		</div>
	);
}
