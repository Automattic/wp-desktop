var $ = require( 'nodobjc' );

$.framework( 'Foundation' );
$.framework( 'StoreKit' );

function helloWorld() {
	$.NSAutoreleasePool( 'alloc' )( 'init' );

	var ProductsRequestDelegate = $.NSObject.extend( 'ProductsRequestDelegate' );
	ProductsRequestDelegate.register();

	var productsRequestDelegate = ProductsRequestDelegate( 'alloc' )( 'init' );

	console.log( productsRequestDelegate.methods() );

	var productRequest = $.SKProductsRequest( 'alloc' )( 'init' );

	console.log( productRequest.methods() );
}

module.exports = helloWorld;
