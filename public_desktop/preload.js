const {
	ipcRenderer,
	remote,
	webFrame,
} = require( 'electron' );
const desktop = remote.getGlobal( 'desktop' );
const debug = remote.require( 'debug' );

let selection;

debug( 'Setting up preload script' );

// hard code wrongly interpreted words in spellchecker
// electron has a bug with parsing of contractions
// Ref: https://github.com/atom/electron/issues/1005
const wordsToSpellSkip = {
	'en-us': ['ain', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'mightn', 'mustn', 'needn', 'oughtn', 'shan', 'shouldn', 'wasn', 'weren', 'wouldn']
};

function shouldNotSpellCheckWord( locale, text ) {
	return wordsToSpellSkip[ locale.toLowerCase() ].indexOf( text ) > 0;
}

function setupSpellchecker( locale ) {
	if ( ! desktop.settings.getSetting( 'spellcheck-enabled' ) ) {
		debug( 'Spellchecker not enabled; skipping setup' );
		return;
	}

	if ( locale.toLowerCase() !== 'en-us' ) {
		debug( 'Disabling spellcheck, temporary only en-us support' );
		return;
	}

	if ( process.platform === 'win32' ) {
		debug( 'Disabling spellcheck, Windows support not working' );
		return;
	}

	try {
		const spellchecker = remote.require( 'spellchecker' );

		webFrame.setSpellCheckProvider( locale, false, {
			spellCheck: function( text ) {
				if ( shouldNotSpellCheckWord( locale, text ) ) {
					return true;
				}

				if ( spellchecker.isMisspelled( text ) ) {
					const suggestions = spellchecker.getCorrectionsForMisspelling( text );

					selection.isMisspelled = true;
					selection.spellingSuggestions = suggestions.slice( 0, 3 );

					return false;
				}

				return true;
			} } );
	} catch ( e ) {
		debug( 'Failed to initialize spellchecker', e.message );
	}
}

setupSpellchecker( window.navigator.language );

// WARNING WARNING WARNING
// This is exposed to the web renderer. Be careful about putting stuff in here as client JS will have access to it
// WARNING WARNING WARNING

window.electron = {
	ipcRenderer,
	debug,
	getCurrentWindow: remote.getCurrentWindow,
	getBuild: () => desktop.config.build,
	isDebug: () => desktop.settings.isDebug(),
	enableDebug: () => {
		debug.enable( desktop.config.debug.namespace );

		// Link the debug function so it outputs to the console and sends it back to our main process for logging
		debug.log = function() {
			ipcRenderer.send( 'debug', arguments );
			console.log.apply( console, arguments );
		}
	},
	showEditorMenu: () => desktop.contextMenus.editor( selection ),
	showGeneralMenu: selectedText => desktop.contextMenus.general( selectedText ),
	resetSelection: () => {
		selection = {
			isMisspelled: false,
			spellingSuggestions: []
		};
	},
};
