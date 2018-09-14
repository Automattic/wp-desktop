const LoginPage = require('./lib/pages/login-page');
const ReaderPage = require('./lib/pages/reader-page');
const webdriver = require( 'selenium-webdriver' );
const driverConfig = new webdriver.Builder()
	.usingServer( 'http://localhost:9515' )
	.withCapabilities( {
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: process.env.BINARY_PATH,
			args: [ '--disable-http-cache' ]
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

describe( 'User Can log in', function() {
	this.timeout( 30000 );
	it( 'Can log in', async function() {
		let loginPage = new LoginPage( driver );
		return await loginPage.login( process.env.E2EUSERNAME, process.env.E2EPASSWORD );
	} );

	it( 'Can see Reader Page after logging in', async function() {
		return await ReaderPage.Expect( driver );
	} );
} );

after( async function() {
	this.timeout( 20000 );
	return await driver.close();
} );
