/** @format */

//const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'is-section-auth' ) );
	}

	async login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.name( 'login' );
		const passwordSelector = By.name( 'password' );
		const submitSelector = By.css( 'button.is-primary' );

		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );

		await driverHelper.setWhenSettable( driver, passwordSelector, password, {
			secureValue: true,
		} );
		await driverHelper.clickWhenClickable( driver, submitSelector );
		return await driverHelper.waitTillNotPresent( driver, userNameSelector );
	}
}

module.exports = LoginPage;
