/** @format */

const { By } = require( 'selenium-webdriver' );
const AsyncBaseContainer = require( '../async-base-container' );

class ReaderPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-reader' ) );
		console.log('reached');
	}
}

module.exports = ReaderPage;
