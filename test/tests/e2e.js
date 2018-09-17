const LoginPage = require( './lib/pages/login-page' );
const ReaderPage = require( './lib/pages/reader-page' );
const Application = require( 'spectron' ).Application;
const path = require( 'path' );
let appPath =  path.join( __dirname, '..', '..' ) + process.env.BINARY_PATH;
let driver;
const app = new Application( {
	path: appPath,
	chromeDriverArgs: [ '--disable-http-cache', '--disable-renderer-backgrounding' ]
} );

before( async function() {
	this.timeout( 30000 );

	await app.start();
	await app.client.pause(3000);
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
		await app.client
			.setValue('input[name="login"]', 'e2eflowtesting3')
			.setValue('input[name="password"]', 'wTSw9i2MA89LuPrYd3ZD')
			.click( 'button.is-primary' );

		// await driver.findElement( webdriver.By.name( 'login' ), 20000 ).sendKeys( 'e2eflowtesting3' );
		// await driver.findElement( webdriver.By.name( 'password' ), 20000 ).sendKeys( 'wTSw9i2MA89LuPrYd3ZD' );
		// return await driver.findElement( webdriver.By.css( 'button.is-primary' ), 20000 ).click();
	} );
	it( 'show wait', async function() {
		return await app.client.pause( 3000 );
	} );
} );

after( function() {
	this.timeout( 30000 );
	if ( app && app.isRunning() ) {
		return app.stop()
	}
} );
