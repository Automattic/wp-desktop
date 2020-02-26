/** @format */

const webdriver = require( 'selenium-webdriver' );
const driverHelper = require( '../driver-helper.js' );

const AsyncBaseContainer = require( '../async-base-container' );
const by = webdriver.By;

class NavBarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.masterbar' ) );
	}
	async clickCreateNewPost() {
		const postButtonSelector = by.css( 'a.masterbar__item-new' );
		await driverHelper.clickWhenClickable( this.driver, postButtonSelector, this.explicitWaitMS );
	}
	async clickProfileLink() {
		const profileSelector = by.css( 'a.masterbar__item-me' );
		return await driverHelper.clickWhenClickable(
			this.driver,
			profileSelector,
			this.explicitWaitMS
		);
	}

	async openSidebar() {
		await this.driver.sleep( 2000 );
		if (
			await driverHelper.isEventuallyPresentAndDisplayed( this.driver, by.css( '.gridicons-menu' ) )
		) {
			await this.driver.sleep( 2000 );
			await driverHelper.clickWhenClickable( this.driver, by.css( '.gridicons-menu' ) );
			return await this.driver.sleep( 2000 );
		}
	}
}

module.exports = NavBarComponent;
