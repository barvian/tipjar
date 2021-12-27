import svelte from 'rollup-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase())

export default {
	input: 'src/index.js',
	output: [
		{ file: pkg.module, format: 'es' },
		{ file: pkg.main, format: 'umd', name }
	],
	plugins: [
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
		typescript({ sourceMap: false }),
		resolve(),
		commonjs()
	]
}
