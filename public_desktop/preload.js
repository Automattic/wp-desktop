const { ipcRenderer, remote } = require( 'electron' );
const { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = require( 'electron-spellchecker' );
const { Observable } = require( 'rxjs/Observable' );
require( 'rxjs/add/observable/from' ); // necessary for providing Observable.from() to Observable (see usage below)

// FIXME: The `remote` module is being deprecated and will be excluded
// from Electron v9.x.

// It is possible to use the `remote` module to directly require the
// main process logging module. However, this is a security concern and is
// discouraged. Instead, we post log messages to the main process via ipc.
const send = ( level, namespace, options, message, meta ) => {
	ipcRenderer.send( 'log', level, namespace, options, message, meta );
}

const logger = ( namespace, options ) => {
	return {
		error: ( message, meta ) => send( 'error', namespace, options, message, meta ),
		warn: ( message, meta ) => send( 'warn', namespace, options, message, meta ),
		info: ( message, meta ) => send( 'info', namespace, options, message, meta ),
		debug: ( message, meta ) => send( 'debug', namespace, options, message, meta ),
		silly: ( message, meta ) => send( 'silly', namespace, options, message, meta )
	}
}
window.logger = logger; // expose logger interface to other renderer processes

const log = logger( 'desktop:preload' );
const desktop = remote.getGlobal( 'desktop' );

log.debug( 'Setting up preload script' );

if ( desktop.settings.getSetting( 'spellcheck-enabled' ) ) {
	log.debug( 'Initializing spellchecker' );

	window.spellCheckHandler = new SpellCheckHandler();

	// Ensure the iframe has been loaded before attaching the spellchecker
	// Ref: https://github.com/electron/electron/issues/21324
	window.addEventListener( 'editor-iframe-loaded', () => {
		log.debug( 'Editor iframe loaded, attaching spellchecker' );

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
	log.debug( 'Skipping spellchecker initialization' );
}

// WARNING WARNING WARNING
// This is exposed to the web renderer. Be careful about putting stuff in here as client JS will have access to it
// WARNING WARNING WARNING

// TODO: Either merge this with the `desktop` object or find a way to completely get rid of this
window.electron = {
	ipcRenderer,
	getCurrentWindow: remote.getCurrentWindow,
	getBuild: () => desktop.config.build,
	isDebug: () => desktop.settings.isDebug(),
};
