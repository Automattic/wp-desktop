/**
 * General Context Menu
 * Showed when not in a textarea or editor
 */

var Menu = require( 'electron' ).Menu;

var DEFAULT_MAIN_TPL = [{
	label: 'Copy',
	role: 'copy',
	enabled: true
},{
	label: 'Minimize',
	role: 'minimize'
}];

module.exports = function( selection ) {

	return Menu.buildFromTemplate( DEFAULT_MAIN_TPL );
};

