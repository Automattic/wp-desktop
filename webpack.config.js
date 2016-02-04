var path = require( 'path' );
var webpack = require( 'webpack' );

var options = {
	entry: './desktop/index.js',
	target: 'node',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop.js',
		libraryTarget: 'commonjs2'
	},
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
		modulesDirectories: [ 'node_modules', path.join( __dirname, 'calypso', 'server' ), path.join( __dirname, 'calypso', 'client' ), 'desktop' ]
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
	],
};

module.exports = options;
