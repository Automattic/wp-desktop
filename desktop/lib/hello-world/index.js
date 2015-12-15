var $ = require( 'nodobjc' );

$.framework( 'Foundation' );

function helloWorld() {
	var pool = $.NSAutoreleasePool( 'alloc' )( 'init' );
	var string = $.NSString( 'stringWithUTF8String', 'Hello Objective-C World!' );

	console.log( string );

	pool( 'drain' );
}

module.exports = helloWorld;
