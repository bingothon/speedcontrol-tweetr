import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'rollup_imports.js',
	output: {
		file: 'dashboard/js/modules.js',
		format: 'cjs'
	},
	plugins: [nodeResolve()]
};
