const path = require( 'path' );
const { logDir } = require( './paths' );
const { existsSync, openSync, mkdirSync } = require( 'fs' );

function initLogs( timestamp ) {
    const dir = logDir( timestamp );

    if ( !existsSync( dir ) ) {
        mkdirSync( dir, { recursive: true } );
    }

    const appLog = openSync( path.join( dir, `app-${ timestamp }.log` ), 'a' );
    const driverLog = openSync( path.join( dir, `chromedriver-${ timestamp }.log` ), 'a' );

    if ( !appLog || !driverLog ) {
        throw 'failed to initialize logs';
    }

    return { appLog, driverLog };
}

exports.initLogs = initLogs;
