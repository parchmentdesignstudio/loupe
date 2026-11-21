import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { details } from './preview/details.mjs';

export default defineConfig({
	// details, so the generative UI's catalogue is tested against the source's own variants
	plugins: [react(), details()],
	test: {
		environment: 'jsdom',
		include: ['test/**/*.test.tsx'],
		setupFiles: ['test/setup.ts'],
		// So a test can read a sheet with ?raw, as tokens.test.tsx does, rather than Vitest emptying it
		css: { include: [/\/styles\//] },
	},
});
