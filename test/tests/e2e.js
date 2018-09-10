const webdriver = require('selenium-webdriver');
const driverConfig = new webdriver.Builder()
	.usingServer('http://localhost:9515')
	.withCapabilities({
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: './release/linux-unpacked/wpcom',
			args: [ '--disable-http-cache' ]
		}
	})
	.forBrowser('electron');
const tempDriver = driverConfig.build();
let driver;

before( function() {
	tempDriver.sleep( 10000 );
	tempDriver.close();
	driver = driverConfig.build();
} );

describe( 'check app loads', function() {
	this.timeout( 30000 );
	it( 'Log in as user', async function() {

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

