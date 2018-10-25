const debug = require( 'debug' )( 'desktop:analytics' );
const fetch = require( 'electron-fetch' ).default

function buildQuerystring( group, name ) {
	let uriComponent = '';

	if ( 'object' === typeof group ) {
		for ( const key in group ) {
			uriComponent += '&x_' + encodeURIComponent( key ) + '=' + encodeURIComponent( group[key] );
		}
	} else {
		uriComponent = '&x_' + encodeURIComponent( group ) + '=' + encodeURIComponent( name );
	}

	return uriComponent;
}

export async function bumpStat( group, name ) {
	if ( 'object' === typeof group ) {
		debug( 'Bumping stats %o', group );
	} else {
		debug( 'Bumping stat %s:%s', group, name );
	}

	const uriComponent = buildQuerystring( group, name );
	const url = `https://pixel.wp.com/g.gif?v=wpcom-no-pv${uriComponent}&t=${Math.random()}`;

	const resp = await fetch( url );
	if ( resp.status === 200 ) {
		debug( 'Sent analytics ping' );
	} else {
		debug( 'Analytics ping failed', resp.status, resp.statusText );
	}
};

// Cet analytics conform version string
// version string needs to be formatted without `.`
export function sanitizeVersion( version ) {
	return version.replace( /\./g, '-' );
}

const PLATFORMS = {
	darwin: 'osx',
	win32: 'windows',
	linux: 'linux',
}

// Get analytics conform platform string
export function getPlatform( platform ) {
	return PLATFORMS[platform];
}
