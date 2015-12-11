'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const dialog = electron.dialog;

/**
 * Internal dependencies
 */
const config = require( 'lib/config' );
const crashTracker = require( 'lib/crash-tracker' );

/**
 * Module variables
 */
let isReady = false;
let thereCanBeOnlyOne = false;

// We ignore any of these errors as they are probably temporary
const NETWORK_ERRORS = [ 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET' ];

function isFatalError( error ) {
	if ( typeof error.code ) {
		if ( NETWORK_ERRORS.indexOf( error.code ) !== -1 ) {
			return false;
		}
	}

	return true;
}

function exceptionHandler( error ) {
	if ( ! isFatalError( error ) ) {
		return;
	}

	crashTracker.track( 'exception', { name: error.name, message: error.message, stack: error.stack }, function() {
		if ( isReady && ! thereCanBeOnlyOne ) {
			const errorDialog = {
				buttons: [ 'Quit' ],
				title: 'A fatal error occurred',
				message: 'A fatal error occurred',
				detail: "Something bad happened and we can't recover\n\n" + error.name + ': ' + error.message
			};

			thereCanBeOnlyOne = true;
			dialog.showMessageBox( errorDialog, function() {
				app.quit();
			} );
		} else {
			console.log( 'An error occurred: ' + error.name + ' = ' + error.message );
			app.quit();
		}
	} );
}

module.exports = function() {
	app.on( 'ready', function() {
		isReady = true;
	} );

	if ( config.isRelease() ) {
		process.on( 'uncaughtException', exceptionHandler );
	}
};
