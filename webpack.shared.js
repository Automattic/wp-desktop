/**
 * External Dependencies
 */
var path = require( 'path' );
var webpack = require( 'webpack' );

module.exports = {
	target: 'node',
	module: {
		loaders: [
			{
				test: /\.html$/,
				loader: 'html-loader'
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	node: {
		__filename: true,
		__dirname: true
	},
	externals: [
		'express',
		'webpack',
		'superagent',
		'electron',
		'component-tip',

		// These are Calypso server modules we don't need, so let's not bundle them
		'webpack.config',
		'bundler/hot-reloader',
		'devdocs/search-index'
	],
	resolve: {
		extensions: [ '', '.js', '.jsx' ],
		modulesDirectories: [
			'node_modules',
			// For require/import resolution within Calypso
			'calypso/server',
			'calypso/client',
			// For require/import within Desktop
			'calypso',
			'desktop'
		]
	},
	plugins: [
		// new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.NormalModuleReplacementPlugin( /^analytics$/, 'lodash/noop' ), // Depends on BOM
		new webpack.NormalModuleReplacementPlugin( /^lib\/upgrades\/actions$/, 'lodash/noop' ), // Uses Flux dispatcher
		new webpack.NormalModuleReplacementPlugin( /^lib\/route$/, 'lodash/noop' ) // Depends too much on page.js

	],
};
