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

        
       // const moveCtxMenu = 
       // moveCtxMenu.forEach((d) => d.addEventListener("contextmenu", this._onMoveCtxMenu.bind(this)))
        //this._createContextMenu(this._powerRollContextOptions, '.tab-move-list .move-item', {});
    }

    /** @inheritdoc */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        this._createContextMenu(this._moveListContextOptions, ".tab-move-list .move-item", {
            hookName: "getMoveListContextOptions",
            fixed: true,
            parentClassHooks: false,
        });
    }

    /**
     * Context menu entries for power rolls
     * @returns {ContextMenuEntry}
     */
    _moveListContextOptions() {
        return [
            {
                name: game.i18n.localize("CZT.Rolls.Simple"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._rollDicesSimple(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Rolls.Advance"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._rollDicesSimple(moveId, true);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.EnableDisable"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._moveEnable(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.Navs.examples"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._showExamples(moveId);
                }
            }
        ];
    };

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
    
    async _showExamples(moveId) {
        const move = await game.packs.get(`${SYSTEM.id}.moves`).get(moveId);
        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/sheets/items/move-examples.hbs`, {
            content: move.system.examples
        });

        const title = game.i18n.localize("CZT.Moves.Example.Title");
        const method = await foundry.applications.api.DialogV2.wait({
            window: { 
                title: `${title}: ${move.name}`
            },
            content: template,
            classes: ['show-move-examples'],
            buttons: [
            {
                label: game.i18n.localize("CZT.Moves.Example.Button"),
                action: "Close",
            }
            ]
        })
    }

    async _moveEnable(moveId) {
        const move = await game.packs.get(`${SYSTEM.id}.moves`).get(moveId);
        let moves_disabled = foundry.utils.duplicate(this.document.system.moves_disabled);
        
        // Если выключаем и его нет в настройках
        if(!moves_disabled.includes(moveId)) {
            moves_disabled.push(moveId);
        }else{
            moves_disabled = CztUtility.delElementArray(moves_disabled, moveId);
        }

        this.actor.update({['system.moves_disabled']: moves_disabled});
    }

    async _rollDicesSimple(moveId, isHelp = false) {
        const move = await game.packs.get(`${SYSTEM.id}.moves`).get(moveId);
        let formula = '2d6';
        if(isHelp) {formula = '3d6'};

        // Бонус от положения на шкале
        const move_op = move.system.op;
        const actor_op = this.document.system.op;
        const preBonus = Math.abs(move_op - actor_op);
        let bonus = '+0';

        switch(preBonus){
            case 0: // в одной точке
                bonus = "+2";
                break;
            case 1: // рядом
                bonus = "+1";
                break;
            case 2: // через одно деление
                bonus = "+0";
                break;
            case 3: // через два деления
                bonus = "-1";
                break;
            case 4: // в разных концах
                bonus = "-2";
                break;
            default:        
        }

        const finalFormula = `${formula}${bonus}`
        const roll = await new Roll(finalFormula).evaluate();
        const terms = roll.terms[0].results;
        let total = roll.total;
        let dice_1 = terms[0].result;
        let dice_2 = terms[1].result;
        let dice_3 = false;
        if(isHelp) {
            dice_3 = terms[2].result;
            let arrValues = [dice_1, dice_2, dice_3];
            let mm_num = Math.min.apply(null, arrValues);
            let filteredNumbers = arrValues.filter((number) => number !== mm_num);
            // может быть ситуация, когда выпало три одинаковых или два, 
            // в итоге выше уберет больше одного, 
            // а раз кубы убрало, значит надо дополнить, мы знаем какие - mm_num
            while(filteredNumbers.length < 2) {
                filteredNumbers.push(mm_num)
            }
            dice_1 = filteredNumbers[0];
            dice_2 = filteredNumbers[1];
            dice_3 = mm_num;

            total = eval(dice_1 + dice_2 + bonus)
        }
        const total_dices = dice_1 + dice_2;

        let move_res = "";
        if(total >= 10){
            move_res = move.system.results.on_10;
        }else if(total >= 7 && total <= 9) {
            move_res = move.system.results.on_79;
        }else{
            move_res = move.system.results.on_6;
        }

        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
            finalFormula: finalFormula,
            formula: formula,
            total: total,
            total_dices: total_dices,
            move_name: move.name,
            move_res: move_res,
            dice_1: dice_1,
            dice_2: dice_2,
            dice_3: dice_3,
            isHelp: isHelp
        });

        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template
        });
    }

}