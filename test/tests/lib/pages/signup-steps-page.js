/** @format */

const { assert } = require( 'assert' );
const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class SignupStepsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup__steps' ) );
	}

	async aboutSite() {
		const siteNameForm = By.css( '#siteTitle' );
		const siteName = 'e2eflowtesting desktop app';

		const siteTopicForm = By.css( '#siteTopic' );
		const aboutSite = 'about e2eflowtesting desktop app';

		const shareCheckbox = By.css( '#share' );
		const comfortableScale = By.css( '.segmented-control__text' );
		const submitButton = By.css( '.about__submit-wrapper .is-primary' );

		await driverHelper.setWhenSettable( this.driver, siteNameForm, siteName );
		await driverHelper.setWhenSettable( this.driver, siteTopicForm, aboutSite );

		await driverHelper.clickWhenClickable( this.driver, shareCheckbox );
		await driverHelper.selectElementByText( this.driver, comfortableScale, '3' );
		// temp sleep
		await this.driver.sleep( 3000 );
		return await driverHelper.clickWhenClickable( this.driver, submitButton );
	}

	async selectTheme() {
		const themeSelector = By.css( '.theme' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-themes' ) );
		await driverHelper.clickWhenClickable( this.driver, themeSelector );
	}

	async selectDomain( domainName, expectedDomain ) {
		const searchDomainField = By.css( '.search__input' );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.register-domain-step__search' )
		);
		await driverHelper.setWhenSettable( this.driver, searchDomainField, domainName );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.domain-suggestion__content' )
		);
		// temp sleep
		await this.driver.sleep( 3000 );

		// const actualAddress = await this.freeBlogAddress( domainName );
		// TODO: compare domains
		// assert(
		// 	expectedDomain.indexOf( actualAddress ) > -1,
		// 	`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedDomain }'`
		// );
		return await this.selectFreeAddress();
	}

	// async freeBlogAddress( domainName ) {
	// 	const freeBlogAddressSelector = By.css( `[data-e2e-domain="${ domainName }.wordpress.com"]` );
	// 	return await this.driver.findElement( freeBlogAddressSelector ).getText();
	// }

	async selectFreeAddress() {
		// const freeAddressSelector = By.css(
		// 	'.domain-search-results__domain-suggestions > .domain-suggestion.is-clickable'
		// );
		// return await driverHelper.clickWhenClickable(
		// 	this.driver,
		// 	freeAddressSelector,
		// 	this.explicitWaitMS
		// );
		return await driverHelper.selectElementByText(
			this.driver,
			By.css( '.domain-product-price__price' ),
			'Free'
		);
	}

	async selectFreePlan() {
		const plansPage = By.css( '.is-plans' );
		const freePlanButton = By.css( '.is-free-plan' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, plansPage );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, freePlanButton );
		return await driverHelper.clickWhenClickable( this.driver, freePlanButton );
	}

	async enterAccountDetailsAndSubmit( email, username, password ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.signup-form' ) );

		await driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, {
			secureValue: true,
		} );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.signup-form__submit' )
		);

		return await this.driver.sleep( 5000 );
	}
}

module.exports = SignupStepsPage;
