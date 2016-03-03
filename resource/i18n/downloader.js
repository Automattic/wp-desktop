'use strict';

/**
 * External Dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const superagent = require( 'superagent' );

/**
 * Internal Dependencies
 */
const config = require( '../../calypso/server/config' );
const languages = config( 'languages' );
const langDirectory = path.resolve( __dirname, '..', '..', 'public_desktop/languages/' );

try {
	fs.mkdirSync( langDirectory );
} catch ( e ) {
	if ( e.code !== 'EEXIST' ) {
		console.log( '✗ Failed to create directory with error: ' + e.code );
		throw e;
	}
}

languages.forEach( function( language ) {
	const langSlug = language.langSlug;
	const url = 'https://widgets.wp.com/languages/calypso/' + langSlug + '.json';

	superagent.get( url ).end( function( error, response ) {
		console.log( 'Fetched ' + langSlug + ' (' + url + ')' );
		if ( error || ! response.ok ) {
			console.log( '✗ request failed; skipping due to error status: ', error.status );
			return;
		}

		let langFile = path.join( langDirectory, langSlug + '.json' );
		try {
			fs.writeFileSync( langFile, JSON.stringify( response.body ) );
			console.log( '✓ saved at ' + path.basename( langFile ) );
		} catch ( e ) {
			console.log( '✗ failed to write file for ' + langSlug + ' with error: ' + e.code );
		}
	} );
} );
