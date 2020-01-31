const { spawn } = require( 'child_process' );
const { MODULES_BIN } = require( './paths' );

function initDriver( log ) {
    const driver = spawn( 'node', [ 'chromedriver', '--port=9515', '--verbose' ],
        { stdio: [ 'ignore', log, log ], detached: true, cwd: MODULES_BIN } );

    driver.on( 'error', err => {
        throw new Error( 'failed to initialize chromedriver: ', err );
    } );

    return driver
}

exports.initDriver = initDriver;
