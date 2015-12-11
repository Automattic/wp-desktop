'use strict';

/**
 * External Dependencies
 */
const ipc = require( 'electron' ).ipcMain;
const dialog = require( 'dialog' );

/**
 * Internal dependencies
 */
const Settings = require( 'lib/settings' );

module.exports = function() {
	ipc.on( 'preferences-changed-proxy-type', function() {
		const proxyOptions = {
			buttons: [ 'Ok' ],
			title: 'Proxy changed',
			message: 'You have changed the proxy settings.',
			detail: 'The app needs to be restarted for this to take effect.'
		};

		// Warn user they need to restart the app
		dialog.showMessageBox( proxyOptions, function() {} );
	} );

	ipc.on( 'preferences-changed', function( event, arg ) {
		Settings.saveSetting( arg.name, arg.value );
	} );
};
