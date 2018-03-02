// TODO: evaluate if there is a more straightforward way to create config files e.g. how does calypso solve this?
const CONFIG_SRC_DIR = '../../desktop-config/';
const CONFIG_DEST = './desktop/config.json';

const path = require( 'path' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );

const baseConfig = require( path.join( CONFIG_SRC_DIR, 'config-base.json' ) );

const { NODE_ENV } = process.env;
let envConfig = {};

try {
	envConfig = require( path.join( CONFIG_SRC_DIR, `config-${NODE_ENV}.json` ) );
	console.log( chalk.cyan( `Using "config-${NODE_ENV}.json" to extend config` ) );
} catch ( err ) {
	console.log( chalk.yellow( `Config file for environment "${NODE_ENV}" does not exist. Ignoring Environment.` ) );
}

// if linux, add icon to mainWindow
if ( ( process.argv.length > 2 ) && ( process.argv[3] === 'linux' ) ) {
	Object.assign( baseConfig.mainWindow, { icon: '/usr/share/pixmaps/wpcom.png' } );
}

const config = Object.assign( baseConfig, envConfig );

fs.writeFileSync( CONFIG_DEST, JSON.stringify( config, null, 4 ) );
console.log( chalk.cyan( `Config file sucessfully written to "${path.resolve( CONFIG_DEST )}"` ) );
