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
	const fileName = `e2e-test-run-${ dateTime }.mpg`;
	file = path.resolve( path.join( './screenshots/videos', fileName ) );
	this.createDir( path.dirname( file ) );
	ffVideo = child_process.spawn( ffmpeg.path, [
		'-f',
		'avfoundation',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		'0:none',
		'-pixel_format',
		'yuv420p',
		'-loglevel',
		'error',
		file,
	] );
};

exports.stopVideo = function() {
	if ( ! this.isVideoEnabled() ) {
		return;
	}
	if ( ffVideo && ! ffVideo.killed ) {
		ffVideo.kill();
	}
};
