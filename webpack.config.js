/**
 * External Dependencies
 */
var path = require( 'path' );

/**
 * Internal dependencies
 */
var shared = require( './webpack.shared' );

const isDevelopment = process.env.NODE_ENV === 'development';

var options = {
	entry: './desktop/index.js',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop.js',
		libraryTarget: 'commonjs2'
	},
	watch: isDevelopment,
	target: 'electron-main',
	mode: process.env.NODE_ENV,
};

module.exports = Object.assign( shared, options );
