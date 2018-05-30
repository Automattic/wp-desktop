
const { ipcRenderer, remote } = require( 'electron' );
const { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = require( 'electron-spellchecker' );
const debugModule = require( 'debug' );

const desktop = remote.getGlobal( 'desktop' );
const debug = debugModule( 'desktop:preload' )

debug( 'Setting up preload script' );

// TODO: We can enable/disable the spellchecker without a restart by toggling spellcheck="false" in the DOM
// In this case, we intialize the spellchecker by default
if ( desktop.settings.getSetting( 'spellcheck-enabled' ) ) {
	debug( 'Initialzing spellchecker' );

	window.spellCheckHandler = new SpellCheckHandler();
	window.spellCheckHandler.attachToInput();

	window.spellCheckHandler.switchLanguage( window.navigator.language );

	// TODO: Extend ContextMenuBuilder class to get better control of features e.g. limiting spellcheck suggestions to 3
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
