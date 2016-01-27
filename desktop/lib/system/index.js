'use strict';

/**
 * External Dependencies
 */

const Platform = require( 'lib/platform' );
const exec = require( 'child_process' ).execSync;
const debug = require( 'debug' )( 'desktop:system' );

/**
 * Internal dependencies
 */
const APPS_DIRECTORY = '/Applications';

function isPinned() {
	if ( Platform.isOSX() ) {
		try {
			let cmd = "defaults read com.apple.dock persistent-apps | grep 'WordPress.com'";

			exec( cmd, {} );
			return true;
		} catch ( e ) {
			return false;
		}
	}

	return false;
}

function isInstalled() {
	if ( __dirname.substr( 0, APPS_DIRECTORY.length ) === APPS_DIRECTORY ) {
		return true;
	}

	return false;
}

module.exports = {
	getDetails: function() {
		let details = {
			pinned: isPinned(),
			platform: Platform.getPlatformString(),
			installed: isInstalled()
		}

		debug( 'System details: ', details );
		return details;
	}
};
