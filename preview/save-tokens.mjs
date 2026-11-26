// Saves the Shadows panel's colours into the brand, styles/brands/parchment.css, as the preview runs locally, so a tweak in the browser comes
// back as a diff, then brings the Elyx tokens up to date with it. Only the dev server has it, so the hosted preview
// can't write
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const path = '/__loupe/tokens';

// What the panel may write: a shadow colour role, as transparent, a mix, light-dark of two, or another role
const names = /^(?:edge|dark-edge|sheen|toplight|glow|shade|shadow-(?:raised|floating|deep|overlay|handle|well)-color)$/;
const side = String.raw`(?:transparent|var\(--[\w-]+\)|color-mix\(in oklab, var\(--[\w-]+\) \d+(?:\.\d+)?%, transparent\))`;
const values = new RegExp(`^(?:${side}|light-dark\\(${side}, ${side}\\))$`);

export function saveTokens() {
	return {
		name: 'save-tokens',
		apply: 'serve',
		configureServer(server) {
			const file = join(server.config.root, '../styles/brands/parchment.css');
			const repo = join(server.config.root, '../../..');
			// Every failure is answered, so a bad save can't stop the server
			const save = async (request, response) => {
				if (request.method !== 'POST') return void response.writeHead(405).end();
				try {
					let body = '';
					for await (const chunk of request) body += chunk;
					const changes = JSON.parse(body);
					let css = await readFile(file, 'utf8');
					for (const [name, value] of Object.entries(changes)) {
						if (!names.test(name) || typeof value !== 'string' || !values.test(value)) throw new Error(`Can't save --${name}: ${value}`);
						const declaration = new RegExp(`^(\\t+--${name}: ).*;$`, 'm');
						if (!declaration.test(css)) throw new Error(`No --${name} in styles/brands/parchment.css`);
						css = css.replace(declaration, `$1${value};`);
					}
					await writeFile(file, css);
					execFile('node', ['scripts/elyx-tokens.mjs'], { cwd: repo }, (error) => error && server.config.logger.warn(`Elyx tokens: ${error.message}`));
					response.writeHead(204).end();
				} catch (error) {
					response.writeHead(400, { 'content-type': 'text/plain' }).end(String(error.message));
				}
			};
			server.middlewares.use(path, (request, response) => void save(request, response));
		},
	};
}
