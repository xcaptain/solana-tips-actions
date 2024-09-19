import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from "vite-plugin-node-polyfills"; // Fix Buffer is not defined

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()]
});
