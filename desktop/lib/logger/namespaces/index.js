/**
 * Credit: Modified from `winston-namespace` by @SetaSouto:
 * 	https://github.com/SetaSouto/winston-namespace
 */

module.exports = {
	/**
	 * Boolean indicating if the object is populated with the environment data.
	 */
	_populated: false,
	/**
	 * Populates the private data '_namespaces' as an array with the different namespaces from the LOG_NAMESPACES
	 * environment variable. It splits the data with ',' as separator.
	 * @private
	 */
	_populate: function() {
		let envString = process.env.DEBUG
		this._namespaces = envString ? envString.split( ',' ) : []
		this._populated = true
	},
	/**
	 * Checks if the namespace is available to debug. The namespace could be contained in wildcards.
	 * Ex: 'server:api:controller' would pass the check (return true) if the 'server:api:controller' is in the
	 * environment variable or if 'server:api:*' or 'server:*' is in the environment variable.
	 * @param namespace {String} - Namespace to check.
	 * @returns {boolean} Whether or not the namespace is available.
	 */
	check: function( namespace ) {
		if ( !this._populated ) this._populate()
		if ( this._namespaces.indexOf( '*' ) !== -1 ) return true
		if ( this._namespaces.indexOf( namespace ) !== -1 ) return true
		/* If it is as 'server:api:controller', it could have a wildcard as 'server:*' */
		if ( namespace.indexOf( ':' ) !== -1 ) {
			/* Different levels of the namespace. Using the example of above: 'server' is level 0, 'api' is level 1 and
			 * 'controller' is level 2. */
			let levels = namespace.split( ':' )
			let level
			for ( let i = 1; i < levels.length; i++ ) {
				level = levels.slice( 0, i ).join( ':' ) + ':*'
				if ( this._namespaces.indexOf( level ) !== -1 ) return true
			}
		}
		return false
	}
}
