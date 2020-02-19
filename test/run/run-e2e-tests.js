#!/usr/bin/env node
const { promisify } = require( 'util' );
const { initApp } = require( './init_app' );
const { initLogs } = require( './init_logs' );
const { initTests } = require( './init_tests' );
const { initDriver } = require( './init_driver' );

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

function usernameExists() {
    return ( process.env.E2EUSERNAME && process.env.E2EUSERNAME !== '' ) ? true : false;
}

function passwordExists() {
    return ( process.env.E2EPASSWORD && process.env.E2EPASSWORD !== '' ) ? true : false;
}

function emailExists() {
    return ( process.env.E2E_MAILOSAUR_INBOX && process.env.E2E_MAILOSAUR_INBOX !== '' ? true : false )
} 

async function run() {
    if ( !usernameExists() ) {
        console.log( 'Environment variable E2EUSERNAME not set, exiting.' );
        process.exit();
    }
    if ( !passwordExists() ) {
        console.log( 'Environment variable E2EPASSWORD not set, exiting.' );
        process.exit();
    }

    if ( !emailExists() ) {
        console.log('Environment variable E2E_MAILOSAUR_INBOX not set, exiting');
        process.exit();
    }

    try {
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