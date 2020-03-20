'use strict';

/**
 * External dependencies
 */
const path = require( 'path' );
const { app, dialog } = require( 'electron' );

/**
 * Internal dependencies
 */
const state = require( 'lib/state' );
const system = require( 'lib/system' );
const { zipContents } = require( 'lib/archiver' );
const log = require( 'lib/logger' )( 'desktop:get-logs' );

/**
 * Module variables
 */
const logPath = state.getLogPath();

function pad( n ) {
	return n < 10 ? '0' + n : n;
}

const localDateTime = () => {
	const now = new Date();
	return now.getFullYear() +
		'-' +
		pad( now.getMonth() + 1 ) +
		'-' +
		pad( now.getDate() ) +
		'T' +
		pad( now.getHours() ) +
		'.' +
		pad( now.getMinutes() ) +
		'.' +
		pad( now.getSeconds() ) +
		'.' +
		pad( now.getMilliseconds() );
}

module.exports = async function( window ) {
	const onZipped = async () => {
		await dialog.showMessageBox( window, {
			type: 'info',
			buttons: [ 'OK' ],
			title: 'Zipped logs to desktop',
			message: 'Logs saved to your desktop'
		} )
	}

	const onError = async ( error ) => {
		await dialog.showErrorBox(
			'Error zipping activity logs.' +
			'\n\n' +
			'Please contact help@wordpress.com and mention the error details below:' +
			'\n\n' +
			error.stack +
			'\n\n' +
			'System info: ' + JSON.stringify( system.getVersionData() )
		)
	}

	try {
		const timestamp = localDateTime();
		const desktop = app.getPath( 'desktop' );
		const dst = path.join( desktop, `wpdesktop-${ timestamp }.zip` );

		zipContents( [ logPath ], dst, onZipped );
	} catch ( error ) {
		log.error( 'Failed to zip logs: ', error );
		onError( error );
	}
}

