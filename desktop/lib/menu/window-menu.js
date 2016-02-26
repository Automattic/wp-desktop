'use strict';

/**
 * Internal dependencies
 */
const calypsoMenu = require( './calypso-menu' );
const platform = require( 'lib/platform' );
const i18n = require( 'lib/i18n' );

module.exports = function( mainWindow ) {
	let menu = calypsoMenu( mainWindow ).concat(
		{
			type: 'separator'
		},
		{
			label: i18n.translate( 'Minimize', { context: 'Desktop App Window Action' } ),
			accelerator: 'CmdOrCtrl+M',
			role: 'minimize'
		},
		{
			label: i18n.translate( 'Close', { context: 'Desktop App Window Action' } ),
			accelerator: 'CmdOrCtrl+W',
			role: 'close'
		}
	);

	if ( platform.isOSX() ) {
		menu.push( { type: 'separator' } );
		menu.push( { label: i18n.translate( 'Bring All to Front', { context: 'Desktop App Window Action' } ), role: 'front' } );
	}

	return menu
};
