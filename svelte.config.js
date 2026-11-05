import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			directives: {
				'script-src': [
					'self',
					'https://hcaptcha.com',
					'https://*.hcaptcha.com',
					'sha256-SEJwuOsV2BEdExdZtKPHIGZl4GzvbPvEmyhJGnx06Q8=',
					'sha256-+Zdb7cOa3waocVUG+VMQDPxZ2Uid7jf3qv/5X9qduRg=',
				],
				'frame-src': ['self', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
				'style-src': ['self', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
				'style-src-attr': ['unsafe-hashes', 'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='],
				'connect-src': ['self', 'https://hcaptcha.com', 'https://*.hcaptcha.com'],
			},
		},
	},
};

export default config;
