/** @format */

/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' );
const child_process = require( 'child_process' );
const ffmpeg = require( 'ffmpeg-static' );

let file;
let ffVideo;

exports.createDir = function( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return this.createDir( path.dirname( dir ) ) && this.createDir( dir );
		}
		throw error;
	}
};

exports.isVideoEnabled = function() {
	const video = process.env.CI;
	return video === 'true';
};

exports.startVideo = function() {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	const dateTime = new Date()
		.toISOString()
		.split( '.' )[ 0 ]
		.replace( /:/g, '-' );
	const fileName = `${ global.displayNum }-${ dateTime }.mpg`;
	file = path.resolve( path.join( './screenshots/videos', fileName ) );
	this.createDir( path.dirname( file ) );
	ffVideo = child_process.spawn( ffmpeg.path, [
		'-f',
		'x11grab',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		':' + global.displayNum,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'error',
		file,
	] );
};

exports.stopVideo = function( currentTest = null ) {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	if ( currentTest && ffVideo ) {
		const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
		const dateTime = new Date()
			.toISOString()
			.split( '.' )[ 0 ]
			.replace( /:/g, '-' );
		const fileName = `${ currentTestName }-${ dateTime }.mpg`;
		const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );
		ffVideo.kill();

		fs.rename( file, newFile, function( err ) {
			if ( err ) {
				console.log( 'Screencast Video:' + file );
			}
			console.log( 'Screencast Video:' + newFile );
		} );
	} else if ( ffVideo && ! ffVideo.killed ) {
		ffVideo.kill();
		fs.unlink( file, function( err ) {
			if ( err ) {
				console.log( 'Deleting of file for passed test failed.' );
			}
		} );
	}
};
