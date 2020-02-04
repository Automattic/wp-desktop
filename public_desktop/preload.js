const { ipcRenderer, remote } = require( 'electron' );
const { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = require( 'electron-spellchecker' );
const { Observable } = require( 'rxjs/Observable' );
require( 'rxjs/add/observable/from' ); // necessary for providing Observable.from() to Observable (see usage below)

const debugModule = require( 'debug' );

const desktop = remote.getGlobal( 'desktop' );
const debug = debugModule( 'desktop:preload' )

debug( 'Setting up preload script' );

if ( desktop.settings.getSetting( 'spellcheck-enabled' ) ) {
	debug( 'Initializing spellchecker' );

	window.spellCheckHandler = new SpellCheckHandler();

	// Ensure the iframe has been loaded before attaching the spellchecker
	// Ref: https://github.com/electron/electron/issues/21324
	window.addEventListener( 'editor-iframe-loaded', () => {
		debug( 'Editor iframe loaded, attaching spellchecker' );

		// The current implementation of the spellchecker (v2.2.1)
		// assumes that content in the document body is being actively
		// edited when attachToInput is called.
		//
		// https://github.com/electron-userland/electron-spellchecker/blob/7227d61415c47dfa247828da3b62bbb3330095aa/src/spell-check-handler.js#L206
		//
		// The Calypso editor doesn't satisfy this assumption when a post
		// (either existing or new) is loaded. As a workaround, we inject
		// a dummy observable to prevent the method from exiting before
		// the user begins to make edits.
		const dummy$ = Observable.from( [] );
		window.spellCheckHandler.attachToInput( dummy$ );
		window.spellCheckHandler.switchLanguage( window.navigator.language );
	} )

	let contextMenuBuilder = new ContextMenuBuilder( window.spellCheckHandler );
	let contextMenuListener = new ContextMenuListener( ( info ) => {
	// override config to prevent copy image and open link
		info.hasImageContents = false;
		info.linkURL = null;
		contextMenuBuilder.showPopupMenu( info );
	} );
} else {
	debug( 'Skipping spellchecker initialization' );
}

// WARNING WARNING WARNING
// This is exposed to the web renderer. Be careful about putting stuff in here as client JS will have access to it
// WARNING WARNING WARNING

// TODO: Either merge this with the `desktop` object or find a way to completely get rid of this
window.electron = {
	ipcRenderer,
	debug: debugModule,
	getCurrentWindow: remote.getCurrentWindow,
	getBuild: () => desktop.config.build,
	isDebug: () => desktop.settings.isDebug(),
	enableDebug: () => {
		debugModule.enable( desktop.config.debug.namespace );

		// Link the debug function so it outputs to the console and sends it back to our main process for logging
		debugModule.log = function() {
			ipcRenderer.send( 'debug', arguments );
			console.log.apply( console, arguments );
		}
	},
};
