'use strict';

/**
 * Internal dependencies
 */
const i18n = require( 'lib/i18n' );

module.exports = [
	{
		label: i18n.translate( 'Undo', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+Z',
		role: 'undo'
	},
	{
		label: i18n.translate( 'Redo', { context: 'Desktop App Action' } ),
		accelerator: 'Shift+CmdOrCtrl+Z',
		role: 'redo'
	},
	{
		type: 'separator'
	},
	{
		label: i18n.translate( 'Cut', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+X',
		role: 'cut'
	},
	{
		label: i18n.translate( 'Copy', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+C',
		role: 'copy'
	},
	{
		label: i18n.translate( 'Paste', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+V',
		role: 'paste'
	},
	{
		label: i18n.translate( 'Select All', { context: 'Desktop App Action' } ),
		accelerator: 'CmdOrCtrl+A',
		role: 'selectall'
	}
];
