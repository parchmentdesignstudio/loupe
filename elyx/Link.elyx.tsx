import { Link as UiLink } from '../lib/Link.js';

export function Link({ label = 'See the work', href = '#work', isCurrent = false, isDisabled = false }: { label?: string; href?: string; isCurrent?: boolean; isDisabled?: boolean }) {
	return (
		<UiLink href={href} aria-current={isCurrent ? 'page' : undefined} isDisabled={isDisabled}>
			{label}
		</UiLink>
	);
}
