const fs = require('fs-extra');

module.exports
{
	function writeImage( data, dst ) {
		fs.ensureFileSync( dst );
		return fs.writeFileSync( dst, data, 'base64' );
	}
}
