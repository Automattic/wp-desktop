'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const os = require( 'os' );
const request = require( 'superagent' );
const path = require( 'path' );
const debug = require( 'debug' )( 'desktop:crash-tracker' );

/**
 * Internal dependencies
 */
const config = require( 'lib/config' );

function finished( error, response, cb ) {
	if ( error ) {
		debug( 'Failed to upload crash report', error );
	} else {
		debug( 'Uploaded crash report' );
	}

	if ( typeof cb !== 'undefined' ) {
		cb( response );
	}
}

function gatherData( errorType, errorData ) {
	// Gather basic data
	const data = {
		platform: process.platform,
		release: os.release(),
		version: config.version,
		build: config.build,
		time: parseInt( new Date().getTime() / 1000, 10 ),
		type: errorType,
		data: errorData
	};

	return data;
}

module.exports = {
	isEnabled: function() {
		return config.crash_reporter.tracker;
	},

	track: function( errorType, errorData, cb ) {
		if ( config.crash_reporter.tracker ) {
			// Send to crash tracker
			debug( 'Sending crash report to ' + config.crash_reporter.url );

			request
				.post( config.crash_reporter.url )
				.send( gatherData( errorType, errorData ) )
				.end( function( error, response ) {
					finished( error, response, cb );
				} );
		}
	},

	trackLog: function( cb ) {
		const logFile = path.join( app.getPath( 'userData' ), config.debug.log_file );

		debug( 'Uploading log file: ' + logFile );

		request
			.post( config.crash_reporter.url )
			.send( gatherData( 'logfile', logFile ) )
			.attach( 'log', logFile )
			.end( function( error, response ) {
				finished( error, response, cb );
			} );
	}
};
