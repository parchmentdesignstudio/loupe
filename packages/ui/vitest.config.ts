import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		include: ['test/**/*.test.tsx'],
		setupFiles: ['test/setup.ts'],
		// So a test can read a sheet with ?raw, as tokens.test.tsx does, rather than Vitest emptying it
		css: { include: [/\/styles\//] },
	},
});
