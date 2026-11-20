import { useState } from 'react';
import { Button, Message, MessageList } from '../../src/index.js';
import { Choice, ControlGroup, Playground, TextControl, longWords, pick, useRemembered } from '../playground.js';

const lengths = ['short', 'long'] as const;
type Length = (typeof lengths)[number];
const questions = { short: 'What can I make with leeks?', long: `${longWords}. ${longWords}.` };
const replies = {
	short: ['A leek and potato soup is the quickest, about 40 minutes start to finish.'],
	long: ['A leek and potato soup is the quickest, about 40 minutes start to finish. Soften the leeks in butter first, slowly, so they turn sweet rather than brown.', 'For something more filling, a leek and gruyère tart keeps for a couple of days and is as good cold.'],
};
const asked = ['Could it be vegan?', 'How long does it keep?', 'What goes with it?'];

// Sending another adds a bubble to the end, which grows in as it arrives
export function MessagePlayground() {
	const [question, setQuestion] = useRemembered<Length>('question', 'short', lengths);
	const [reply, setReply] = useRemembered<Length>('reply', 'short', lengths);
	const [label, setLabel] = useRemembered('label', 'Conversation');
	const [more, setMore] = useState<string[]>([]);
	return (
		<Playground
			onRandom={() => {
				setQuestion(pick(lengths));
				setReply(pick(lengths));
			}}
			box="flex-col items-start gap-6"
			controls={
				<>
					<ControlGroup label="Content">
						<Choice label="Question" options={lengths} value={question} onChange={setQuestion} />
						<Choice label="Reply" options={lengths} value={reply} onChange={setReply} />
						<TextControl label="Name, read out" value={label} onChange={setLabel} />
					</ControlGroup>
				</>
			}
		>
			<MessageList aria-label={label} className="w-full max-w-md">
				<Message from="user">{questions[question]}</Message>
				<Message from="assistant">
					{replies[reply].map((text) => (
						<p key={text}>{text}</p>
					))}
				</Message>
				{more.map((text, index) => (
					<Message key={index} from="user">
						{text}
					</Message>
				))}
			</MessageList>
			<Button variant="secondary" size="small" onPress={() => setMore((list) => [...list, asked[list.length % asked.length]])}>
				Send another
			</Button>
		</Playground>
	);
}
