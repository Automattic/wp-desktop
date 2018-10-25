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

class ManualUpdater extends Updater {
	constructor( { apiUrl, downloadUrl, options = {} } ) {
		super( options );

		this.apiUrl = apiUrl;
		this.downloadUrl = downloadUrl;
		this.latestReleaseTag = null;
	}

	async ping() {
		const options = {
			headers: {
				'User-Agent': `WP-Desktop/${app.getVersion()}`,
			},
		};

		try {
			debug( 'is beta', this.beta )
			const url = `${this.apiUrl}${!this.beta ? '/latest' : ''}`;
			debug( 'Checking for update. Fetching:', url );

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
					this.latestReleaseTag = releaseBody.tag_name;

					bumpStat( 'wpcom-desktop-update-check', `${statsPlatform}${this.beta ? '-beta' : ''}-${sanitizedVersion}-needs-update` );

					this.setVersion( releaseConfig.version );
					this.notify();
				} else {
					debug( 'Update is not available' );

					bumpStat( 'wpcom-desktop-update-check', `${statsPlatform}${this.beta ? '-beta' : ''}-${sanitizedVersion}-no-update` );
					return;
				}
			}
		} catch ( err ) {
			debug( err.message );
		}
	}

	onConfirm() {
		shell.openExternal( `${this.downloadUrl}${this.latestReleaseTag ? `/tag/${this.latestReleaseTag}` : ''}` );
	}
}

module.exports = ManualUpdater;
