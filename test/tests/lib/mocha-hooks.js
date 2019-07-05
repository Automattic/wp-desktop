const videoRecorder = require( './video-recorder' );

// Start xvfb display
before( async function() {
	await videoRecorder.startDisplay();
} );

// Start recording
before( async function() {
	await videoRecorder.startVideo();
} );

// Stop video recording if the test has failed
afterEach( async function() {
	if ( this.currentTest && this.currentTest.state === 'failed' ) {
		await videoRecorder.stopVideo( this.currentTest );
	}
} );

// Stop video
after( async function() {
	await videoRecorder.stopVideo();
} );

// Stop xvfb display
after( async function() {
	await videoRecorder.stopDisplay();
} );
