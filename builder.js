/**
 * External Dependencies
 */
var packager = require( 'electron-packager' );
var fs = require( 'fs' );
var path = require( 'path' );

/**
 * Internal dependencies
 */
var builder = require( './resource/lib/tools' );
var config = require( './resource/lib/config' );
var pkg = require( './package.json' );
var pkgCalypso = require( './calypso/package.json' );

/**
 * Module variables
 */
var electronVersion = pkg.devDependencies['electron-prebuilt'].replace( '^', '' );
var key;

var opts = {
	dir: './',
	name: config.name,
	author: config.author,
	platform: builder.getPlatform( process.argv ),
	arch: builder.getArch( process.argv ),
	version: electronVersion,
	appVersion: config.version,
	appSign: 'Developer ID Application: ' + config.author,
	out: './release',
	icon: builder.getIconFile( process.argv ),
	'app-bundle-id': config.bundleId,
	'helper-bundle-id': config.bundleId,
	'app-category-type': 'public.app-category.social-networking',
	'app-version': config.version,
	'build-version': config.version,
	ignore: require( './resource/build-config/calypso-ignore' ),
	overwrite: true,
	asar: false,
	prune: true,
	sign: false,
	'version-string': {
		CompanyName: config.author,
		LegalCopyright: config.copyright,
		ProductName: config.name,
		InternalName: config.name,
		FileDescription: config.name,
		OriginalFilename: config.name,
		FileVersion: config.version,
		ProductVersion: config.version
	}
};

function whitelistInDirectory( directory, whitelist ) {
	var client = fs.readdirSync( directory );
	var ignore = [];

	for ( key = 0; key < client.length; key++ ) {
		if ( whitelist.indexOf( client[key] ) === -1 ) {
			ignore.push( path.join( directory, client[key] ) );
		}
	}

	return ignore;
}

function ignoreDeps( package, prefix ) {
	// Ignore all dev dependencies
	for ( key in package.devDependencies ) {
		opts.ignore.push( prefix + 'node_modules/' + key );
	}

	for ( key in package.optionalDependencies ) {
		opts.ignore.push( prefix + 'node_modules/' + key );
	}
}

ignoreDeps( pkg, '' );
ignoreDeps( pkgCalypso, 'calypso/' );

opts.ignore = opts.ignore.concat( whitelistInDirectory( './calypso/client', [ 'sections.js', 'config' ] ) );
opts.ignore = opts.ignore.concat( whitelistInDirectory( './calypso/build', [ 'bundle-desktop.js' ] ) );
opts.ignore = opts.ignore.concat( whitelistInDirectory( './calypso/public', [ 'fonts', 'images', 'tinymce', 'build.js', 'editor.css', 'style-rtl.css', 'style.css' ] ) );
opts.ignore = opts.ignore.concat( whitelistInDirectory( './calypso/server', [ 'bundler', 'pages' ] ) );
opts.ignore = opts.ignore.concat( whitelistInDirectory( './', [ 'calypso', 'desktop', 'public_desktop', 'node_modules', 'package.json' ] ) );

builder.beforeBuild( __dirname, opts, function( error ) {
	if ( error ) {
		throw error;
	}

	packager( opts, function( err ) {
		if ( err ) {
			console.log( error );
		} else {
			builder.cleanUp( path.join( __dirname, 'release' ), opts );
		}
	} );
} )
