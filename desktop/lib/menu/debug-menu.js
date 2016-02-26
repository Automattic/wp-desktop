'use strict';

/**
 * External Dependencies
 */
const BrowserWindow = require( 'electron' ).BrowserWindow;

/**
 * Internal dependencies
 */
const i18n = require( 'lib/i18n' );

module.exports = [
	{
		label: i18n.translate( 'Reload', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+R',
		click: function() {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				focusedWindow.reload();
			}
		}
	},
	{
		label: i18n.translate( 'Developer Tools', { context: 'Desktop App Tool' } ),
		accelerator: 'Alt+CmdOrCtrl+I',
		click: function() {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				focusedWindow.toggleDevTools();
			}
		}
	}
];
