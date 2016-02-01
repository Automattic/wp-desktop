'use strict';

/**
 * External Dependencies
 */
const app = require( 'electron' ).app;
const debug = require( 'debug' )( 'desktop:app-instance' );
const minimist = require( 'minimist' );
const fs = require( 'fs' );
const path = require( 'path' );


/**
 * Internal dependencies
 */
const config = require( 'lib/config' );
const platform = require( 'lib/platform' );

function AppInstance() {
}

AppInstance.prototype.parseCommandLine = function( commandLineArguments, workingDirectory ) {
	if ( !workingDirectory ) {
		workingDirectory = '.';
	}

	let args = minimist( commandLineArguments.slice( 2 ) );
	debug( 'Command Line arguments', args );
	if ( !args.content && args.file ) {
		let absolutePath = path.resolve( workingDirectory, args.file );
		debug( 'Attemting to read file', absolutePath );
		try {
			fs.accessSync( absolutePath );
			args.content = fs.readFileSync( absolutePath ).toString();
		} catch ( e ) {
			debug( 'File error', e );
		}
	}

	platform.platform.window.webContents.send( 'command-line-arguments', args );
}

// This is called whenever another instance is started
AppInstance.prototype.anotherInstanceStarted = function( commandLineArguments, workingDirectory ) {
	debug( 'Another instance started, bringing to the front' );

	platform.restore();
	this.parseCommandLine( commandLineArguments, workingDirectory );

	return true;
};

AppInstance.prototype.isSingleInstance = function() {
	let shouldQuit;

	if ( config.isMacAppStore() === false ) {
		shouldQuit = app.makeSingleInstance( this.anotherInstanceStarted.bind( this ) );

		if ( shouldQuit ) {
			debug( 'App is already running, quitting' );
			app.quit();
			return false;
		}
	}

	return true;
};

module.exports = new AppInstance();
