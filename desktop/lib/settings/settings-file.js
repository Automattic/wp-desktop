'use strict';

/**
 * External Dependencies
 */
const app = require( 'electron' ).app;
const path = require( 'path' );
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const Config = require( '../config' );

let firstRun = false;

function getSettingsFile() {
	return path.join( app.getPath( 'userData' ), Config.settings_filename );
}

module.exports = {
	load: function() {
		const settingsFile = getSettingsFile();

		if ( fs.existsSync( settingsFile ) ) {
			return JSON.parse( fs.readFileSync( settingsFile ) );
		}

		firstRun = true;
		return {};
	},

	save: function( group, groupData ) {
		const debug = require( 'debug' )( 'desktop:settings' );
		const settingsFile = getSettingsFile();
		let data = {};

		try {
			if ( !fs.existsSync( settingsFile ) ) {
				// Create the file
				debug( 'Creating settings file: ' + settingsFile );
				fs.writeFileSync( settingsFile, JSON.stringify( Config.default_settings ) );
			}

			// Read the existing settings
			data = fs.readFileSync( settingsFile );

			debug( 'Read settings from ' + settingsFile, data.toString( 'utf-8' ) );

			data = JSON.parse( data );
			data[group] = groupData;

			debug( 'Updating settings: ' + group, groupData );
			fs.writeFileSync( settingsFile, JSON.stringify( data ) );
		} catch ( error ) {
			debug( 'Failed to read settings file', error );
		}

		return data;
	},

	isFirstRun: function() {
		return firstRun;
	}
}
