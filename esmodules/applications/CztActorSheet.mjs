/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CztActorSheet}
 */

import { SYSTEM, ActorTypes } from "../configs/system.mjs";
import * as CztUtility from "../utilities/_module.mjs";
const { api, sheets } = foundry.applications;

export default class CztActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
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
        classes: [ SYSTEM.id, "sheet", "actor" ],
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
        hero: {
            template: `${SYSTEM.template_path}/sheets/actors/hero-sheet.hbs`
        },
        moves: {
            template: `${SYSTEM.template_path}/sheets/actors/moves-list-uniq-sheet.hbs`
        },
        moveslist: {
            template: `${SYSTEM.template_path}/sheets/actors/moves-list-sheet.hbs`
        },
        notes: {
            template: `${SYSTEM.template_path}/sheets/actors/notes-tab-sheet.hbs`
        }
    }

    
    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {

        // Default tab for first time it's rendered this session
        if (!this.tabGroups.primary){
            this.tabGroups.primary = 'hero';
        }

        var context = {
          fields: this.document.schema.fields,
          systemFields: this.document.system.schema.fields,
          actor: this.document,
          system: this.document.system,
          source: this.document.toObject(),
          enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.notes, { async: true }),
          isEditMode: this.isEditMode,
          isPlayMode: this.isPlayMode,
          isEditable: this.isEditable,

          tabs: {
                hero: {
                    cssClass: this.tabGroups.primary === 'hero' ? 'active' : '',
                    group: 'primary',
                    id: 'hero',
                    icon: '',
                    label: 'CZT.Actor.Navs.Hero',
                },
                moves: {
                    cssClass: this.tabGroups.primary === 'moves' ? 'active' : '',
                    group: 'primary',
                    id: 'moves',
                    icon: '',
                    label: 'CZT.Moves.Types.Uniq',
                },
                moveslist: {
                    cssClass: this.tabGroups.primary === 'moveslist' ? 'active' : '',
                    group: 'primary',
                    id: 'moveslist',
                    icon: '',
                    label: 'CZT.Moves.Types.Base',
                },
                notes: {
                    cssClass: this.tabGroups.primary === 'notes' ? 'active' : '',
                    group: 'primary',
                    id: 'notes',
                    icon: '',
                    label: 'CZT.Actor.Navs.Notes',
                }
            }
        }

        const moves = await game.packs.get(`${SYSTEM.id}.moves`).getDocuments();
        context.moveUniq = await moves.filter(e => e.system.types === "uniq" && e.system.role === this.document.type);
        context.moveBase = await moves.filter(e => e.system.types === "base");

       

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
            case 'hero':
            case 'moves':
            case 'notes':
            case 'moveslist':
                context.tab = context.tabs[partId];
                break;
            default:
        }
      return context;
    }

}