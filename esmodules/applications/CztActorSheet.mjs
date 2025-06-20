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
        cards: {
            template: `${SYSTEM.template_path}/sheets/actors/hero-cards-sheet.hbs`
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
                cards: {
                    cssClass: this.tabGroups.primary === 'cards' ? 'active' : '',
                    group: 'primary',
                    id: 'cards',
                    icon: '',
                    label: 'CZT.Card.DeckShort'
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
        
        context.hotel = '';
        if(this.document.system.grand_hotel != "") {
            const hotel = game.actors.filter(actor => { return (actor.type === "hotel" && actor._id == this.document.system.grand_hotel)});
            context.hotel = hotel[0];
        }

        context.contacts = game.actors.filter(actor => { return (ActorTypes.includes(actor.type) && actor._id != this.document._id )});
        context.is_tags = this.document.system.tags.split(",").length;

        const moves_contacts = this.document.system.moves_contacts;
        context.moves_contacts = game.actors.filter(actor => { return (ActorTypes.includes(actor.type) && moves_contacts.includes(actor._id))});

        context.cards = this.document.system.cards;

        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options));

        const genContacts = this.element.querySelectorAll(".actor-contacts-gen");
        genContacts.forEach((d) => d.addEventListener("click", this._genContacts.bind(this)));

        const delCards = this.element.querySelectorAll(".hero-cards-item-button");
        delCards.forEach((d) => d.addEventListener("click", this._delCards.bind(this)));
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

    async _delCards(event, target) {
        const card_id = $(event.currentTarget).data("num");
        const oldCards = foundry.utils.duplicate(this.document.system.cards);
        const newCards = oldCards.filter(card => (card.id != card_id));
        this.actor.update({['system.cards']: newCards});
        ui.notifications.info("CZT.Card.DeletedCard", {localize: true});
    }

    async _genContacts(event, target) {
        
        const con = await game.packs.get(`${SYSTEM.id}.contacts`).getDocument("bPHbD4WulW9BJ0vt");
        const lines = con.collections.results._source;
        const lines_len = lines.length;
        let contacts = foundry.utils.duplicate(this.document.system.contacts);
        
        if(contacts.pl1 != "") {
            const lines_rand1 = CztUtility.getRandomInt(0, lines_len);
            contacts.pl1Info = lines[lines_rand1].name;
        }
        
        if(contacts.pl2 != "") {
            const lines_rand2 = CztUtility.getRandomInt(0, lines_len);
            contacts.pl2Info = lines[lines_rand2].name;
        }

        if(contacts.pl3 != "") {
            const lines_rand3 = CztUtility.getRandomInt(0, lines_len);
            contacts.pl3Info = lines[lines_rand3].name;            
        }

        this.actor.update({['system.contacts']: contacts});
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
            },
            {
                name: game.i18n.localize("CZT.Moves.AddContact"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq' && el.dataset.relation),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._AddContact(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.DellContact"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq' && el.dataset.relation),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._DellContact(moveId);
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
            case 'cards':
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
        const hotel_id = this.document.system.grand_hotel;
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
            
            if(hotel_id != "") {
                var grand_hotel = game.actors.get(hotel_id);
                var success_scale = grand_hotel.system.success_scale;
                if(success_scale < 4) {
                    success_scale = success_scale + 1;
                    grand_hotel.update({['system.success_scale']: success_scale});
                    CztUtility.sendNotifyToChat({
                        title: "CZT.Hotel.success_scale_notify",
                        color: "red"
                    })
                }
                if(success_scale >= 4) {
                    CztUtility.sendNotifyToChat({
                        title: "CZT.Hotel.success_scale_notify_end",
                        color: "red"
                    })
                }
            }            
        }else if(total >= 7 && total <= 9) {
            move_res = move.system.results.on_79;
        }else{
            move_res = move.system.results.on_6;
        }

        // Сдвиг счетчика кризиса
        if(total <= 6) {
            if(hotel_id != "") {
                var grand_hotel = game.actors.get(hotel_id);
                var crisis = grand_hotel.system.crisis;
                if(crisis < 5) {
                    crisis = crisis + 1;
                    grand_hotel.update({['system.crisis']: crisis});
                    CztUtility.sendNotifyToChat({
                        title: "CZT.Hotel.CrisisUp",
                        color: "pink"
                    })
                }
            }
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

    async _DellContact(moveId) {
        let moves_contacts = this.document.system.moves_contacts;
        let con = [];

        moves_contacts.forEach(mc => {
            let n = game.actors.get(mc);
            con.push({
                id: mc,
                name: n.name
            })
        })
        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/sheets/actors/hero-dellcontact-sheet.hbs`, {
            contacts: con
        });


        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("CZT.Moves.DellContact") },
            content: template,
            classes: ['show-contacts'],
            buttons: [{
                action: "dell",
                label: game.i18n.localize("CZT.Moves.DellContactShort"),
                callback: (event, button, dialog) => {
                    const id = button.form.elements.contact.value;
                    moves_contacts = CztUtility.delElementArray(moves_contacts, id);
                    this.actor.update({['system.moves_contacts']: moves_contacts});
                }
            }]
            }).render({ force: true });
    }

    async _AddContact(moveId) {

        const contacts = this.document.system.contacts;
        let moves_contacts = this.document.system.moves_contacts;
        let con = {};
        if(contacts.pl1 != "" && !moves_contacts.includes(contacts.pl1)) {
            con.pl1 = {
                id: contacts.pl1,
                name: game.actors.get(contacts.pl1).name
            }
        }
        if(contacts.pl2 != "" && !moves_contacts.includes(contacts.pl2)) {
            con.pl2 = {
                id: contacts.pl2,
                name: game.actors.get(contacts.pl2).name
            }
        }
        if(contacts.pl3 != "" && !moves_contacts.includes(contacts.pl3)) {
            con.pl3 = {
                id: contacts.pl3,
                name: game.actors.get(contacts.pl3).name
            }
        }

        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/sheets/actors/hero-addcontact-sheet.hbs`, {
            contacts: con
        });



        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("CZT.Moves.AddContact") },
            content: template,
            classes: ['show-contacts'],
            buttons: [{
                action: "add",
                label: game.i18n.localize("CZT.Moves.AddContactShort"),
                callback: (event, button, dialog) => {
                    const id = button.form.elements.contact.value;
                    moves_contacts.push(id);
                    this.actor.update({['system.moves_contacts']: moves_contacts});
                }
            }]
            }).render({ force: true });
    }

}