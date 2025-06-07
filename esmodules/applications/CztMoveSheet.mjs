/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {CztItemSheet}
 */

import { SYSTEM } from "../configs/system.mjs";
import * as CztUtility from "../utilities/_module.mjs";
const { api, sheets } = foundry.applications;

export default class CztMoveSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
    /**
     * Different sheet modes.r
     * @enum {number}
     */
    static SHEET_MODES = { 
        EDIT: 0, 
        PLAY: 1 
    }
    
    constructor(options = {}) {
        super(options)
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        tag: "form",
        position: {
            width: 580,
            height: "auto",
        },
        classes: [ SYSTEM.id, "sheet", "move" ],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        window: {
          resizable: true,
        }
    }

    /**
     * The current sheet mode.
     * @type {number}
     */
    _sheetMode = this.constructor.SHEET_MODES.PLAY
    
    /**
     * Is the sheet currently in 'Play' mode?
     * @type {boolean}
     */
    get isPlayMode() {
        return this._sheetMode === this.constructor.SHEET_MODES.PLAY
    }

    /**
     * Is the sheet currently in 'Edit' mode?
     * @type {boolean}
     */
    get isEditMode() {
        return this._sheetMode === this.constructor.SHEET_MODES.EDIT
    }

    /** @override */
    static PARTS = {
        tabs: {
            template: "templates/generic/tab-navigation.hbs",
        },
        info: {
            template: `${SYSTEM.template_path}/sheets/items/info-sheet.hbs`
        },
        results: {
            template: `${SYSTEM.template_path}/sheets/items/results-sheet.hbs`
        },
        examples: {
            template: `${SYSTEM.template_path}/sheets/items/examples-sheet.hbs`
        }
    }

    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {

        // Default tab for first time it's rendered this session
        if (!this.tabGroups.primary){
            this.tabGroups.primary = 'info';
        }

        var context = {
            fields: this.document.schema.fields,
            systemFields: this.document.system.schema.fields,
            item: this.document,
            system: this.document.system,
            source: this.document.toObject(),
            isEditMode: this.isEditMode,
            isPlayMode: this.isPlayMode,
            isEditable: this.isEditable,

            enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),

            enrichedExamples: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.examples, { async: true }),
            enrichedRes10: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.results.on_10, { async: true }),
            enrichedRes79: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.results.on_79, { async: true }),
            enrichedRes6: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.results.on_6, { async: true }),

            tabs: {
                info: {
                    cssClass: this.tabGroups.primary === 'info' ? 'active' : '',
                    group: 'primary',
                    id: 'info',
                    icon: '',
                    label: 'CZT.Moves.Navs.info',
                },
                results: {
                    cssClass: this.tabGroups.primary === 'results' ? 'active' : '',
                    group: 'primary',
                    id: 'results',
                    icon: '',
                    label: 'CZT.Moves.Navs.results',
                },
                examples: {
                    cssClass: this.tabGroups.primary === 'examples' ? 'active' : '',
                    group: 'primary',
                    id: 'examples',
                    icon: '',
                    label: 'CZT.Moves.Navs.examples',
                }
            }
        }

        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options))

    }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
        case 'results':
        case 'info':
        case 'examples':
          context.tab = context.tabs[partId];
          break;
        default:
      }
      return context;
  }
}