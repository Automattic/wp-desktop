'use strict';

/**
 * Internal dependencies
 */
const ipc = require( 'lib/calypso-commands' );
const i18n = require( 'lib/i18n' );

module.exports = function( mainWindow, status ) {
	status = status === 'enabled' ? true : false;

	return [
		{
			label: i18n.translate( 'My Sites' ),
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+1',
			click: function() {
				mainWindow.show();
				ipc.showMySites( mainWindow );
			}
		},
		{
			label: i18n.translate( 'Reader' ),
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+2',
			click: function() {
				mainWindow.show();
				ipc.showReader( mainWindow );
			}
		},
		{
			label: i18n.translate( 'My Profile' ),
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+3',
			click: function() {
				mainWindow.show();
				ipc.showProfile( mainWindow );
			}
		},
		{
			label: i18n.translate( 'Notifications' ),
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+4',
			click: function() {
				mainWindow.show();
				ipc.toggleNotifications( mainWindow );
			}
		},
		{
			label: i18n.translate( 'New Post' ),
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+N',
			click: function() {
				mainWindow.show();
				ipc.newPost( mainWindow );
			}
		}
	];
}
