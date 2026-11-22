// The preview page, every component in its states: pnpm --filter @parchment/ui dev
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { locate } from '../../scripts/locate.mjs';
import { details } from './preview/details.mjs';
import { highlightedCode } from './preview/highlighted.mjs';
import { claude } from './preview/genui/claude.mjs';
import { saveReviews } from './preview/genui/evals/save-reviews.mjs';
import { saveTokens } from './preview/save-tokens.mjs';

export default defineConfig({
	root: 'preview',
	plugins: [locate(), details(), highlightedCode(), saveTokens(), saveReviews(), claude(), react(), tailwindcss()],
});
