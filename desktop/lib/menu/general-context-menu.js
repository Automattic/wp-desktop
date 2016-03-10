/**
 * General Context Menu
 * Showed when not in a textarea or editor
 */

var Menu = require( 'electron' ).Menu;
var cloneDeep = require('lodash.cloneDeep');
var BrowserWindow = require('browser-window');

// selectable attribute determines if menu item
// should only be enabled when text is selected
var DEFAULT_MAIN_TPL = [{
	label: 'Copy',
	role: 'copy',
	selectable: true,
	enabled: true
},{
	label: 'Define',
	click: defineTerm,
	selectable: true,
	enabled: true
},{
	type: 'separator'
},{
	label: 'Minimize',
	role: 'minimize'
}];

function defineTerm() {
	var win = BrowserWindow.getFocusedWindow();
	win.showDefinitionForSelection();
}

module.exports = function( selectedText ) {
	var template = cloneDeep(DEFAULT_MAIN_TPL);

	template.map( function( item ) {
		if ( ! selectedText ) {			// if no text is selected
			if ( item.selectable ) {	// and item is selectable
				item.enabled = false;	// disable menu item
			}
		}
	});

	return Menu.buildFromTemplate( template );
};

