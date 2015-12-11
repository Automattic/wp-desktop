'use strict';
/**
 * External Dependencies
 */
var path = require( 'path' );
var exec = require( 'child_process' ).execSync;

/**
 * Internal dependencies
 */
var config = require( '../lib/config' );

/**
 * Module variables
 */
var targetName = path.resolve( path.join( 'release', config.name + '-mas-x64' ) );

console.log( '\nPackaging for Mac App Store' );

exec( './resource/mac-app-store/sign.sh "' + [ config.name, targetName, config.author, 'mas-' + config.version ].join( '" "' ) + '"' );
