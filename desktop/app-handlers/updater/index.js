'use strict';

/**
 * External Dependencies
 */
const { app } = require( 'electron' );
const debug = require( 'debug' )( 'desktop:updater' );

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );
const Config = require( 'lib/config' );
const settings = require( 'lib/settings' );
const AutoUpdater = require( './auto-updater' );
const ManualUpdater = require( './manual-updater' );

let updater = false;

module.exports = function() {
	debug( 'Updater config is', Config.updater )
	if ( Config.updater ) {
		app.on( 'will-finish-launching', function() {
			const beta = settings.getSetting( 'release-channel' ) === 'beta';
			debug( 'Update channel', settings.getSetting( 'release-channel' ) )
			if ( platform.isOSX() || platform.isWindows() || process.env.APPIMAGE ) {
				debug( 'Auto Update' )
				updater = new AutoUpdater( {
					beta,
				} );
			} else {
				debug( 'Manual Update' )
				updater = new ManualUpdater( {
					downloadUrl: Config.updater.downloadUrl,
					apiUrl: Config.updater.apiUrl,
					options: {
						dialogMessage:
							'{name} {newVersion} is now available — you have {currentVersion}. Would you like to download it now?',
						confirmLabel: 'Download',
						beta,
					},
				} );
			}

			// Start one straight away
			setTimeout( updater.ping.bind( updater ), Config.updater.delay );
			setInterval( updater.ping.bind( updater ), Config.updater.interval );
		} );
	} else {
		debug( 'Skipping Update – no configuration' )
	}
};
