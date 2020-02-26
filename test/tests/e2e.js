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
const ChecklistPage = require( './lib/pages/checklist-page' );

const dataHelper = require( './lib/data-helper' );
let options = new chrome.Options();
options.addArguments(
	'user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.128 Electron/4.2.9 Safari/537.36'
);
const driverConfig = new webdriver.Builder()
	.usingServer( 'http://localhost:9515' )
	.setChromeOptions( options )
	.withCapabilities( {
		chromeOptions: {
			// Here is the path to your Electron binary.
			binary: process.env.BINARY_PATH,
			args: [ '--disable-renderer-backgrounding', '--disable-http-cache', '--start-maximized' ],
			debuggerAddress: '127.0.0.1:9222',
		},
	} )
	.forBrowser( 'electron' );

let loggedInUrl;
let driver;

before( async function() {
	this.timeout( 30000 );
	driver = await driverConfig.build();
	return await driver.sleep( 2000 );
} );

describe( 'User Can log in', function() {
	this.timeout( 30000 );

	step( 'Clear local storage', async function() {
		await driver.executeScript( 'window.localStorage.clear();' );
		return await driver.sleep( 3000 );
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

describe.skip( 'Publish a New Post', function() {
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

describe.skip( 'Can Sign up', function() {
	this.timeout( 30000 );
	const blogName = dataHelper.getNewBlogName();
	const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
	const emailAddress = blogName + process.env.E2E_MAILOSAUR_INBOX;

	step( 'Clear local storage', async function() {
		await driver.executeScript( 'window.localStorage.clear();' );
		return await driver.sleep( 3000 );
	} );

	step( 'Can navigate to Create account', async function() {
		let loginPage = await LoginPage.Expect( driver );
		await loginPage.hideGdprBanner();
		await loginPage.openCreateAccountPage();
		return await SignupStepsPage.Expect( driver );
	} );

	step( 'Can see the "Site Topic" page, and enter the site topic', async function() {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.aboutSite();
	} );

	step( 'Choose a theme page', async function() {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectTheme();
	} );

	step(
		'Can search for a blog name, can see and select a free .wordpress address',
		async function() {
			const signupStepsPage = await SignupStepsPage.Expect( driver );
			return await signupStepsPage.selectDomain( blogName );
		}
	);

	step( 'Can see the plans page and pick the free plan', async function() {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.selectFreePlan();
	} );

	step( 'Can see the account page, enter account details and submit', async function() {
		const signupStepsPage = await SignupStepsPage.Expect( driver );
		return await signupStepsPage.enterAccountDetailsAndSubmit(
			emailAddress,
			blogName,
			process.env.E2EPASSWORD
		);
	} );

	step( 'Can then see the onboarding checklist', async function() {
		const checklistPage = await ChecklistPage.Expect( driver );
		return await checklistPage.isChecklistPresent();
	} );
} );

after( async function() {
	this.timeout( 30000 );
	return await driver.quit();
} );
