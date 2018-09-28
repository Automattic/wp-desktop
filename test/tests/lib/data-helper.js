/** @format */

const phrase = require( 'asana-phrase' );

String.prototype.toProperCase = function() {
	return this.replace( /\w\S*/g, function( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
};

exports.randomPhrase = function() {
	let gen = phrase.default32BitFactory().randomPhrase();
	return `${ gen[ 1 ].toProperCase() } ${ gen[ 2 ].toProperCase() } ${ gen[ 3 ].toProperCase() } ${ gen[ 4 ].toProperCase() }`;
};

