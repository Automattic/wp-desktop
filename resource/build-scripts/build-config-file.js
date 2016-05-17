'use strict';
/**
 * External Dependencies
 */
var base = require( '../../desktop-config/config-base.json' );
var config = require( process.argv[2] );

Object.assign( base, config );

console.log( JSON.stringify( base, null, 4 ) );
