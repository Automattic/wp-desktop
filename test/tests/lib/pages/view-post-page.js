/** @format */

const { By } = require( 'selenium-webdriver' );

const AsyncBaseContainer = require( '../async-base-container' );
const driverHelper = require( '../driver-helper' );

class ViewPostPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-post' ) );
	}

	async postTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async commentsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( '#respond' ) );
	}

	async sharingButtonsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'div.sd-sharing' ) );
	}

	async postContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}

	async categoryDisplayed() {
		return await this.driver
			.findElement( By.css( 'a[rel="category tag"], a[rel="category"]' ) )
			.getText();
	}

	async tagDisplayed() {
		return await this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	}

	async contactFormDisplayed() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.contact-form' ) );
	}

	async isPasswordProtected() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'form.post-password-form' ) );
	}

	async enterPassword( password ) {
		let element = await this.driver.findElement(
			By.css( 'form.post-password-form input[name=post_password]' )
		);
		await element.sendKeys( password );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'form.post-password-form input[name=Submit]' ),
			this.explicitWaitMS
		);
	}

	async imageDisplayed( fileDetails ) {
		return await this.driver
			.findElement( By.css( `img[alt='${ fileDetails.imageName }']` ) )
			.then( imageElement => {
				return driverHelper.imageVisible( this.driver, imageElement );
			} );
	}

	async leaveAComment( comment ) {
		const commentButtonSelector = By.css( '#comment-submit' );
		const commentSubmittingSelector = By.css( '#comment-form-submitting' );
		await driverHelper.setWhenSettable( this.driver, By.css( '#comment' ), comment );
		await driverHelper.clickWhenClickable( this.driver, commentButtonSelector );
		return await driverHelper.waitTillNotPresent( this.driver, commentSubmittingSelector );
	}

	async commentEventuallyShown( comment ) {
		const commentSelector = By.xpath( `//p[text() = "${ comment }"]` );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, commentSelector );
	}
}

module.exports = ViewPostPage;
