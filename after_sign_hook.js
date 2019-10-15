const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');

module.exports = async function(params) {
  // Only notarize the app on Mac OS only.
  if (params.electronPlatformName !== 'darwin') {
    return;
  }
  console.log('afterSign hook triggered', params);

  if (!process.env.CIRCLE_TAG || process.env.CIRCLE_TAG.length === 0) {
    console.log('Not on a tag. Skipping notarization');
    return;
  }

  // Same appId in electron-builder.
  let appId = 'com.automattic.wordpress';

  let dmgPath = params.artifactPaths[1];

	if (!fs.existsSync(dmgPath)) {
    throw new Error(`Cannot find application at: ${dmgPath}`);
  }

	console.log(`Notarizing ${appId} found at ${dmgPath}`);

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: dmgPath,
      appleId: process.env.NOTARIZATION_ID,
      appleIdPassword: process.env.NOTARIZATION_PWD,
      ascProvider: 'AutomatticInc',
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${dmgPath}`);
};
