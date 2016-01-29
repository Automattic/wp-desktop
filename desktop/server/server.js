'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const debug = require( 'debug' )( 'desktop:server' );
const path = require( 'path' );
const fork = require( 'child_process' ).fork;

/**
 * Internal dependencies
 */
const Config = require( '../config' );

/**
 * Module variables
 */
const BOOT_TIMEOUT = 10000;
const ERROR_TIMEOUT = 1;
const ERROR_EXITEARLY = 2;

let didBoot = false;
let calypso = null;

function showFailure( app, error, code ) {
	const dialog = require( 'electron' ).dialog;
	let detail = 'Sorry but we failed to start the app. Are you running another copy of it?';

	detail += '\n\nError code = 000' + error;
	if ( error === ERROR_EXITEARLY ) {
		detail += ' (' + code + ')';
	}

	dialog.showMessageBox( {
		type: 'warning',
		title: 'WordPress',
		message: 'Failed to start the app',
		detail: detail,
		buttons: [ 'Quit' ]
	}, function() {
		app.quit();
	} );
}

function startServer( app, startedCallback ) {
	let appDir = path.join( __dirname, '..', '..', 'calypso' ),
		appFile = path.join( appDir, 'build', 'bundle-desktop.js' ),
		timer,
		env = Object.create( process.env );

	env.PORT = Config.server_port;
	env.NODE_PATH = [ 'server', 'client', '.' ].join( path.delimiter );   // Calypso require paths
	env.CALYPSO_IS_FORK = 1;
	env.ELECTRON_NO_ATTACH_CONSOLE = 1;

	debug( 'Loading server from file: ' + appFile );

	calypso = fork( appFile, [], {
		silent: true, // For access to std(out|err)
		cwd: appDir, // Force working directory to calypso root
		env: env
	} );

	// If Calypso fails to start for some reason, show an error.
	timer = setTimeout( function() {
		if ( didBoot ) {
			debug( 'App started' );
			return;
		}

		debug( 'Did not get boot signal from Calypso; exiting.' );
		showFailure( app, ERROR_TIMEOUT );
		killServer();
	}, BOOT_TIMEOUT );

	calypso.on( 'message', function( message ) {
		// We need to wait until the server has booted.
		// Wait until we get the signal.
		if ( message.boot && message.boot === 'ready' ) {
			debug( 'Yay! Server booted!' );
			didBoot = true;
			startedCallback();
		}
	} );

	// Debug
	calypso.stdout.on( 'data', function( data ) {
		debug( 'app.stdout: ' + data );
	} );

	calypso.stderr.on( 'data', function( data ) {
		debug( 'app.stderr: ' + data );
	} );

	calypso.on( 'error', function( err ) {
		debug( 'app.error with ', err );
	} );

	calypso.on( 'close', function( code, signal ) {
		debug( 'app.close with code: ' + ( code ? code : 0 ) + ' (' + signal + ')' );
	} );

	calypso.on( 'exit', function( code, signal ) {
		debug( 'app.exit with code: ' + ( code ? code : 0 ) + ' (' + signal + ')' );

		if ( !didBoot && code ) {
			clearTimeout( timer );
			showFailure( app, ERROR_EXITEARLY, code );
			killServer();
		}
	} );
}

function killServer() {
	if ( calypso ) {
		debug( 'Killing server' );
		calypso.kill();
		calypso = null;
		didBoot = false;
	}
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

			startServer( app, startedCallback );
		} );
	},
	kill: killServer
};
