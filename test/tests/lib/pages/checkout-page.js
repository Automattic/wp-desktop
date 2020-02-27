/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class CheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout__container' ) );
	}

	async isShoppingCartPresent() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.payment-box__content' )
		);
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart-item' ) );
	}

	async emptyShoppingCart() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.gridicons-trash' ) );
		await driverHelper.waitTillNotPresent( this.driver, By.css( '.payment-box__content' ) );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '#plans' ) );
	}
}

module.exports = CheckoutPage;
