var $ = require( 'nodobjc' );

$.framework( 'Foundation' );
$.framework( 'StoreKit' );

function log() {
	console.log.apply( null, [ 'StoreKit:' ].concat( [].slice.call( arguments ) ) );
}

function requestProducts() {
	var pool = $.NSAutoreleasePool( 'alloc' )( 'init' );

	var ProductsRequestDelegate = $.NSObject.extend( 'ProductsRequestDelegate' );

	ProductsRequestDelegate.addMethod( 'requestDidFinish:', 'v@:@', function( self, cmd, request ) {
		log( 'Executing:', cmd );
	} );

	ProductsRequestDelegate.addMethod( 'productsRequest:didReceiveResponse:', '@@:@@', function( self, cmd, request, response ) {
		log( 'Executing:', cmd );
		log( 'Products:', response( 'products' ) );
		log( 'Invalid product identifier:', response( 'invalidProductIdentifiers' ) );
	} );

	ProductsRequestDelegate.addMethod( 'request:didFailWithError:', '@@:@@', function( self, cmd, request, error ) {
		log( 'Executing:', cmd );
		log( 'Error:', error );
	} );

	ProductsRequestDelegate.register();

	var productsRequestDelegate = ProductsRequestDelegate( 'alloc' )( 'init' );

	var productIdentifiersArray = $.NSMutableArray( 'alloc' )( 'init' );
	productIdentifiersArray( 'addObject', $( 'com.wordpress.domain' ) );

	var productIdentifiersSet = $.NSSet( 'alloc' )( 'initWithArray', productIdentifiersArray );

	var productsRequest = $.SKProductsRequest( 'alloc' )( 'initWithProductIdentifiers', productIdentifiersSet );

	productsRequest( 'setDelegate', productsRequestDelegate );

	productsRequest( 'start' );

	log( 'Products request started!' );

	pool( 'release' );
}

module.exports = {
	requestProducts: requestProducts
};
