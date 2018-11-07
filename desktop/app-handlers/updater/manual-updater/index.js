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

const requestOptions = {
	headers: {
		'User-Agent': `WP-Desktop/${app.getVersion()}`,
	},
};

class ManualUpdater extends Updater {
	constructor( { apiUrl, downloadUrl, options = {} } ) {
		super( options );

		this.apiUrl = apiUrl;
		this.downloadUrl = downloadUrl;

		this.isEffectiveBeta = false;
	}

	async ping() {
		try {
			const url = this.apiUrl;
			debug( 'Checking for update. Fetching:', url );
			debug( 'Checking for beta release:', this.beta )

			const releaseResp = await fetch( url, requestOptions );

			if ( releaseResp.status !== 200 ) {
				return;
			}

			const releases = await releaseResp.json();

			const latestStableRelease = releases.find( ( d ) => !d.prerelease );
			const latestBetaRelease = releases.find( ( d ) => d.prerelease );

			if ( ( !latestStableRelease && !this.beta ) ) {
				debug( 'No stable release found' );
				return;
			};

			let latestStableReleaseVersion;
			if ( latestStableRelease ) {
				const assetUrl = this.getConfigUrl( latestStableRelease.assets );
				latestStableReleaseVersion = await this.getReleaseVersion( assetUrl );
			}

			let latestReleaseVersion;

			if ( this.beta && latestBetaRelease ) {
				let latestBetaReleaseVersion;
				const assetUrl = this.getConfigUrl( latestBetaRelease.assets );
				latestBetaReleaseVersion = await this.getReleaseVersion( assetUrl );

				if ( semver.valid( latestStableReleaseVersion ) &&
					semver.valid( latestBetaReleaseVersion ) &&
					semver.lt( latestBetaReleaseVersion, latestStableReleaseVersion ) ) {
					latestReleaseVersion = latestStableReleaseVersion;

					debug( 'Latest stable version is newer than latest latest beta. Switching to stable channel:', latestReleaseVersion );
				} else if ( semver.valid( latestBetaReleaseVersion ) ) {
					latestReleaseVersion = latestBetaReleaseVersion;

					this.isEffectiveBeta = true;
				}
			} else if ( latestStableReleaseVersion ) {
				latestReleaseVersion = latestStableReleaseVersion;
			}

			if ( !latestReleaseVersion ) {
				debug( 'No release found' );

				return;
			}

			if ( semver.lt( app.getVersion(), latestReleaseVersion ) ) {
				debug( 'New update is available, prompting user to update to', latestReleaseVersion );
				bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-needs-update` );

				this.setVersion( latestReleaseVersion );
				this.notify();
			} else {
				debug( 'Update is not available' );
				bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-no-update` );

				return;
			}
		} catch ( err ) {
			console.log( err );
			bumpStat( 'wpcom-desktop-update-check', `${getStatsString( this.beta )}-check-failed` );
		}
	}

	onConfirm() {
		shell.openExternal( `${this.downloadUrl}${this.isEffectiveBeta ? '?beta=1' : ''}` );

		bumpStat( 'wpcom-desktop-update', `${getStatsString( this.beta )}-dl-update` );
	}

	onCancel() {
		bumpStat( 'wpcom-desktop-update', `${getStatsString( this.beta )}-update-cancel` );
	}

	getConfigUrl( assets ) {
		const asset = assets.find(
			file => file.name === 'latest.yml'
		);

		return asset.browser_download_url || null;
	}

	async getReleaseVersion( url ) {
		try {
			const resp = await fetch(
				url,
				requestOptions
			);

			if ( resp.status !== 200 ) {
				return null;
			}

			const body = await resp.text();
			const config = yaml.safeLoad( body );

			return config.version || null;
		} catch ( err ) {
			console.log( err );
		}
	}
}

module.exports = ManualUpdater;
