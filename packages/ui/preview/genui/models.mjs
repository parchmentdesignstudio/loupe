// The models and efforts a request may pick, shared by the server and the composer's picker. Opus at its own default
// effort unless one's picked. Each model says what it's for, and how fast and how capable it is out of 5, for the card
// the picker shows beside it
export const models = [
	{ id: 'claude-opus-5-5', name: 'Opus 5.5', summary: 'For the hardest work, where the answer matters more than the wait', speed: 2, intelligence: 5 },
	{ id: 'claude-sonnet-5-5', name: 'Sonnet 5.5', summary: 'For most work, quick and capable', speed: 3, intelligence: 4 },
	{ id: 'claude-haiku-5-5', name: 'Haiku 5.5', summary: 'For quick, simple asks, fastest and cheapest', speed: 5, intelligence: 3 },
];
// Default sends no effort, so the model works at whatever its own default is
export const efforts = ['default', 'low', 'medium', 'high'];
