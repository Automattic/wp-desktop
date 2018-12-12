module.exports = {
	presets: [
		[ '@babel/env', { targets: { electron: '1.8.4' } } ],
		'@babel/react'
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-syntax-dynamic-import',
	]
};
