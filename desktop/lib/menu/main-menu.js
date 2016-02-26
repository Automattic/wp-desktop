'use strict';

/**
 * Internal dependencies
 */
const appMenu = require( './app-menu' );
const editMenu = require( './edit-menu' );
const viewMenu = require( './view-menu' );
const windowMenu = require( './window-menu' );
const helpMenu = require( './help-menu' );
const platform = require( 'lib/platform' );
const i18n = require( 'lib/i18n' );

module.exports = function( app, mainWindow ) {
	let menu = [
		{
			label: platform.isOSX() ? 'WordPress.com' : i18n.translate( 'File', { context: 'Desktop App Menu Item' } ),
			submenu: appMenu( app, mainWindow )
		},
		{
			label: i18n.translate( 'Edit', { context: 'Desktop App Menu Item' } ),
			submenu: editMenu
		},
		{
			label: i18n.translate( 'Window', { context: 'Desktop App Menu Item' } ),
			role: 'window',
			submenu: windowMenu( mainWindow )
		},
		{
			label: i18n.translate( 'Help', { context: 'Desktop App Menu Item' } ),
			role: 'help',
			submenu: helpMenu( mainWindow )
		}
	];

	if ( platform.isOSX() ) {
		// OS X needs a view menu for 'enter full screen' - insert just after the edit menu
		menu.splice( 2, 0, {
			label: i18n.translate( 'View', { context: 'Desktop App Menu Item' } ),
			submenu: viewMenu
		} );
	}

	return menu;
};
