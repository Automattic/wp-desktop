'use strict';

/**
 * External Dependencies
 */
const { ipcMain: ipc } = require( 'electron' );

module.exports = {
    /**
     * JSON object that stores references to loggers initialized
     * by calls from the renderer process over IPC (keyed by `namespace`).
     */
	_loggers: {},

    /**
     * Gets the logging object for the provided `namespace` (and creates a logger
     * if one doesn't exist). Logger references are tracked in the private
     * `_loggers` object and keyed by `namespace`.
     * @param {String} namespace Namespace of the logger to be used or initialized.
     * @param {Any} options Logger configuration.
	 * @returns {Object} Logger instance.
     */
	_getLogger: function( namespace, options ) {
		let logger = this._loggers[namespace];
		if ( !logger ) {
			logger = require( 'lib/logger' )( namespace, options );
			this._loggers[namespace] = logger;
		}
		return logger;
	},

    /**
     * Registers an ipc listener on the `log` channel to relay logging
     * events from the renderer process.
     */
	listen: function() {
		ipc.on( 'log', ( _, level, namespace, options, message, meta ) => {
			const logger = this._getLogger( namespace, options );

			switch ( level ) {
				case 'error':
					logger.error( message, meta );
					break;
				case 'warn':
					logger.warn( message, meta );
					break;
				case 'info':
					logger.info( message, meta );
					break;
				case 'debug':
					logger.debug( message, meta );
					break;
				case 'silly':
					logger.silly( message, meta );
					break;
			}
		} )
	}
}
