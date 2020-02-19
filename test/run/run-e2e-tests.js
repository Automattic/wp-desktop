#!/usr/bin/env node

const { promisify } = require( 'util' );
const { initApp } = require( './init_app' );
const { initLogs } = require( './init_logs' );
const { initTests } = require( './init_tests' );
const { initDriver } = require( './init_driver' );
const { checkCredentials } = require( './checks' );

let app;
let driver;

const delay = promisify( setTimeout );

// Handle both user-initiated (SIGINT) and normal termination.
process.on( 'SIGINT', function() {
    handleExit();
    process.exit();
} );

process.on( 'exit', handleExit );
function handleExit() {
    if ( driver ) {
        driver.kill();
    }
    if ( app ) {
        app.kill();
    }
}

async function run() {
    try {
        checkCredentials();

        const timestamp = ( new Date() ).toJSON().replace( /:/g, '-' );
        const { appLog, driverLog } = initLogs( timestamp );

        app = initApp( appLog );
        await delay( 5000 );

        driver = initDriver( driverLog );

        await initTests();
    }
    catch ( err ) {
        console.error( err );
    }
    finally {
        process.exit();
    }
}

run();