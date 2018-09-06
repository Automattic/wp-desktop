import fs from 'fs-extra';

export function writeImage( data, dst ) {
	fs.ensureFileSync( dst );
	return fs.writeFileSync( dst, data, 'base64' );
}
