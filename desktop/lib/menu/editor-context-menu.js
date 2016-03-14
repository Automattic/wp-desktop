
/**
 * Original library:
 * Author: Jeff Wear, Mixmax, Inc
 * License: MIT
 * From: https://github.com/mixmaxhq/electron-editor-context-menu
 */

var noop = function(){};
var defaults = require('lodash.defaults');
var isEmpty = require('lodash.isempty');
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
 *
 * @param {Object=} selection - An object describing the current text selection.
 *   @property {Boolean=false} isMisspelled - `true` if the selection is
 *     misspelled, `false` if it is spelled correctly or is not text.
 *   @property {Array<String>=[]} spellingSuggestions - An array of suggestions
 *     to show to correct the misspelling. Ignored if `isMisspelled` is `false`.
 * @param {Function|Array} mainTemplate - Optional. If it's an array, use as is.
 *    If it's a function, used to customize the template of always-present menu items.
 *    Receives the default template as a parameter. Should return a template.
 * @param {Function|Array} suggestionsTemplate - Optional. If it's an array, use as is.
 *    If it's a function, used to customize the template of spelling suggestion items.
 *    Receives the default suggestions template as a parameter. Should return a template.
 * @return {Menu}
 */
var buildEditorContextMenu = function(selection) {

  selection = defaults({}, selection, {
    isMisspelled: false,
    spellingSuggestions: []
  });

  var template = cloneDeep(DEFAULT_MAIN_TPL);
  var suggestionsTpl = cloneDeep(DEFAULT_SUGGESTIONS_TPL);

  if (selection.isMisspelled) {
    var suggestions = selection.spellingSuggestions;
    if (isEmpty(suggestions)) {
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
