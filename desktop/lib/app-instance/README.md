App Instance
=========

Provides a small wrapper around Electron's `app.makeSingleInstance`.
// TODO: -- this API has been removed from Electron.
// Ref: https://electronjs.org/blog/electron-4-0#single-instance-locking

When a duplicate app instance is detected it will:
- Quit the second app
- Bring the original app to the foreground

Note: this does not run on the Mac App Store build as sandboxing crashes the function.
