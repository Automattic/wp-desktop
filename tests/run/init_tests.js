const { exec } = require( 'child_process' );
const { MOCHA, E2E } = require( './paths' );

function initTests() {
    const args = '--timeout 20000';
    const cmd = `node "${MOCHA}" "${E2E}" ${args}`;

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