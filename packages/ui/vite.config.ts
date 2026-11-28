// The preview page, every component in its states: pnpm --filter @parchment/ui dev
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { locate } from '../../scripts/locate.mjs';
import { compose } from '../compose/vite.js';
import { details } from './preview/details.mjs';
import { highlightedCode } from './preview/highlighted.mjs';
import { claude } from './preview/genui/claude.mjs';
import { saveReviews } from './preview/genui/evals/save-reviews.mjs';
import { saveTokens } from './preview/save-tokens.mjs';

export default defineConfig({
	root: 'preview',
	// Compose has no button of its own here: ⌥G opens it, or search does
	plugins: [locate(), compose({ launcher: false }), details(), highlightedCode(), saveTokens(), saveReviews(), claude(), react(), tailwindcss()],
});
