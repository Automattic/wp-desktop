/**
 * External Dependencies
 */
const { app, dialog } = require( 'electron' );
const { EventEmitter } = require( 'events' );
const debug = require( 'debug' )( 'desktop:updater' );

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );
const config = require( 'lib/config' );

class Updater extends EventEmitter {
	constructor( options ) {
		super();

		this.confirmLabel = options.confirmLabel || 'Update & Restart';
		this.dialogTitle =
		options.dialogTitle || 'A new version of {name} is available!';
		this.dialogMessage =
		options.dialogMessage ||
		'{name} {newVersion} is now available — you have {currentVersion}. Would you like to update now?';
		this.beta = options.beta || false;

		this._version = '';
		this._hasPrompted = false;
	}

	ping() {}

	onDownloaded( info ) {
		debug( 'Update downloaded', info );
	}

	onAvailable( info ) {
		debug( 'Update is available', info );
	}

	onNotAvailable( info ) {
		debug( 'Update is not available', info );
	}

	onError( event ) {
		debug( 'Update error', event );
	}

	onConfirm() {}

	onCancel() {}

	notify() {
		const updateDialogOptions = {
			buttons: [this.sanitizeButtonLabel( this.confirmLabel ), 'Cancel'],
			title: 'Update Available',
			message: this.expandMacros( this.dialogTitle ),
			detail: this.expandMacros( this.dialogMessage ),
		};

		if ( !this._hasPrompted ) {
			this._hasPrompted = true;

			dialog.showMessageBox( updateDialogOptions, button => {
				this._hasPrompted = false;

				if ( button === 0 ) {
					// Confirm
					this.onConfirm();
				} else {
					this.onCancel();
				}

				this.emit( 'end' );
			} );
		}
	}

	setVersion( version ) {
		this._version = version;
	}

	expandMacros( originalText ) {
		const macros = {
			name: config.appName,
			currentVersion: app.getVersion(),
			newVersion: this._version,
		};

		let text = originalText;

		for ( const key in macros ) {
			if ( macros.hasOwnProperty( key ) ) {
				text = text.replace( new RegExp( `{${key}}`, 'ig' ), macros[key] );
			}
		}

		return text;
	}

	sanitizeButtonLabel( value ) {
		if ( platform.isWindows() ) {
			return value.replace( '&', '&&' );
		}

		return value;
	}
}

module.exports = Updater;
