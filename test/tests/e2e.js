const LoginPage = require('./lib/pages/login-page');
const ReaderPage = require('./lib/pages/reader-page');
const webdriver = require( 'selenium-webdriver' );
const { By } = require( 'selenium-webdriver' );
const driverConfig = new webdriver.Builder()
	.usingServer( 'http://localhost:9515' )
	.withCapabilities( {
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: process.env.BINARY_PATH,
			args: [ '--disable-renderer-backgrounding', '--disable-http-cache' ]
		}
	} )
	.forBrowser( 'electron' );
const tempDriver = driverConfig.build();
let driver;

before( async function() {
	this.timeout( 20000 );
	await tempDriver.sleep( 10000 );
	await tempDriver.close();
	driver = await driverConfig.build();
} );

/*describe( 'User Can log in', function() {
	this.timeout( 30000 );
	step( 'Can log in', async function() {
		let loginPage = new LoginPage( driver );
		await loginPage.login( process.env.E2EUSERNAME, process.env.E2EPASSWORD );
	} );

	step( 'Can see Reader Page after logging in', async function() {
		return await ReaderPage.Expect( driver );
	} );
} );*/

describe( 'check app loads', function() {
	this.timeout( 30000 );
	it( 'show log in form', async function() {
		//driver.get( 'https://www.wordpress.com' );
		//await driver.sleep(30000);
		await driver.findElement( webdriver.By.name( 'login' ), 20000 ).sendKeys( 'e2eflowtesting3' );
		await driver.findElement( webdriver.By.name( 'password' ), 20000 ).sendKeys( 'wTSw9i2MA89LuPrYd3ZD' );
		return await driver.findElement( webdriver.By.css( 'button.is-primary' ), 20000 ).click();
	} );
	it( 'show wait', async function() {
		return driver.sleep( 3000 );
	} );
} );

after( async function() {
	this.timeout( 20000 );
	return await driver.close();
} );
