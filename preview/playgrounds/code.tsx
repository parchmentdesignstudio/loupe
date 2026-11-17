import { Icon } from '@parchment/icons/react';
import { Code, type CodeTheme } from '../../src/index.js';
import { useHighlight } from '../../src/shiki.js';
import highlighted from 'virtual:highlighted-code';
import { type Sample, highlightKey, languages, mark, markings, samples } from './code-samples.js';
import { Choice, ControlGroup, Playground, SwitchControl, TextControl, pick, useRemembered } from '../playground.js';

const themes = ['loupe', 'iamsteve', 'mcknny'] as const satisfies readonly CodeTheme[];

// Languages as they're written, and the sites as they write their own names
const names = { tsx: 'TSX', css: 'CSS', json: 'JSON', iamsteve: 'iamsteve', mcknny: 'mcknny' };

export function CodePlayground() {
	const [language, setLanguage] = useRemembered('language', 'tsx', languages);
	const [theme, setTheme] = useRemembered<CodeTheme>('theme', 'loupe', themes);
	const [title, setTitle] = useRemembered('title', samples.tsx.title);
	const [hasLineNumbers, setLineNumbers] = useRemembered('hasLineNumbers', false);
	const [isCopyable, setCopyable] = useRemembered('isCopyable', true);
	const [marking, setMarking] = useRemembered('marking', 'none', markings);
	const { code, meta } = mark(language, marking);
	const live = useHighlight(code, { language, lineNumbers: hasLineNumbers, meta });
	// Highlighted when the preview was built, so it shows at once, or in the browser for anything the build didn't
	const html = highlighted[highlightKey(language, marking, hasLineNumbers)] ?? live;
	const choose = (next: Sample) => {
		setLanguage(next);
		setTitle(samples[next].title);
	};
	return (
		<Playground
			box="items-stretch px-4"
			// As a site writes it, rather than with the sample's text and HTML in full
			code={[
				'<Code',
				'\tcode={source}',
				'\thtml={useHighlight(source, { language: ' + JSON.stringify(language) + (hasLineNumbers ? ', lineNumbers: true' : '') + ' })}',
				title && `\ttitle=${JSON.stringify(title)}`,
				theme !== 'loupe' && `\ttheme=${JSON.stringify(theme)}`,
				isCopyable ? '\tcopyIcon={<Icon name="square-on-square" />}\n\tcopiedIcon={<Icon name="checkmark" />}' : '\tisCopyable={false}',
				'/>',
			]
				.filter(Boolean)
				.join('\n')}
			onRandom={() => {
				choose(pick(languages));
				setTheme(pick(themes));
				setLineNumbers(Math.random() > 0.5);
				setMarking(pick(markings));
			}}
			controls={
				<ControlGroup label="Content">
					<Choice label="Language" options={languages} labels={names} value={language} onChange={choose} />
					<TextControl label="Title" value={title} onChange={setTitle} />
					<SwitchControl label="Line numbers" value={hasLineNumbers} onChange={setLineNumbers} />
					<Choice label="Marks" options={markings} value={marking} onChange={setMarking} />
					<SwitchControl label="Copy" value={isCopyable} onChange={setCopyable} />
				</ControlGroup>
			}
			preview={<Choice label="Theme" options={themes} labels={names} value={theme} onChange={setTheme} />}
		>
			<div className="flex w-full justify-center">
				<Code code={code} html={html} title={title || undefined} theme={theme} isCopyable={isCopyable} copyIcon={<Icon name="square-on-square" />} copiedIcon={<Icon name="checkmark" />} className="w-full max-w-160" />
			</div>
		</Playground>
	);
}
