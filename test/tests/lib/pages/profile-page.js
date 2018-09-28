/** @format */

const webdriver = require( 'selenium-webdriver' );

const AsyncBaseContainer = require( '../async-base-container' );

const driverHelper = require( '../driver-helper.js' );

const by = webdriver.By;

class ProfilePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.me-profile-settings' ) );
	}

	async clickSignOut() {
		const signOutSelector = by.css( 'button.sidebar__me-signout-button' );
		await driverHelper.clickWhenClickable( this.driver, signOutSelector );
		await this.driver.sleep( 1000 );
	}
}

module.exports = ProfilePage;
