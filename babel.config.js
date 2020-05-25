const electronVersion = require( 'electron/package.json' ).version;

module.exports = {
	presets: [
		[
			'@babel/env',
			{
				targets: { electron: electronVersion },
				modules: 'commonjs',
				useBuiltIns: 'entry',
				corejs: '3.6',
			},
		],
		'@babel/react',
		'@babel/preset-typescript',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-nullish-coalescing-operator',
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-syntax-dynamic-import',
	],
};
