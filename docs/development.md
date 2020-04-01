# Development

At its simplest level, the WordPress.com for Desktop app uses Electron to wrap up Calypso inside a native app.

Electron provides all the interfacing between Chrome (the browser that is used inside Electron), and the native platform. This means we can re-use Calypso code while still providing native platform features.

It is important to understand where code runs, and for this the terminology is:

- Main - this is the Electron wrapper. All code for this is contained in `desktop`
- Renderer - this is the Chrome browser and is where Calypso runs

We use Electron's [IPC](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) mechanism to send data between the main process and the renderer.

## Starting the app

### Dev mode

You will need two separate terminal sessions

**Terminal 1:**

In `wp-desktop` run the calypso and desktop development server with:

```bash
make dev-server
```

`make dev-server` is taking care of automatic re-compilation of your desktop and calypso scripts, styles and so on whenever you save/modify a file.

**Terminal 2:**

Starting the app

```bash
make dev
```

**🚨 Note:** 
In some cases you'll see an error in the apps console that is similar to this:
```console
[...]/spellchecker/build/Release/spellchecker.node' was compiled against a different Node.js version using NODE_MODULE_VERSION 48. This version of Node.js requires NODE_MODULE_VERSION 54. [...]
```
In this case, you need to rebuild the native dependencies by running:
```bash
make rebuild-deps
```
After successfully running the command, you can start the app with `make dev`.

#### Skipping the calypso server


`make dev` is starting the app with `NODE_ENV=development` and `DEBUG=desktop:*`.

`NODE_ENV=development` is required to skip the server initialization as described below and is instead using the calypso development version served via http://calypso.localhost:3000.

### How does it work?

So what happens when you run `make dev`? It's a fairly complicated process so buckle up. Note that *(main)* and *(renderer)* will be added to show where the code actually runs.

- *(main)* Electron looks at the `main` item in `package.json` - this is the boot file, and refers to `desktop/index.js`
- *(main)* `desktop/index.js` sets up the environment in `desktop/env.js` - this includes Node paths for Calypso
- *(main)* Various [app handlers](../desktop/app-handlers/README.md) are loaded from `desktop/app-handlers` - these are bits of code that run before the main window opens
- *(main)* A Calypso server is started in `desktop/start-app.js` in a forked child_process. The server is customized to serve files from the following directories:
  - `/` - mapped to the Calypso server
  - `/calypso` - mapped to `calypso/public`
  - `/desktop` - mapped to `public_desktop`
- *(main)* An Electron `BrowserWindow` is opened and loads the 'index' page from the Calypso server
- *(main)* Once the window has opened the [window handlers](../desktop/window-handlers/README.md) load to provide interaction between Calypso and Electron
- *(renderer)* Calypso provides the 'index' page from `calypso/server/pages/desktop.pug`, which is a standard Calypso start page plus:
  - `public_desktop/wordpress-desktop.css` - any CSS specific to the desktop app
  - `public_desktop/desktop-app.js` - desktop app specific JS and also the Calypso boot code
  - `calypso/public/build.js` - a prebuilt Calypso
- *(renderer)* The `desktop-app.js` code runs which sets up various app specific handlers that need to be inside the renderer. It also starts Calypso with `AppBoot()`
- *(renderer)* The code in `calypso/client/lib/desktop` runs to send and receive IPC messages between the main process and Calypso.

Phew!

## How do I change the main app?

All app code is contained in `desktop`. Any changes you make there require a restart of the app by running `make dev`.

- [Config](../desktop-config/README.md) - app configuration values
- [Libraries](../desktop/lib/README.md) - details of the local libraries used
- [App Handlers](.,/desktop/app-handlers/README.md) - handlers that run before the main window is created
- [Window Handlers](../desktop/window-handlers/README.md) - handlers that run after the main window is created

## How do I change Calypso?

All Calypso code is contained in the `calypso` directory as a submodule. If you need to change Calypso and want to try it inside the desktop app then you can:

- `cd calypso`
- Create a new branch or change to an existing branch in Calypso as you would normally

When you have started the app with `make dev` and have a running the dev server via `make dev-server` all your changes will be automatically re-compiled. You will be notified in Calypso when a reload is necessary.

To update the `calypso` directory to the upstream project's latest commit, run `git submodule update --remote`. If you want to commit that change, you need to `git add calypso` to do so.

## Tell me more about the server

We used to boot the Calypso server+app directly within the main Electron process by `require`-ing raw Calypso code. This eventually ran into issues because Automatticians were eager to use ES6, which node is not quite friendly with yet.

Thanks to [Babel](https://babeljs.io/)'s magic transpilation, we already have a node-friendly server bundle available to use. However, we can't just `require` the bundle and be done with it due to various issues such as path resolutions (the working directory inconveniently points to the desktop root, which breaks things).

Instead, during the app's startup process, we fork a child process to load up Calypso using the transpiled bundle. This gives Calypso its own "sandbox" and can run without the app/Electron environment unintentionally interfering with it.

## Debugging

The main process will output debug to the console when debug mode is enabled (found under the app menu). You can also customize the debug output when running the app:

```bash
make dev DEBUG=desktop:*
...
desktop:index Starting app handlers +0ms
desktop:index Waiting for app window to load +69ms
desktop:server Checking server port: 41050 on host 127.0.0.1 +63ms
desktop:server Server started +6ms
```

Debug from Calypso will appear inside the renderer. To enable, open Chrome dev tools from the View menu and enable debug:

```js
localStorage.setItem( 'debug', '*' );
```

## Building and Debugging on Windows

Building Calypso on Windows is not supported, and therefore a virtual Linux environment is required to build the application source. Application binaries, however, should be built natively on Windows prior to packaging the app.

- For convenience, a Docker configuration is included [here](../Dockerfile). The image can be built and ran via the Makefile.

- An alternative to using Docker on Windows is the Windows Subsystem for Linux ("WSL"), which will have to be manually configured.

### Recommended Windows Environment and Tooling

- [MSYS2](https://www.msys2.org/) is recommended to maximize compatibility of the Makefile across platforms. This can be installed explicitly and added to your `PATH`, or implicitly by installing [Git Bash](https://gitforwindows.org/) for Windows.

  - IMPORTANT: Historically, developers expect the "bash" executable to refer to Git/MSYS2 bash. To avoid collisions with Windows Subsystem for Linux ("WSL"), you can rename the WSL bash executable in PowerShell:

  ```
  takeown /F "$env:SystemRoot\System32\bash.exe"
  icacls "$env:SystemRoot\System32\bash.exe" /grant administrators:F
  ren "$env:SystemRoot\System32\bash.exe" wsl-bash.exe
  ```

- Install the npm package `windows-build-tools` to allow compilation of native node modules.
