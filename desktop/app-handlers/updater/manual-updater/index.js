'use strict';

/**
 * External Dependencies
 */
const { app, shell } = require( 'electron' );
const fetch = require( 'electron-fetch' ).default;
const yaml = require( 'js-yaml' );
const semver = require( 'semver' );
const debug = require( 'debug' )( 'desktop:updater:manual' );

/**
 * Internal dependencies
 */
const Updater = require( 'lib/updater' );
const { bumpStat, sanitizeVersion, getPlatform } = require( 'lib/desktop-analytics' );

const statsPlatform = getPlatform( process.platform )
const sanitizedVersion = sanitizeVersion( app.getVersion() );

const getStatsString = ( isBeta ) => `${statsPlatform}${isBeta ? '-b' : ''}-${sanitizedVersion}`;

class ManualUpdater extends Updater {
	constructor( { apiUrl, downloadUrl, options = {} } ) {
		super( options );

		this.apiUrl = apiUrl;
		this.downloadUrl = downloadUrl;
	}

	async ping() {
		const options = {
			headers: {
				'User-Agent': `WP-Desktop/${app.getVersion()}`,
			},
		};

		try {
			const url = `${this.apiUrl}${!this.beta ? '/latest' : ''}`;
			debug( 'Checking for update. Fetching:', url );
			debug( 'Checking for beta release:', this.beta )

			const releaseResp = await fetch( url, options );

			if ( releaseResp.status !== 200 ) {
				return;
			}

			let releaseBody = await releaseResp.json();

			if ( this.beta ) {
				const prerelease = releaseBody.find( ( d ) => d.prerelease );
				if ( prerelease ) {
					releaseBody = prerelease;
				}
			}

			const releaseAsset = releaseBody.assets.find(
				release => release.name === 'latest.yml'
			);
			if ( releaseAsset ) {
				const configResp = await fetch(
					releaseAsset.browser_download_url,
					options
				);

				if ( configResp.status !== 200 ) {
					return;
				}

				const configBody = await configResp.text();
				const releaseConfig = yaml.safeLoad( configBody );

				if ( semver.lt( app.getVersion(), releaseConfig.version ) ) {
					debug(
						'New update is available, prompting user to update to',
						releaseConfig.version
					);

					bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-needs-update` );

					this.setVersion( releaseConfig.version );
					this.notify();
				} else {
					debug( 'Update is not available' );

					bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-no-update` );
					return;
				}
			}
		} catch ( err ) {
			debug( err.message );
			bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-check-failed` );
		}
	}

	onConfirm() {
		shell.openExternal( `${this.downloadUrl}${this.beta ? '?beta=1' : ''}` );

		bumpStat( 'wpcom-desktop-update', `${getStatsString( this.beta )}-dl-update` );
	}

	onCancel() {
		bumpStat( 'wpcom-desktop-update', `${getStatsString( this.beta )}-update-cancel` );
	}
}

module.exports = ManualUpdater;
