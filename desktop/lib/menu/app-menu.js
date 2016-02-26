'use strict';

/**
 * External Dependencies
 */
const dialog = require( 'electron' ).dialog;

/**
 * Internal dependencies
 */
const ipc = require( 'lib/calypso-commands' );
const Config = require( 'lib/config' );
const Settings = require( 'lib/settings' );
const WindowManager = require( 'lib/window-manager' );
const platform = require( 'lib/platform' );
const debugMenu = require( './debug-menu' );
const i18n = require( 'lib/i18n' );

/**
 * Module variables
 */
const debugEnabled = Settings.getSettingGroup( Config.debug.enabled_by_default, 'debug' );

module.exports = function( app, mainWindow ) {
	let menuItems = [
		{
			label: i18n.translate( 'Preferences...', { context: 'Desktop App Menu Item' } ),
			accelerator: 'CmdOrCtrl+,',
			click: function() {
				WindowManager.openPreferences();
			}
		},
		{
			type: 'separator'
		},
		{
			label: i18n.translate( 'Sign Out' ),
			requiresUser: true,
			enabled: false,
			id: 'loggedin',
			click: function() {
				mainWindow.show();
				ipc.signOut( mainWindow );
			}
		},
		{
			type: 'separator'
		},
		{
			label: i18n.translate( 'Quit', { context: 'Desktop App Action' } ),
			accelerator: 'CmdOrCtrl+Q',
			click: function() {
				app.quit();
			}
		}
	];

	if ( Config.debug ) {
		menuItems.splice( 1, 0,
			{
				label: i18n.translate( 'Debug Mode' ),
				type: 'checkbox',
				checked: debugEnabled,
				click: function( menu ) {
					Settings.saveSetting( 'debug', menu.checked );

					dialog.showMessageBox( {
						buttons: [ i18n.translate( 'OK' ) ],
						title: i18n.translate( 'Restart' ),
						message: i18n.translate( 'Please restart the app for the change to have effect' ),
						detail: i18n.translate( "Sorry, we're unable to restart it for you right now" )
					} );
				}
			}
		);

		if ( platform.isOSX() === false ) {
			menuItems.splice( 1, 0, debugMenu[0], debugMenu[1] );
		}
	}

	if ( platform.isOSX() ) {
		// Add an 'about' item to the start of the menu, as per OS X standards
		menuItems.splice( 0, 0,
			{
				label: i18n.translate( 'About WordPress.com' ),
				click: function() {
					WindowManager.openAbout();
				}
			},
			{
				type: 'separator'
			}
		);

		// Add the standard OS X app items just before the quit
		menuItems.splice( menuItems.length - 1, 0,
			{
				label: i18n.translate( 'Services', { context: 'Desktop App "Services" Menu Item on OSX' } ),
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				label: i18n.translate( 'Hide WordPress.com', { context: 'Desktop App Window Action' } ),
				accelerator: 'Command+H',
				role: 'hide'
			},
			{
				label: i18n.translate( 'Hide Others', { context: 'Desktop App Window Action' } ),
				accelerator: 'Command+Shift+H',
				role: 'hideothers'
			},
			{
				label: i18n.translate( 'Show All', { context: 'Desktop App Window Action' } ),
				role: 'unhide'
			},
			{
				type: 'separator'
			}
		);
	}

	return menuItems;
};
