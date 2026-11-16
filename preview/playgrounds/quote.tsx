import { useState } from 'react';
import { Prose, Quote } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, pick } from '../playground.js';
import { photo } from './avatar.js';

const words = {
	short: 'We thought we needed a website. It turned out we needed a better way to answer the phone.',
	long: 'We came in asking for a new logo, and left with a way of talking about ourselves that the whole team uses without thinking. The brief changed twice, the deadline didn’t, and somehow every conversation still felt unhurried. I’ve recommended them to three people since, and I’d hire them again tomorrow.',
} as const;
type Length = keyof typeof words;

const people = [
	{ cite: 'Mara Lindqvist', detail: 'Founder, Halden Studio' },
	{ cite: 'Sam Okafor', detail: 'Head of product, Fernway' },
	{ cite: 'Ada Lin', detail: 'Operations director, Northgate Lettings' },
	{ cite: 'Maria Fernanda de los Ángeles García-Villalobos', detail: 'Head of brand and communications, Instituto Cultural de Valparaíso' },
];

export function QuotePlayground() {
	const [variant, setVariant] = useState<'quote' | 'testimonial'>('quote');
	const [length, setLength] = useState<Length>('short');
	const [cite, setCite] = useState('Mara Lindqvist');
	const [detail, setDetail] = useState('Founder, Halden Studio');
	const [hasAvatar, setHasAvatar] = useState(true);
	const [width, setWidth] = useState<'narrow' | 'wide'>('wide');
	const shuffle = () => {
		const person = pick(people);
		setVariant(pick(['quote', 'testimonial'] as const));
		setLength(Math.random() < 0.3 ? 'long' : 'short');
		setCite(person.cite);
		setDetail(Math.random() < 0.2 ? '' : person.detail);
		setHasAvatar(Math.random() < 0.7);
		setWidth(pick(['narrow', 'wide'] as const));
	};
	return (
		<Playground
			onRandom={shuffle}
			preview={<Choice label="Width" options={['narrow', 'wide'] as const} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Words" options={Object.keys(words) as Length[]} value={length} onChange={setLength} />
						<TextControl label="Cite" value={cite} onChange={setCite} />
						<TextControl label="Detail" value={detail} onChange={setDetail} />
					</ControlGroup>
					<ControlGroup label="Appearance">
						<Choice label="Variant" options={['quote', 'testimonial'] as const} value={variant} onChange={setVariant} />
						{variant === 'testimonial' && <SwitchControl label="Avatar" value={hasAvatar} onChange={setHasAvatar} />}
					</ControlGroup>
				</>
			}
		>
			<Quote variant={variant} cite={cite || undefined} detail={detail || undefined} avatar={variant === 'testimonial' && hasAvatar ? photo : undefined} className={width === 'narrow' ? 'w-full max-w-xs' : 'w-full max-w-[36rem]'}>
				{words[length]}
			</Quote>
		</Playground>
	);
}

/** Between paragraphs, as a pull quote in a post sits, beside prose's own blockquote */
export function QuoteInProse() {
	return (
		<Prose className="w-full max-w-[36rem]">
			<p>Halden came to us with a website brief: six pages, a contact form and a gallery. By the second call it was clear the site wasn’t the problem. Most of their enquiries came by phone, and nobody knew who should pick up.</p>
			<Quote cite="Mara Lindqvist" detail="Founder, Halden Studio">
				We thought we needed a website. It turned out we needed a better way to answer the phone.
			</Quote>
			<p>So the first thing we designed was a call script, not a homepage. The website came later, and it was better for it.</p>
		</Prose>
	);
}

/** Three testimonials side by side, as on a services page, with only one person who has a photo */
export function Testimonials() {
	return (
		<div className="grid w-full grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-x-10 gap-y-12">
			<Quote variant="testimonial" cite="Doris Hart" detail="Head of product, Fernway" avatar={photo}>
				Parchment turned a vague idea into a brand we’re proud to put our name to.
			</Quote>
			<Quote variant="testimonial" cite="Ada Lin" detail="Operations director, Northgate Lettings">
				The new booking flow halved the calls we get asking where a viewing is. Our team noticed in the first week.
			</Quote>
			<Quote variant="testimonial" cite="Tom Hughes" detail="Owner, Hughes & Daughter Joinery">
				Clear, calm and quick. They asked the questions we hadn’t thought to ask ourselves.
			</Quote>
		</div>
	);
}
