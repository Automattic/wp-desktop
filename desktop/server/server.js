'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const log = require( 'lib/logger' )( 'desktop:server' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );

function showFailure( app ) {
	const dialog = require( 'electron' ).dialog;

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

function startServer( running_cb ) {
	var boot = require( 'server/boot' );
	var http = require( 'http' );
	var server = http.createServer( boot() );

	log.info( 'Server created, binding to ' + Config.server_port );

	server.listen( {
		port: Config.server_port,
		host: Config.server_host
	}, function() {
		log.info( 'Server started, passing back to app' );
		running_cb();
	} );
}

module.exports = {
	start: function( app, running_cb ) {
		log.info( 'Checking server port: ' + Config.server_port + ' on host ' + Config.server_host );

		portscanner.checkPortStatus( Config.server_port, Config.server_host, function( error, status ) {
			if ( error || status === 'open' ) {
				log.info( 'Port check failed - ' + status, error );
				showFailure( app );
				return;
			}

			log.info( 'Starting server' );
			startServer( running_cb );
		} );
	}
};
