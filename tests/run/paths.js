const path = require( 'path' );

const PROJECT_DIR = path.join( __dirname, '../../' );
const E2E_TESTS = path.join( PROJECT_DIR, 'test', 'tests', 'e2e.js' );
const BUILT_APP_DIR = path.join( PROJECT_DIR, 'release', 'mac', 'WordPress.com.app', 'Contents', 'MacOS' );

const logDir = ( timestamp ) => path.join( PROJECT_DIR, 'test', 'logs', `${ timestamp }` );

exports.logDir = logDir;
exports.E2E_TESTS = E2E_TESTS;
exports.PROJECT_DIR = PROJECT_DIR;
exports.BUILT_APP_DIR = BUILT_APP_DIR;
