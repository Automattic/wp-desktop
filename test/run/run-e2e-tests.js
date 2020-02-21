#!/usr/bin/env node

const path = require( 'path' );
const { promisify } = require( 'util' );
const { exec, spawn } = require( 'child_process' );
const { existsSync, openSync, mkdirSync } = require( 'fs' );

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

function initTests() {
    const tests = path.join( PROJECT_DIR, 'test', 'tests', 'e2e.js' );
    const cmd = `npx mocha ${ tests } --timeout 20000`;

    return new Promise( ( resolve, reject ) => {
        let tests = exec( cmd, ( error, stdout, stderr ) => {
            if ( error ) {
                reject( error );
                return
            } else {
                resolve( stdout? stdout : stderr );
            }
        } );
        tests.stdout.pipe( process.stdout );
        tests.stderr.pipe( process.stderr );
    } );
}

const delay = promisify( setTimeout );

let app;
let driver;

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