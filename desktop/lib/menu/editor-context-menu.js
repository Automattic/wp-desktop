
/**
 * Original library:
 * Author: Jeff Wear, Mixmax, Inc
 * License: MIT
 * From: https://github.com/mixmaxhq/electron-editor-context-menu
 */

var noop = function(){};
var cloneDeep = require('lodash.clonedeep');
var BrowserWindow = require('electron').BrowserWindow;
var Menu = require('electron').Menu;


var DEFAULT_MAIN_TPL = [{
  label: 'Undo',
  role: 'undo'
}, {
  label: 'Redo',
  role: 'redo'
}, {
  type: 'separator'
}, {
  label: 'Cut',
  role: 'cut'
}, {
  label: 'Copy',
  role: 'copy'
}, {
  label: 'Paste',
  role: 'paste'
}, {
  label: 'Select All',
  role: 'selectall'
}];

var DEFAULT_SUGGESTIONS_TPL = [
  {
    label: 'No suggestions',
    click: noop
  }, {
    type: 'separator'
  }
];

/**
 * Builds a context menu suitable for showing in a text editor.
 * select
 * @return {Menu}
 */
var buildEditorContextMenu = function(selection) {

	if ( typeof selection === 'undefined' ) {
		selection = {
			isMisspelled: false,
			spellingSuggestions: []
		}
	}

  var template = cloneDeep(DEFAULT_MAIN_TPL);
  var suggestionsTpl = cloneDeep(DEFAULT_SUGGESTIONS_TPL);

  if (selection.isMisspelled) {
    var suggestions = selection.spellingSuggestions;
    if ( suggestions.length == 0 ) {
      template.unshift.apply(template, suggestionsTpl);
    } else {
      template.unshift.apply(template, suggestions.map(function(suggestion) {
        return {
          label: suggestion,
          click: function() {
            BrowserWindow.getFocusedWindow().webContents.replaceMisspelling(suggestion);
          }
        };
      }).concat({
        type: 'separator'
      }));
    }
  }

  return Menu.buildFromTemplate(template);
};

module.exports = buildEditorContextMenu;
