/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CztActorSheet}
 */

import { SYSTEM } from "../configs/system.mjs";
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
        hero: {
            template: `${SYSTEM.template_path}/sheets/actors/hero-sheet.hbs`
        }
    }

    
    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {
        var context = {}
        
        context.fields = this.document.schema.fields
        context.systemFields = this.document.system.schema.fields
        context.actor = this.document
        context.system = this.document.system
        context.source = this.document.toObject()
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true })
        context.isEditMode = this.isEditMode
        context.isPlayMode = this.isPlayMode
        context.isEditable = this.isEditable



        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options))

    }

     // А по другому из компендума заролить только через костыли. 
     // Знакомьтесь - это один из костылей :)
     async _getRandomText(data) {
       const lines = data.collections.results._source;
       const lines_len = lines.length;
       const lines_rand = CztUtility.getRandomInt(0, lines_len);
       return [lines[lines_rand].name, lines[lines_rand].description];
     }
     
    async _onGenerateBoy(event, target) {
        event.preventDefault();

        const arrayNumbers = [3,4,5,6,7,8,9,10,11];
        const indexNumbers = CztUtility.getRandomInt(0, arrayNumbers.length)
        const char_number = arrayNumbers[indexNumbers]

        const arrayWound = [3,5]
        const indexWound = CztUtility.getRandomInt(0, 2)
        const wound = arrayWound[indexWound]

        const rollComp = await game.packs.get('cosmoboys.cosmo-rolltables').getDocuments({ _id__in: 
            [
                "y7r6E6z8vLZiqsFU", // Архетипы
                "KCOxVWdqkZVh05MY", // Вспышки
                "lxN55wJ2Uhe7d49c", // Имена
                "74wujyPcno3TijQD", // Оружие
                "aFzUM9H5aqyoRnJy", // Транспорт 
            ]})
        
        
        const cNamePack = await rollComp.filter(e => e._id === "lxN55wJ2Uhe7d49c")[0];
        const [cNameValue, cNameDesc] = await this._getRandomText(cNamePack);

        const cFlashPack = await rollComp.filter(e => e._id === "KCOxVWdqkZVh05MY")[0];
        const [cFlashValue, cFlashDesc] = await this._getRandomText(cFlashPack);

        const cArchPack = await rollComp.filter(e => e._id === "y7r6E6z8vLZiqsFU")[0];
        const [cArchValue, cArchhDesc] = await this._getRandomText(cArchPack);

        const cWeaponPack = await rollComp.filter(e => e._id === "74wujyPcno3TijQD")[0];
        const [cWeaponValue, cWeaponDesc] = await this._getRandomText(cWeaponPack);

        const cCarPack = await rollComp.filter(e => e._id === "aFzUM9H5aqyoRnJy")[0];
        const [cCarValue, cCarDesc] = await this._getRandomText(cCarPack);
        
        let char = {
            "weapon": cWeaponValue,
            "weapon_desc": cWeaponDesc.replace(/(<([^>]+)>)/gi, ""),
            "car": cCarValue,
            "car_desc": cCarDesc.replace(/(<([^>]+)>)/gi, ""),
            "name_desc": cNameDesc.replace(/(<([^>]+)>)/gi, "")
        };

        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/sheets/description-gen.hbs`, char);

        char["name"] = cNameValue;
        char["cArchValue"] = cArchValue;
        char["cArchhDesc"] = cArchhDesc.replace(/(<([^>]+)>)/gi, "");
        char["cFlashValue"] = cFlashValue;
        char["cFlashDesc"] = cFlashDesc.replace(/(<([^>]+)>)/gi, "");
        char["user"] = game.user.name;
        char["wound"] = wound;
        char["char_number"] = char_number;
        
        const template2 = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/gen.hbs`, char);

        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template2
        });

        const actorUpdate = {
            "name": cNameValue,
            "system.description": await foundry.applications.ux.TextEditor.implementation.enrichHTML(template, { async: true }),
            "system.wound.value": wound,
            "system.char_number.value": char_number,
            "system.flash.value": cFlashValue,
            "system.flash.desc": cFlashDesc,
            "system.archetype.value": cArchValue,
            "system.archetype.desc": cArchhDesc,
            "system.weapon.value": cWeaponValue,
            "system.carriage.value": cCarValue
        }
        this.actor.update(actorUpdate);
    }


    async _onSetWoundMinus(event, target) {
        const wound = parseInt(this.actor.system.wound.value);
        if(wound > 0) {
            this.actor.update({ ['system.wound.value']: wound - 1 });
        }
    }

    async _onSetWoundPlus(event, target) {
        const wound = parseInt(this.actor.system.wound.value);
        if(wound < 5) {
            this.actor.update({ ['system.wound.value']: wound + 1 });
        }
    }


    async _onRoll(event, target) {
        const rollType = $(event.currentTarget).data("roll-type");
        const boy_number = this.actor.system.char_number.value;
        const isHelp = $(event.currentTarget).parent('.cosmoboys-rolls').find('.roll-help-check').is(':checked')
        let succes = false;
        let flash = false;
        let trump = false;
        let flash_trump = false;
        let formula = '2d6';
        let dice_3 = "";
        let trump_text = "";

        if(isHelp) {formula = '3d6'};

        const roll = await new Roll(formula).evaluate();
        const terms = roll.terms[0].results;
        const total = roll.total;
        let dice_1 = terms[0].result;
        let dice_2 = terms[1].result;

        if(isHelp) {
            dice_3 = terms[2].result;
            let arrValues = [dice_1, dice_2, dice_3];
            let mm_num;
            if(rollType == 'boy') {
                mm_num = Math.max.apply(null, arrValues);
            }else if(rollType == 'cosmo') {
                // Нужно откинуть наименьший куб
                // чтобы в первых двух получить максимум 
                mm_num = Math.min.apply(null, arrValues);
            }
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

            if(dice_1 === dice_2) {
                flash = true;
            }

            // попробуем проверить на козыря
            if( (dice_1 + dice_2) == boy_number) {
                trump = true;
                trump_text = `${dice_1} + ${dice_2}`;
            }else if((dice_1 + dice_3) == boy_number) {
                trump = true;
                trump_text = `${dice_1} + ${dice_3}`;
            }else if((dice_2 + dice_3) == boy_number) {
                trump = true;
                trump_text = `${dice_2} + ${dice_3}`;
            }

        }

        if(flash && trump && !isHelp) {
            flash_trump = true;
        }
        if(dice_1 === dice_2 && !isHelp) {
            flash = true;
        }
        if(total == boy_number && !isHelp) {
            trump = true;
        }
        if(rollType == 'boy' && total <= boy_number && !isHelp) {
            succes = true;
        }else if(rollType == 'cosmo' && total >= boy_number && !isHelp) {
            succes = true;
        }
        let rollFlashTotal = "";
        const checkFlashD12 = game.settings.get(SYSTEM.id,'checkFlashD12');
        if(checkFlashD12) {
            const rollFlash = await new Roll("1d12").evaluate();
            rollFlashTotal = rollFlash.total;
        }

        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
            succes: succes,
            total: total,
            flash: flash,
            trump: trump,
            checkFlashD12: checkFlashD12,
            rollFlashTotal: rollFlashTotal,
            trump_text: trump_text,
            flash_trump: flash_trump,
            dice_1: dice_1,
            dice_2: dice_2,
            dice_3: dice_3,
            isHelp: isHelp,
            boy_number: boy_number,
            rollType: rollType,
            title_name: this.actor.name, //game.user.name;
            title_desc: game.i18n.localize(`CBOYS.Rolls.roll_${rollType}`)
        });

        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template
        });
    }
}