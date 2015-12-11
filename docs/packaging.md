# Packaging a Release

Some builds require further packaging before they can be released:

* `make package-win32` - Produces a signed `Setup.exe` install wizard, requires valid code signing certificate
* `make package-osx` - Produces a `DMG` file
* `make package-mas` - Produces a `.pkg` file for submission to the App Store
* `make package-linux` - Produces a `.tar.gz` file
