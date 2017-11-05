'use strict';

/**
 * External Dependencies
 */
const appdmg = require( 'appdmg' );
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const config = require( '../lib/config' );

/**
 * Module variables
 */
const DMG_CONFIG = path.resolve( path.join( 'resource', 'build-config', 'dmg.json' ) );
let targetName;

function getDmgName( name ) {
	return name + '-Installer.dmg';
}

function dmgIt( target ) {
	const dmg = appdmg( { source: DMG_CONFIG, target: target } );

	console.log( '\nPackaging into a DMG' );

	dmg.on( 'progress', ( info ) => {
		if ( info.type === 'step-begin' ) {
			console.log( ' - ' + info.current + ' of ' + info.total );
		}
	} );

	dmg.on( 'finish', () => {
		console.log( ' - DMG produced at ' + target );
	} );

	dmg.on( 'error', ( error ) => {
		console.log( ' - Failed to produce a DMG', error );
	} );
}

targetName = path.resolve( path.join( 'release', getDmgName( config.name ) ) );

if ( fs.existsSync( targetName ) ) {
	fs.unlinkSync( targetName );
}

dmgIt( targetName );
