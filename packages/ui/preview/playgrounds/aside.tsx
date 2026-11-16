import { useState } from 'react';
import { Aside, Prose } from '../../src/index.js';
import { Choice, ControlGroup, Playground, longWords, pick } from '../playground.js';

const samples = {
	signpost: {
		short: 'I assume you’re comfortable setting up Tailwind for your project.',
		long: 'This guide picks up where the last one left off. If you haven’t set up a 12 column grid before, read that first: everything here builds on the same container, the same gap and the same named lines, and the examples won’t make much sense without them.',
	},
	afterthought: {
		short: 'If your server is behind a proxy that handles SSL, you may only need to listen on port 80.',
		long: 'If you’re wondering why a codebase does it the other way, the separate family for each weight was a workaround for Internet Explorer 8 and earlier, which needed .eot files. Conversion tools split each weight into its own family to keep them working. That reasoning hasn’t applied for a long time, but the pattern persists.',
	},
} as const;
type Variant = keyof typeof samples;
type Length = 'short' | 'long';

export function AsidePlayground() {
	const [variant, setVariant] = useState<Variant>('signpost');
	const [length, setLength] = useState<Length | 'very long'>('short');
	const [inProse, setInProse] = useState<'prose' | 'alone'>('prose');
	const shuffle = () => {
		setVariant(pick(['signpost', 'afterthought'] as const));
		setLength(Math.random() < 0.1 ? 'very long' : pick(['short', 'long'] as const));
		setInProse(pick(['prose', 'alone'] as const));
	};
	const text = length === 'very long' ? longWords : samples[variant][length];
	const aside = <Aside variant={variant}>{text}</Aside>;
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Set in" options={['prose', 'alone'] as const} value={inProse} onChange={setInProse} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Text" options={['short', 'long', 'very long'] as const} value={length} onChange={setLength} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={['signpost', 'afterthought'] as const} value={variant} onChange={setVariant} />
					</ControlGroup>
				</>
			}
		>
			{inProse === 'prose' ? (
				<Prose className="w-full max-w-[36rem]">
					<p>A bento layout is a grid of boxes in different sizes, like the compartments of a lunch box. CSS grid does most of the work.</p>
					{aside}
					<p>Start with the container. Twelve columns gives you room to make boxes a third, a half or a quarter wide.</p>
				</Prose>
			) : (
				<div className="w-full max-w-[36rem]">{aside}</div>
			)}
		</Playground>
	);
}

/** Both, as a post uses them: a signpost before the writing starts, and an afterthought after the point it hangs off */
export function AsidesInProse() {
	return (
		<Prose className="w-full max-w-[36rem]">
			<h2>Redirecting an old domain</h2>
			<Aside>You’ll need SSH access to your server, and a certificate for both domains.</Aside>
			<p>Nginx can send every request for the old domain to the new one in a single server block. Keep the path, so links to old posts still land on the right page.</p>
			<Aside variant="afterthought">
				<p>If your server is behind a reverse proxy or load balancer that handles SSL, as Cloudflare does, you may only need to listen on port 80.</p>
				<p>The proxy handles the HTTPS connection with the visitor, and forwards plain HTTP to nginx.</p>
			</Aside>
			<p>Reload nginx, then check a few old links by hand. A 301 tells search engines the move is for good.</p>
		</Prose>
	);
}
