import { useState } from 'react';
import { SearchField } from '../../src/index.js';
import { Choice, ControlGroup, Playground, SwitchControl, longWords, pick, useRemembered } from '../playground.js';

const lengths = ['none', 'short', 'long'] as const;
const values = ['empty', 'short', 'long'] as const;
const widths = { narrow: 'w-40', medium: 'w-64', wide: 'w-full max-w-sm' } as const;
type Value = (typeof values)[number];
type Width = keyof typeof widths;
const errorLengths = ['short', 'long'] as const;

const labels = { none: undefined, short: 'Typeface', long: longWords };
const descriptions = { none: undefined, short: 'By name or foundry', long: `${longWords}, and then a second sentence to push it onto another line` };
const placeholders = { none: undefined, short: 'Search typefaces', long: longWords };
const errors = { short: 'Type at least two letters', long: `${longWords}, as an error message` };
const contents = { empty: '', short: 'Grotesk', long: 'A grotesque with a single-storey g, ink traps, and a family of at least nine weights' };

export function SearchFieldPlayground() {
	const [label, setLabel] = useRemembered('label', 'none', lengths);
	const [description, setDescription] = useRemembered('description', 'none', lengths);
	const [placeholder, setPlaceholder] = useRemembered('placeholder', 'short', lengths);
	const [content, setContent] = useRemembered('content', 'empty', values);
	const [search, setSearch] = useState(contents[content]);
	const [submitted, setSubmitted] = useState<string>();
	const [width, setWidth] = useRemembered('width', 'medium', Object.keys(widths) as Width[]);
	const [isInvalid, setInvalid] = useRemembered('isInvalid', false);
	const [error, setError] = useRemembered('error', 'short', errorLengths);
	const [isReadOnly, setReadOnly] = useRemembered('isReadOnly', false);
	const [isDisabled, setDisabled] = useRemembered('isDisabled', false);
	const [isFocused, setFocused] = useRemembered('isFocused', false);
	const fill = (next: Value) => {
		setContent(next);
		setSearch(contents[next]);
	};
	const shuffle = () => {
		setLabel(pick(lengths));
		setDescription(pick(lengths));
		setPlaceholder(pick(lengths));
		fill(pick(values));
		setWidth(pick(Object.keys(widths) as Width[]));
		setInvalid(Math.random() < 0.3);
		setError(pick(errorLengths));
	};
	return (
		<Playground
			onRandom={shuffle}
			box="flex-col gap-3"
			preview={<Choice label="Width" options={Object.keys(widths) as Width[]} value={width} onChange={setWidth} />}
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Label" options={lengths} value={label} onChange={setLabel} />
						<Choice label="Description" options={lengths} value={description} onChange={setDescription} />
						<Choice label="Placeholder" options={lengths} value={placeholder} onChange={setPlaceholder} />
					</ControlGroup>
					<ControlGroup label="State">
						<SwitchControl label="Focused" value={isFocused} onChange={setFocused} />
						<Choice label="Value" options={values} value={content} onChange={fill} />
						<SwitchControl label="Invalid" value={isInvalid} onChange={setInvalid} />
						{isInvalid && <Choice label="Error" options={errorLengths} value={error} onChange={setError} />}
						<SwitchControl label="Read-only" value={isReadOnly} onChange={setReadOnly} />
						<SwitchControl label="Disabled" value={isDisabled} onChange={setDisabled} />
					</ControlGroup>
				</>
			}
		>
			<SearchField
				label={labels[label]}
				aria-label={label === 'none' ? 'Search typefaces' : undefined}
				description={descriptions[description]}
				placeholder={placeholders[placeholder]}
				value={search}
				onChange={setSearch}
				onSubmit={setSubmitted}
				onClear={() => setSubmitted(undefined)}
				isInvalid={isInvalid}
				errorMessage={errors[error]}
				isReadOnly={isReadOnly}
				isDisabled={isDisabled}
				className={widths[width]}
				data-show-focus={isFocused || undefined}
			/>
			{submitted !== undefined && <p className="font-mono text-label">Searched for “{submitted}”</p>}
		</Playground>
	);
}
