const electronVersion = require( 'electron/package.json' ).version;

module.exports = {
	presets: [
		[ '@babel/env', { targets: { electron: electronVersion } } ],
		'@babel/react',
		'@babel/preset-typescript',
	],
	plugins: [ '@babel/plugin-proposal-class-properties', '@babel/plugin-syntax-dynamic-import' ],
};
