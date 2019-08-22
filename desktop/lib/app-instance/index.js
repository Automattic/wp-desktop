'use strict';

/**
 * External Dependencies
 */
const app = require( 'electron' ).app;
const debug = require( 'debug' )( 'desktop:app-instance' );

/**
 * Internal dependencies
 */
const config = require( 'lib/config' );
const platform = require( 'lib/platform' );

function AppInstance() {
}

// This is called whenever another instance is started
AppInstance.prototype.anotherInstanceStarted = function() {
	debug( 'Another instance started, bringing to the front' );

	platform.restore();

	return true;
};

AppInstance.prototype.isSingleInstance = function() {
	let shouldQuit;

	const gotTheLock = app.requestSingleInstanceLock()

	if ( !gotTheLock ) {
		debug( 'App is already running, quitting' );
		app.exit();
		return false;
	} else {
		app.on('second-instance', ( event, commandLine, workingDirectory ) => {
			// Someone tried to run a second instance, we should focus our window
			this.anotherInstanceStarted.bind( this );
		})
	}

	return true;
};

module.exports = new AppInstance();
