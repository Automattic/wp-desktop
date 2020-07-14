#!/usr/bin/env node

//
// Checks whether the version value in the package.json is the same as the
// given input.
//

if (process.argv.length === 2) {
	console.error(`Usage: ${process.argv[1]} 1.2.3-beta4`);
	console.error('\nExpected version parameter to check.');
	process.exit(1);
}

const version = process.argv[2];
// Remove the leading v that a tag from version control may have.
// This regex means "a letter v at the start of the string"
const sanitizedVersion = version.replace(/^v/, '');

console.log(`Validating package.json version matches ${version}...`);

const fs = require('fs');
const package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const packageVersion = package['version'];

if (package['version'] !== sanitizedVersion) {
	console.error(`Expected version in package.json to match ${version}, got ${packageVersion}`);
	process.exit(1);
}

console.log(`Version in package.json matches expected value ${version}. 👍`);
