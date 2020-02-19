const { exec } = require( 'child_process' );
const { E2E_TESTS } = require( './paths' );

function initTests() {
    const args = '--timeout 20000';
    const cmd = `npx mocha "${E2E_TESTS}" ${args}`;

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

exports.initTests = initTests;