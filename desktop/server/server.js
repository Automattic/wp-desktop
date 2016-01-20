'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const debug = require( 'debug' )( 'desktop:server' );

/**
 * Internal dependencies
 */
const Config = require( '../config' );

function showFailure( app ) {
	const dialog = require( 'dialog' );

	dialog.showMessageBox( {
		type: 'warning',
		title: 'WordPress',
		message: 'Failed to start the app',
		detail: 'Sorry but we failed to start the app. Are you running another copy of it?',
		buttons: [ 'Quit' ]
	}, function() {
		app.quit();
	} );
}

function startServer( startedCallback ) {
	var path = require( 'path' ),
		fork = require( 'child_process' ).fork,
		appFile = path.resolve( process.cwd(), 'calypso', 'build', 'bundle-desktop.js' ),
		env = Object.create( process.env ),
		startedSignal = 'wp-calypso booted',
		app;

	env.PORT = Config.server_port;
	env.NODE_PATH = 'server:client:.';

	debug( 'Loading server from file: ' + appFile );

	app = fork( appFile, [], {
		silent: true,
		cwd: path.resolve( process.cwd(), 'calypso' ), // Force working directory to calypso root
		env: env
	} );

	app.stdout.on( 'data', function( data ) {
		// We need to wait until the server has booted.
		// Let's use the "booted" message as a signal that it's ready.
		var str = data.toString();
		if ( str.indexOf( startedSignal ) === 0 ) {
			debug( 'Server booted...' );
			startedCallback();
		}
		debug( 'app.stout: ' + data );
	} );

	app.stderr.on( 'data', function( data ) {
		debug( 'app.stderr: ' + data );
	} );

	app.on( 'close', function( code, signal ) {
		debug( 'app.close with code: ' + ( code ? code : 0 ) + ' (' + signal + ')' );
	} );
}

module.exports = {
	start: function( app, startedCallback ) {
		debug( 'Checking server port: ' + Config.server_port + ' on host ' + Config.server_host );

		portscanner.checkPortStatus( Config.server_port, Config.server_host, function( error, status ) {
			if ( error || status === 'open' ) {
				debug( 'Port check failed - ' + status, error );
				showFailure( app );
				return;
			}

			startServer( startedCallback );
		} );
	}
};
