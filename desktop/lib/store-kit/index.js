var $ = require( 'nodobjc' );

$.framework( 'Foundation' );
$.framework( 'StoreKit' );

function log() {
	console.log.apply( null, [ 'StoreKit:' ].concat( [].slice.call( arguments ) ) );
}

function requestProducts( onReceiveResponse ) {
	var pool = $.NSAutoreleasePool( 'alloc' )( 'init' );

	var ProductsRequestDelegate = $.NSObject.extend( 'ProductsRequestDelegate' );

	ProductsRequestDelegate.addMethod( 'requestDidFinish:', 'v@:@', function( self, cmd, request ) {
		log( 'Executing:', cmd );
	} );

	ProductsRequestDelegate.addMethod( 'productsRequest:didReceiveResponse:', '@@:@@', function( self, cmd, request, response ) {
		var products = response( 'products' ),
			invalidProductIds = response( 'invalidProductIdentifiers' ),
			productsCount = products( 'count' ),
			firstProductTitle = 'none';

		log( 'Executing:', cmd );
		log( 'Products:', products );
		log( 'Invalid product identifier:', invalidProductIds );

		if ( productsCount ) {
			firstProductTitle = products( 'firstObject' )( 'localizedTitle' )( 'UTF8String' );
		}

		onReceiveResponse( firstProductTitle, productsCount, invalidProductIds( 'count' ) );
	} );

	ProductsRequestDelegate.addMethod( 'request:didFailWithError:', '@@:@@', function( self, cmd, request, error ) {
		log( 'Executing:', cmd );
		log( 'Error:', error );
	} );

	ProductsRequestDelegate.register();

	var productsRequestDelegate = ProductsRequestDelegate( 'alloc' )( 'init' );

	var productIdentifiersArray = $.NSMutableArray( 'alloc' )( 'init' );
	productIdentifiersArray( 'addObject', $( 'com.wordpress.domain_mapping.year' ) );

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
