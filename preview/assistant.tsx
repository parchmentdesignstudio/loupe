import { useRef, useState, useSyncExternalStore } from 'react';
import { resizePushDrawer } from '../src/Drawer.js';
import { Drawer } from '../src/index.js';
import { Chat, type Conversation } from './blocks/chat.js';

// Claude, as Ask Loupe, in a drawer at the card's end, as the settings are, so what it's asked about stays in view beside it. Wide
// enough for a table it draws. The conversation is kept by the page, so it carries on however often it's closed. Below
// md, as a pushing drawer becomes one, it slides over the page instead, in the card's colour and bleed rather than an
// overlay's, so what it draws sits on the surface it would in the page. Only while the preview runs locally, as the key
// stays on the server
const wide = '(min-width: 48rem)';
const subscribe = (onChange: () => void) => {
	const list = matchMedia(wide);
	list.addEventListener('change', onChange);
	return () => list.removeEventListener('change', onChange);
};

export function ChatDrawer({ isOpen, onOpenChange, conversation }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; conversation: Conversation }) {
	// Expanded, it takes more of the card for a view with more to it. Below md it already fills the screen, so there's
	// nothing to expand
	const isWide = useSyncExternalStore(subscribe, () => matchMedia(wide).matches, () => true);
	const [isExpanded, setExpanded] = useState(false);
	const element = useRef<HTMLDivElement>(null);
	const expand = (next: boolean) => (element.current ? resizePushDrawer(element.current, () => setExpanded(next)) : setExpanded(next));
	return (
		<div ref={element} className="shrink-0 self-start [--drawer-push-fill:var(--color-panel)] [--drawer-push-width:32rem] data-expanded:[--drawer-push-width:min(56rem,calc(100vw-24rem))] [--ground-bleed:var(--panel-bleed)] md:h-full" data-expanded={isExpanded || undefined}>
			<Drawer mode="push" position="end" isOpen={isOpen} onOpenChange={onOpenChange} className="[--drawer-fill:var(--color-panel)] [--overlay-bleed:var(--panel-bleed)]" aria-label="Ask Loupe">
				{/* Beside the page, the shell's chat button closes it, at the end of its bar. Below md it's an overlay, which keeps its own */}
				<Chat title="Ask Loupe" conversation={conversation} isExpanded={isExpanded} onExpandedChange={isWide ? expand : undefined} isClosable={!isWide} />
			</Drawer>
		</div>
	);
}
