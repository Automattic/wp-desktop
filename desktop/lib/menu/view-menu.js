'use strict';

const BrowserWindow = require( 'electron' ).BrowserWindow;

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );
const debugMenu = require( './debug-menu' );
const i18n = require( 'lib/i18n' );

/**
 * Module variables
 */
let menuItems = [];

if ( Config.debug ) {
	menuItems = debugMenu;
}

menuItems.push(
	{
		label: i18n.translate( 'Toggle Full Screen', { context: 'Desktop App Action' } ),
		fullscreen: true,
		click: function() {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				let toggle = !focusedWindow.isFullScreen();

				focusedWindow.setFullScreen( toggle );
			}
		}
	}
);

module.exports = menuItems;
