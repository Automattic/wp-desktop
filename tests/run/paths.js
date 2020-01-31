const path = require( 'path' );

const project = path.join( __dirname, '../../' );

const MODULES_BIN = path.join( project, 'node_modules', '.bin' );
const MOCHA = path.join( MODULES_BIN, 'mocha' );
const E2E = path.join( project, 'test', 'tests', 'e2e.js' );
const BUILT_APP_DIR = path.join( project, 'release', 'mac', 'WordPress.com.app', 'Contents', 'MacOS' );

const logDir = ( timestamp ) => path.join( project, 'test', 'logs', `${ timestamp }` );

exports.MODULES_BIN = MODULES_BIN;
exports.MOCHA = MOCHA;
exports.E2E = E2E;
exports.BUILT_APP_DIR = BUILT_APP_DIR;
exports.logDir = logDir;
