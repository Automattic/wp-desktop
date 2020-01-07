#!/usr/bin/env node

const { exec, spawn } = require( 'child_process' )
const path = require( 'path' );
const fs = require( 'fs' );

const project = path.join( __dirname, '../..' );
const nodeModules = path.join( project, 'node_modules', '.bin' );

const date = ( new Date() ).toJSON().replace( /:/g, '-' );
const logDir = path.join( project, 'test', 'logs', `${date}` );

let driver;
let app;

function wait( t, fn ) {
    return new Promise( function( resolve ) {
        setTimeout( resolve.bind( null, fn ), t )
    } );
}

function initDriver() {
    let log = fs.openSync( path.join( logDir, `chromedriver-${date}.log` ), 'a' );

    driver = spawn( 'node', [ 'chromedriver', '--port=9515', '--verbose' ],
        { stdio: [ 'ignore', log, log ], detached: true, cwd: nodeModules } );

    return new Promise( ( resolve, reject ) => {
        if ( driver ) {
            resolve();
        } else {
            reject( 'failed to initialize chromedriver' );
        }
    } )
}

function initApp() {
    // TODO: Mac-only for now, but builtAppDir and startCmd can be constructed per platform.
    let builtAppDir = path.join( project, 'release', 'mac', 'WordPress.com.app', 'Contents', 'MacOS' );
    let startCmd = './'

    let log = fs.openSync( path.join( logDir, `app-${date}.log` ), 'a' );

    app = spawn( startCmd + 'WordPress.com', [
        '--disable-renderer-backgrounding', '--disable-http-cache',
        '--start-maximized', '--remote-debugging-port=9222' ],
        { stdio: [ 'ignore', log, log ], detached: true, cwd: builtAppDir }
    );

    return new Promise( ( resolve, reject ) => {
        if ( app ) {
            resolve();
        } else {
            reject ( 'Failed to initialize app.' );
        }
    } )
}

function runTests() {
    const mocha = path.join( nodeModules, 'mocha' );
    const e2e = path.join( project, 'test', 'tests', 'e2e.js' );
    const args = '--timeout 20000';

    const cmd = `node "${mocha}" "${e2e}" ${args}`;

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
    })
}

// Handle both user-initiated (SIGINT) and normal termination.
process.on( 'SIGINT', function() {
    handleExit();
    process.exit();
})

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

function initLogDir() {
    if ( !fs.existsSync( logDir ) ) {
        fs.mkdirSync( logDir, { recursive: true } );
    }
}

function run() {
    const appInitWaitMs = 5000;

    if ( !usernameExists() ) {
        console.log( 'Environmental variable E2EUSERNAME not set, exiting.' );
        process.exit();
    }

    if ( !passwordExists() ) {
        console.log( 'Environmental variable E2EPASSWORD not set, exiting.' );
        process.exit();
    }

    initLogDir();

    initApp()
        .then ( async function() {
            await wait( appInitWaitMs );
            return initDriver();
        } )
        .then( runTests )
        .catch( ( error ) => console.log( error ) )
        .finally( function() {
            process.exit();
        } )
}

run();
