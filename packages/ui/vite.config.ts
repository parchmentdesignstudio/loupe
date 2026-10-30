// The preview page, every component in its states: pnpm --filter @parchment/ui dev
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'preview',
	plugins: [react(), tailwindcss()],
});
