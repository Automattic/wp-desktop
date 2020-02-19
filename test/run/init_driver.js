const { spawn } = require( 'child_process' );
const { PROJECT_DIR } = require( './paths' );

function initDriver( log ) {
    const driver = spawn( 'npx', [ 'chromedriver', '--port=9515', '--verbose' ],
        { stdio: [ 'ignore', log, log ], detached: true, cwd: PROJECT_DIR } );

    driver.on( 'error', err => {
        throw new Error( 'failed to initialize chromedriver: ', err );
    } );

    return driver
}

exports.initDriver = initDriver;
