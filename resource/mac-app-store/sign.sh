#!/bin/bash

APP="$1"
APP_PATH="$2/$1.app"
VERSION=$4
RESULT_PATH="./release/$APP-$VERSION.pkg"
APP_KEY="3rd Party Mac Developer Application: $3"
INSTALLER_KEY="3rd Party Mac Developer Installer: $3"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

# Signing binaries from the inside out, starting with helper apps and ending with the main app bundle

# Sign the helper apps with the child entitlements
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/child.plist "$FRAMEWORKS_PATH/$APP Helper.app/"
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/child.plist "$FRAMEWORKS_PATH/$APP Helper EH.app/"
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/child.plist "$FRAMEWORKS_PATH/$APP Helper NP.app/"

# Sign internal binaries/frameworks with child entitlements
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/child.plist "$FRAMEWORKS_PATH/Electron Framework.framework/Libraries/libnode.dylib"
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/child.plist "$FRAMEWORKS_PATH/Electron Framework.framework/Electron Framework"

# Sign the main App bundle with parent entitlements
codesign -fs "$APP_KEY" --entitlements ./resource/mac-app-store/parent.plist "$APP_PATH"

# Create the package file for uploading to the app store
productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"
