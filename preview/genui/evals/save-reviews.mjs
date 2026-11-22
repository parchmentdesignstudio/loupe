// Keeps the eval gallery's reviews in files beside the runs, one a run in reviews/, as the preview runs locally, so
// what's marked and noted can be read back in a conversation about what to fix, without copying it over. GET has every
// run's reviews, so the gallery can show how an ask went last time; POST saves one run's. Only the dev server has it
export const path = '/__loupe/reviews';

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// A run's id is when it started, as its results file is named
const runs = /^[\dT:.Z-]+$/;

export function saveReviews() {
	return {
		name: 'save-reviews',
		apply: 'serve',
		configureServer(server) {
			const folder = join(server.config.root, 'genui/evals/reviews');
			// Every failure is answered, so a bad save can't stop the server
			const handle = async (request, response) => {
				try {
					if (request.method === 'GET') {
						const names = await readdir(folder).catch(() => []);
						const all = {};
						for (const name of names.filter((each) => each.endsWith('.json'))) all[name.slice(0, -5)] = JSON.parse(await readFile(join(folder, name), 'utf8'));
						return void response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(all));
					}
					if (request.method !== 'POST') return void response.writeHead(405).end();
					let body = '';
					for await (const chunk of request) body += chunk;
					const { run, reviews } = JSON.parse(body);
					if (typeof run !== 'string' || !runs.test(run) || typeof reviews !== 'object' || reviews === null) throw new Error('Expected a run and its reviews');
					await mkdir(folder, { recursive: true });
					await writeFile(join(folder, `${run}.json`), `${JSON.stringify(reviews, null, '\t')}\n`);
					response.writeHead(204).end();
				} catch (error) {
					response.writeHead(400, { 'content-type': 'text/plain' }).end(String(error.message));
				}
			};
			server.middlewares.use(path, (request, response) => void handle(request, response));
		},
	};
}
