const helper = require('./helper.js');
const webdriver = require('selenium-webdriver');
const path = require( 'path' );
const driver = new webdriver.Builder()
// The "9515" is the port opened by chrome driver.
	.usingServer('http://localhost:9515')
	.withCapabilities({
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: './release/mac/WordPress.com.app/Contents/MacOS/WordPress.com',
			args: [ '--disable-http-cache' ]
		}
	})
	.forBrowser('electron')
	.build();

describe( 'check app loads', function() {
	this.timeout( 30000 );
	it( 'show log in form', async function() {
		//driver.get( 'https://www.wordpress.com' );
		//await driver.sleep(30000);
		await driver.takeScreenshot().then( data => {
			const dst = path.resolve( 'screenshots', 'myscreenshot.png' );
			return helper.writeImage( data, dst );
			} );
		await driver.findElement( webdriver.By.name( 'login' ), 20000 ).sendKeys( 'e2eflowtesting3' );
		await driver.findElement( webdriver.By.name( 'password' ), 20000 ).sendKeys( 'wTSw9i2MA89LuPrYd3ZD' );
		return await driver.findElement( webdriver.By.css( 'button.is-primary' ), 20000 ).click();
	} );
	it( 'show wait', async function() {
		return driver.sleep(3000);
	} );
	after( async function() {
		await driver.executeScript( 'window.localStorage.clear();' );
		return await driver.close();
	} );
} );

