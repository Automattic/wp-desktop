const { spawn } = require( 'child_process' );
const { BUILT_APP_DIR } = require( './paths' );

function initApp( log ) {
    const startCmd = './'

    const app = spawn( startCmd + 'WordPress.com', [
        '--disable-renderer-backgrounding', '--disable-http-cache',
        '--start-maximized', '--remote-debugging-port=9222' ],
        { stdio: [ 'ignore', log, log ], detached: true, cwd: BUILT_APP_DIR }
    );

    app.on( 'error', err => {
       throw new Error( 'failed to initialize app: ', err );
    } );

    return app;
}

exports.initApp = initApp;
