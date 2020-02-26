#!/usr/bin/env node

const path = require( 'path' );
const { promisify } = require( 'util' );
const { openSync, mkdirSync } = require( 'fs' );
const { execSync, spawn } = require( 'child_process' );

const PROJECT_DIR = path.join( __dirname, '../../' );
const BUILT_APP_DIR = path.join( PROJECT_DIR, 'release', 'mac', 'WordPress.com.app', 'Contents', 'MacOS' );

function spawnDetached( cwd, command, args, output ) {
    const app = spawn( command, args, { stdio: [ 'ignore', output, output ], detached: true, cwd } );
    app.on( 'error', err => {
        throw `failed to initialize command "${ command }": "${ err }"`;
    } );
    return app;
}

function initLogs( timestamp ) {
    const dir = path.join( PROJECT_DIR, 'test', 'logs', `${ timestamp }` );

    mkdirSync( dir, { recursive: true } );

    const appLog = openSync( path.join( dir, `app-${ timestamp }.log` ), 'a' );
    const driverLog = openSync( path.join( dir, `chromedriver-${ timestamp }.log` ), 'a' );

    if ( !appLog || !driverLog ) {
        throw 'failed to initialize logs';
    }

    return { appLog, driverLog };
}

const delay = promisify( setTimeout );

let app;
let driver;

function handleExit() {
    if ( driver ) {
        driver.kill();
    }
    if ( app ) {
        app.kill();
    }
}

// Handle both user-initiated (SIGINT) and normal termination.
process.on( 'SIGINT', function() {
    handleExit();
    process.exit();
} );

process.on( 'exit', handleExit );

async function run() {
    try {
        const requiredENVs = [ 'E2EUSERNAME', 'E2EPASSWORD', 'E2E_MAILOSAUR_INBOX' ];
        const missingENVs = requiredENVs.filter( name => ! process.env[name] || process.env[name] === '' );
        if ( missingENVs.length ) {
            throw `Missing non-empty ENV for: ${ missingENVs.join( ', ' ) }`;
        }

        // Replace `:` with `-` to format timestamp as YYYY-MM-DDTHH-MM-SS.mmmZ
        const timestamp = ( new Date() ).toJSON().replace( /:/g, '-' );
        const { appLog, driverLog } = initLogs( timestamp );

        app = spawnDetached( BUILT_APP_DIR, './WordPress.com', [
            '--disable-renderer-backgrounding',
            '--disable-http-cache',
            '--start-maximized',
            '--remote-debugging-port=9222',
        ], appLog );
        await delay( 5000 );

        driver = spawnDetached( PROJECT_DIR, 'npx', [
            'chromedriver',
            '--port=9515',
            '--verbose',
        ], driverLog );

        const tests = path.join( PROJECT_DIR, 'test', 'tests', 'e2e.js' );
        execSync( `npx mocha ${ tests } --timeout 20000`, { stdio: 'inherit' } );
    }
    catch ( err ) {
        console.error( err );
        process.exitCode = 1;
    }
    finally {
        // Explicitly call process.exit to ensure that spawned processes are killed.
        process.exit();
    }
}

run();