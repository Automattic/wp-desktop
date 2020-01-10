const assert = require( 'chai' ).assert;
const webdriver = require( 'selenium-webdriver' );
const chrome = require( 'selenium-webdriver/chrome' );
const EditorPage = require( './lib/pages/editor-page' );
const LoginPage = require( './lib/pages/login-page' );
const SignupStepsPage = require( './lib/pages/signup-steps-page' );
const PostEditorToolbarComponent = require( './lib/components/post-editor-toolbar-component' );
const NavBarComponent = require( './lib/components/nav-bar-component' );
const ProfilePage = require( './lib/pages/profile-page' );
const ReaderPage = require( './lib/pages/reader-page' );
const ViewPostPage = require( './lib/pages/view-post-page' );

const dataHelper = require( './lib/data-helper' );
let options = new chrome.Options();
options.addArguments(
	'user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Electron/1.7.15 Safari/537.36'
);
const driverConfig = new webdriver.Builder()
	.usingServer( 'http://localhost:9515' )
	.setChromeOptions( options )
	.withCapabilities( {
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: process.env.BINARY_PATH,
			args: [ '--disable-renderer-backgrounding', '--disable-http-cache', '--start-maximized' ],
		},
	} )
	.forBrowser( 'electron' );

const tempDriver = driverConfig.build();
let loggedInUrl;
let driver;

before( async function() {
	this.timeout( 30000 );
	await tempDriver.quit();
	driver = await driverConfig.build();
	return await driver.sleep( 2000 );
} );

describe( 'User Can log in', function() {
	this.timeout( 30000 );

	step( 'Delete all cookies', async function() {
		await driver.manage().deleteAllCookies();
		return await driver.sleep( 1000 );
	} );

	step( 'Can log in', async function() {
		let loginPage = await LoginPage.Expect( driver );
		return await loginPage.login( process.env.E2EUSERNAME, process.env.E2EPASSWORD );
	} );

	step( 'Can see Reader Page after logging in', async function() {
		await ReaderPage.Expect( driver );
		return loggedInUrl = await driver.getCurrentUrl();
	} );
} );

describe( 'Publish a New Post', function() {
	this.timeout( 30000 );
	const blogPostTitle = dataHelper.randomPhrase();
	const blogPostQuote =
		'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

	step( 'Can navigate to post editor', async function() {
		const navbarComponent = await NavBarComponent.Expect( driver );
		return await navbarComponent.clickCreateNewPost();
	} );

	step( 'Can enter post title and content', async function() {
		const editorPage = await EditorPage.Expect( driver );
		await editorPage.enterTitle( blogPostTitle );
		await editorPage.enterContent( blogPostQuote + '\n' );

		let errorShown = await editorPage.errorDisplayed();
		return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
	} );

	step( 'Can publish and view content', async function() {
		const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
		await postEditorToolbarComponent.ensureSaved();
		return await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
	} );

	step( 'Can see correct post title', async function() {
		const viewPostPage = await ViewPostPage.Expect( driver );
		let postTitle = await viewPostPage.postTitle();
		return assert.strictEqual(
			postTitle.toLowerCase(),
			blogPostTitle.toLowerCase(),
			'The published blog post title is not correct'
		);
	} );

	step( 'Can return to reader', async function() {
		return await driver.get( loggedInUrl );
	} );
} );

describe( 'Can Log Out', function() {
	this.timeout( 30000 );

	step( 'Can view profile to log out', async function() {
		let navbarComponent = await NavBarComponent.Expect( driver );
		return await navbarComponent.clickProfileLink();
	} );

	step( 'Can logout from profile page', async function() {
		const profilePage = await ProfilePage.Expect( driver );
		return await profilePage.clickSignOut();
	} );

	step( 'Can see app login page after logging out', async function() {
		return await LoginPage.Expect( driver );
	} );
} );

describe( 'Can Sign up', function() {
	this.timeout( 30000 );
	const blogName = dataHelper.getNewBlogName();
	const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );

	step( 'Can navigate to Create account', async function() {
		//remove banner if present
		//go to create account
		let loginPage = await LoginPage.Expect( driver );
		await loginPage.hideGdprBanner();
		await loginPage.openCreateAccountPage();
		return await SignupStepsPage.Expect( driver );
	} );

	step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
		//submit site topic details
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.aboutSite();
	} );

	step( 'Choose a theme page', async function() {
		//select theme
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectTheme();
	} );

	step( 'Can search for a blog name, can see and select a free .wordpress address', async function() {
		//enter address
		//select free domain
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectDomain( blogName, expectedBlogAddresses );

	} );

	step( 'Can see the plans page and pick the free plan', async function() {
		//select free plan
	} );

	step( 'Can see the account page and enter account details', async function() {
		//enter account details and submit
	} );

	step( 'Can then see the sign up processing page which will finish automatically move along', async function() {
		//continueAlong
	} );

	step( 'Can then see the onboarding checklist', async function() {
		//Can then see the onboarding checklist
	} );

	// step( 'Can delete our newly created account', async function() {
	// 	//MISSING FROM DESKTOP APP?
	// 	//delete account
	// } );
} );

after( async function() {
	this.timeout( 30000 );
	return await driver.quit();
} );
