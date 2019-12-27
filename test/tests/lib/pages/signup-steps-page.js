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
		return await driverHelper.clickWhenClickable( this.driver, submitButton );
	}

	async selectTheme() {
		const themeSelector = By.css( '.theme' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-themes' ) );
		await driverHelper.clickWhenClickable( this.driver, themeSelector )
	}

	async selectDomain( domainName, expectedDomain ) {
		const searchDomainField = By.css( '.search__input' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-domains' ) );
		await driverHelper.setWhenSettable( this.driver, searchDomainField, domainName );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.domain-suggestion' ) );

		const actualAddress = await this.freeBlogAddress();
		assert(
			expectedDomain.indexOf( actualAddress ) > -1,
			`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedDomain }'`
		);
		return await this.selectFreeAddress();
	}

	async freeBlogAddress() {
		const freeBlogAddressSelector = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion .domain-registration-suggestion__title'
		);
		return await this.driver.findElement( freeBlogAddressSelector ).getText();
	}

	async selectFreeAddress() {
		const freeAddressSelector = By.css(
			'.domain-search-results__domain-suggestions > .domain-suggestion.is-clickable'
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			freeAddressSelector,
			this.explicitWaitMS
		);
	}
}

module.exports = SignupStepsPage;
