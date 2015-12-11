'use strict';
/**
 * External Dependencies
 */
var assign = require( 'lodash/object/assign' );
var base = require( '../../desktop-config/config-base.json' );
var config = require( process.argv[2] );

assign( base, config );

console.log( JSON.stringify( base, null, 4 ) );
