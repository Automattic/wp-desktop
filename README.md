# WordPress.com for Desktop

WordPress.com for Desktop is an [Electron](https://github.com/atom/electron) wrapper for [Calypso](https://github.com/Automattic/wp-calypso), the new WordPress.com front-end. It works on Mac, Windows, and Linux.

![WordPress.com for Desktop](https://en-blog.files.wordpress.com/2015/12/01-writing-with-dock.png?w=1150)

# Getting Started & Running Locally

1. Clone this repository locally
1. Update the Calypso submodule with:

- `git submodule init`
- `git submodule update`

1. Inside `./calypso`, run `yarn` to install all required packages
1. Inside `./calypso`, create a `./config/secrets.json` file and fill it with [secrets](docs/secrets.md)
1. In the project root, `yarn` will download all the required packages
1. In the project root, `make build` to create the builds
1. Find the built apps in the `release` folder in the project root

Need more detailed instructions? [We have them.](docs/install.md)

# Development

The app is split between Electron code and Calypso code, and so the [development guide](docs/development.md) may help you find where to change stuff.

# Running The End-To-End Test Suite

1. Set the environment variables `E2EUSERNAME` and `E2EPASSWORD`.
2. Use `npm run e2e` or `make e2e` to invoke the test suite.

To manually start each platform's _pre-packaged_ executable used for end-to-end testing:

- Mac: Double-click `WordPress.com.app`
- Windows: Double-click WordPress.com.exe in `win-unpacked` directory
- Linux: `npx electron /path/to/linux-unpacked/resources/app`

# MacOS Notarization

Per the current [Electron docs](https://www.electron.build/configuration/dmg), DMG signing is disabled by default as it will "lead to unwanted errors in combination with notarization requirements." Only the app bundle is zipped and submitted to Apple for notarization.

## Extracting Published ZIP Archive in MacOS 10.15 (Catalina)

There is a [known bug](https://github.com/electron-userland/electron-builder/issues/4299#issuecomment-544683923) in which extracting notarized contents from a zip archive via double-click will lead to an invalid .app bundle that cannot be opened in macOS 10.15. Instead, the bundled app should be extracted via `ditto`:

`ditto -x -k <zip archive> <destination folder>`

## Verification

Notarization status of an application bundle can be verified via the `codesign`, `stapler` and `spctl` utilities:

`codesign --test-requirement="=notarized" --verify --verbose WordPress.com.app`

`xrun stapler validate WordPress.com.app`

`spctl -a -v WordPress.com.app`

# Building & Packaging a Release

While running the app locally in a development environment is great, you will eventually need to [build a release version](docs/release.md) you can share.

# Contributing

If this sparks your interest don't hesitate to send a pull request, send a suggestion, file a bug, or just ask a question. Don't forget
to check out our [CONTRIBUTING](CONTRIBUTING.md) doc.

Do be aware that this repository is just for the WordPress.com desktop wrapper. If you have something to contribute for Calypso (the app that runs inside of the desktop wrapper and on WordPress.com) then please add it in the [Calypso](https://github.com/Automattic/wp-calypso) repository.

# Troubleshooting

If you have any problems running the app please see the [most common issues](docs/troubleshooting.md).

# License

WordPress.com for Desktop is licensed under [GNU General Public License v2 (or later)](LICENSE.md).
