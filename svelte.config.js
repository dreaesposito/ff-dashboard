import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html',
			pages: 'build',
			assets: 'build',
			fallback: 'index.html'
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : '/ff-dashboard'
		}
	}
};

export default config;
