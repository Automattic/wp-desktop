'use strict';

var startApp = function() {
	document.location.replace( '/desktop/hey.html' );
};

var electron;
var ipc;
var gGebug;
var desktop;
var debug;
var booted = false;
var spellchecker;
var webFrame;

function startDesktopApp() {
	if ( desktop.settings.isDebug() ) {
		// Enable debug
		gGebug.enable( desktop.config.debug.namespace );

		// Link the debug function so it outputs to the console and sends it back to our main process for logging
		gGebug.log = function() {
			ipc.send( 'debug', arguments );
			console.log.apply( console, arguments );
		}
	}

	function showWarning( message ) {
		var container = document.querySelector( '#wpcom' );
		var warning = container.querySelector( '.warning' );

		if ( ! warning ) {
			var node = document.createElement( 'div' );

			node.className = 'warning';
			container.appendChild( node );

			warning = container.querySelector( '.warning' );
		}

		warning.innerHTML = message;
	}

	function showNoConnection() {
		showWarning( 'You have no connection to the Internet. WordPress.com will start once your connection has resumed.' );
	}

	function showNoCalypso() {
		showWarning( 'Unable to connect to WordPress.com. <button onclick="document.location.reload()">Try again?</button>' );
	}

	function postCalypso() {
		// Ensure the dock notification badge is cleared immediatley when notification icon is clicked
		// The iframe postMessage can be delayed
		var notIcon = document.querySelector( '#header li.notifications a' );

		if ( notIcon ) {
			notIcon.addEventListener( 'click', function() {
				ipc.send( 'unread-notices-count', 0 );
			} );
		}
	}

	function calysoHasLoaded() {
		return document.getElementById( 'content' );
	}

	function checkForCalypso() {
		setTimeout( function() {
			if ( ! calysoHasLoaded() ) {
				showNoCalypso();
				checkForCalypso();
			} else {
				postCalypso();
			}
		}, 5000 );
	}

	function keyboardHandler( ev ) {
		if ( ev.keyCode === 8 && document.location.pathname.indexOf( '/read' ) === 0 && ev.target.tagName !== 'INPUT' && ev.target.tagName !== 'TEXTAREA' ) {
			window.history.back()
		} else if ( ev.keyCode === 73 && ev.shiftKey === true && ev.ctrlKey === true ) {
			ipc.send( 'toggle-dev-tools' );
		}
	}

	function preventNewWindow( ev ) {
		if ( ev.metaKey === true ) {
			ev.preventDefault();
		}
	}

	debug = gGebug( 'desktop:browser' );

	// Everything is ready, start Calypso
	debug( 'Received app configuration, starting in browser' );

	function startCalypso() {
		debug( 'Calypso loaded, starting' );
		booted = true;
		window.AppBoot();

		document.addEventListener( 'keydown', keyboardHandler );
		document.addEventListener( 'click', preventNewWindow );
	}

	// This is called by Calypso
	startApp = function() {
		window.addEventListener( 'online', function() {
			if ( booted === false ) {
				document.location.reload();
			}
		} );

		document.documentElement.classList.add( 'build-' + desktop.config.build );

		if ( navigator.onLine ) {
			startCalypso();

			if ( calysoHasLoaded() ) {
				postCalypso();
			} else {
				checkForCalypso();
			}
		} else {
			showNoConnection();
		}
	}
}

function setupSpellchecker( locale ) {
	try {
		spellchecker = electron.remote.require( 'spellchecker' );

		webFrame.setSpellCheckProvider( locale, false, {
			spellCheck: function( text ) {
				return ! spellchecker.isMisspelled( text );
			}
		} )
	} catch ( e ) {
		debug( 'Failed to initialize spellchecker', e );
	}
}

// Wrap this in an exception handler. If it fails then it means Electron is not present, and we are in a browser
// This will then cause the browser to redirect to hey.html
try {
	electron = require( 'electron' );
	ipc = electron.ipcRenderer;
	gGebug = electron.remote.require( 'debug' );
	desktop = electron.remote.getGlobal( 'desktop' );
	webFrame = electron.webFrame;
} catch ( e ) {
	debug( 'Failed to initialize calypso', e );
}

startDesktopApp();
setupSpellchecker( window.navigator.language );
