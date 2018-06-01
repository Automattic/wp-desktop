const { expect } = require('chai');
const path = require('path')
const { Application } = require('spectron');
const { exec } = require('child_process');

const testProductionBinary = process.env.TEST_PRODUCTION_BINARY === 'true';
const appPath = path.join(__dirname, '..');
const electronModuleDistPath = 'node_modules/electron/dist';
let electronPath;

if (process.platform === 'darwin') {
	if (!testProductionBinary) {
		electronPath = `${electronModuleDistPath}/Electron.app/Contents/MacOS/Electron`;
	} else {
		electronPath = 'release/mac/Wordpress.com.app/Contents/MacOS/Wordpress.com'
	}
} else if (process.platform === 'linux') {
	electronPath = `${electronModuleDistPath}/electron`;
	// TODO: add support for release binary
} else {
	throw ('Non-macOS/Linux tests not yet implemented');
}

describe('Application launch', function () {
	this.timeout(15000);

	beforeEach(function () {
		this.app = new Application({
			path: electronPath, // TODO: enable multi platform tests
			args: [appPath],
		})
		return this.app.start();
	});

	afterEach(async function (done) {
		if (this.app && this.app.isRunning()) {
			this.app.stop().then(() => {
				exec(`pkill -f "${appPath}"`); // workaround for app not quitting properly
				done();
			});
		}
	});

	it('should have calypso in DOM', async function () {
		this.timeout(20000);

		const wpcom = await this.app.client.element('#wpcom');

		expect(wpcom.value).to.be.not.null;
	});
});
