/**
 * External Dependencies
 */

const electron = require( 'electron' );
const ipcMain = electron.ipcMain;
const expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
const boot = require( '../../release/WordPress.com-darwin-x64-unpacked/desktop/app' );

describe( 'check app loads', () => {

	it( 'should have calypso in DOM', done => {
		boot( mainWindow => {
			// We need to wait for the page to load before sending the request
			mainWindow.webContents.on( 'did-finish-load', () => {
				mainWindow.webContents.send( 'is-calypso' );
			} );

			ipcMain.on( 'is-calypso-response', (ev, value) => {
				expect( value ).to.be.true;
				done();
			});
		});
	});

});
