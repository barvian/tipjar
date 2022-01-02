import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'

const name = 'TipJar'
const dev = process.env.ROLLUP_WATCH

export default {
	input: 'src/index.js',
	output: [
		{
			file: '../dist/jar/index.js',
			format: 'umd',
			name
		},
		{ file: pkg.module, format: 'es' },
		{ file: pkg.main, format: 'umd', name }
	],
	plugins: [
		replace({
	      '%API_ROOT%': dev ?
	      	'://localhost:8080/' :
	      	'://api.tipkit.io/'
	    }),
		svelte({
			preprocess: sveltePreprocess({
				postcss: {
					plugins: [require('autoprefixer')()]
				}
			}),	
			emitCss: false,
			compilerOptions: {
				dev: false
			}
		}),
		resolve(),
		commonjs()
	]
}
