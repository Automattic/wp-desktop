/**
 * External Dependencies
 */
var path = require( 'path' );
var webpack = require( 'webpack' );

/**
 * Internal dependencies
 */
var shared = require( './webpack.shared' );

var options = {
	entry: './desktop/test/boot.js',
	output: {
		path: path.join( __dirname, 'build' ),
		filename: 'desktop-test.js',
		libraryTarget: 'commonjs2'
	}
};

shared.plugins = ( shared.plugins || [] ).concat( [ 
	new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]user-settings$/, 'lodash/noop' ), // Depends on BOM
	new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]application-passwords-data$/, 'lodash/noop' ), // Depends on BOM
	new webpack.NormalModuleReplacementPlugin( /^lib[\/\\]connected-applications-data$/, 'lodash/noop' ), // Depends on BOM
] );

module.exports = Object.assign( shared, options );
