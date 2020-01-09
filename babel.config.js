const electronVersion = require( 'electron/package.json' ).version;

module.exports = {
	presets: [
		[ '@babel/env', { targets: { electron: electronVersion }, useBuiltIns: 'usage', corejs: '3.6.1' } ],
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
