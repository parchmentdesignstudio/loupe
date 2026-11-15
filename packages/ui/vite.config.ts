// The preview page, every component in its states: pnpm --filter @parchment/ui dev
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { locate } from '../../scripts/locate.mjs';
import { details } from './preview/details.mjs';
import { highlightedCode } from './preview/highlighted.mjs';

export default defineConfig({
	root: 'preview',
	plugins: [locate(), details(), highlightedCode(), react(), tailwindcss()],
});
