module.exports = {
	presets: [
		[ '@babel/env', { targets: { electron: '1.8.4' } } ],
		'@babel/react',
		'@babel/preset-typescript'
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-syntax-dynamic-import',
	]
};
