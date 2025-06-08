/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CztActorSheet}
 */

import { SYSTEM, ActorTypes } from "../configs/system.mjs";
import * as CztUtility from "../utilities/_module.mjs";
const { api, sheets } = foundry.applications;

export default class CztHotelSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
    /**
     * Different sheet modes.r
     * @enum {number}
     */
    static SHEET_MODES = { 
        EDIT: 0, 
        PLAY: 1 
    }
    
    constructor(data, context) {
        super(data, context);
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        tag: "form",
        position: {
            width: 800,
            height: 600,
        },
        classes: [ SYSTEM.id, "sheet", "hotel" ],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
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
        hotel: {
            template: `${SYSTEM.template_path}/sheets/actors/hotel-sheet.hbs`,
            scrollable: [""]
        },
        employees: {
            template: `${SYSTEM.template_path}/sheets/actors/hotel-employees-sheet.hbs`
        },
        notes: {
            template: `${SYSTEM.template_path}/sheets/actors/notes-tab-sheet.hbs`
        },
        crisis: {
            template: `${SYSTEM.template_path}/sheets/actors/hotel-crisis-sheet.hbs`
        }
    }

    
    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {

        // Default tab for first time it's rendered this session
        if (!this.tabGroups.primary){
            this.tabGroups.primary = 'hotel';
        }

        const Employees = game.actors.filter(actor => { return (ActorTypes.includes(actor.type) && actor.system.grand_otel === "")});
        
        const leCadresIds = this.document.system.employees;
        const leCadres = game.actors.filter(actor => { return (leCadresIds.includes(actor._id))});

        var context = {
          fields: this.document.schema.fields,
          systemFields: this.document.system.schema.fields,
          actor: this.document,
          system: this.document.system,
          source: this.document.toObject(),
          enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
          enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.notes, { async: true }),
          isEditMode: this.isEditMode,
          isPlayMode: this.isPlayMode,
          isEditable: this.isEditable,
          employees: Employees,
          employeesCount: Employees.length,
          leCadresCount: leCadresIds.length,
          leCadres: leCadres,
          isDebug: SYSTEM.isDebug,

          tabs: {
                hotel: {
                    cssClass: this.tabGroups.primary === 'hotel' ? 'active' : '',
                    group: 'primary',
                    id: 'hotel',
                    icon: '',
                    label: 'CZT.Hotel.Navs.Base',
                },
                crisis: {
                    cssClass: this.tabGroups.primary === 'crisis' ? 'active' : '',
                    group: 'primary',
                    id: 'crisis',
                    icon: '',
                    label: 'CZT.Hotel.Navs.Crisis',
                },
                employees: {
                    cssClass: this.tabGroups.primary === 'employees' ? 'active' : '',
                    group: 'primary',
                    id: 'employees',
                    icon: '',
                    label: 'CZT.Hotel.Navs.Employees',
                },
                notes: {
                    cssClass: this.tabGroups.primary === 'notes' ? 'active' : '',
                    group: 'primary',
                    id: 'notes',
                    icon: '',
                    label: 'CZT.Hotel.Navs.Notes',
                }
            }
        }



        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options));

        const changeCrisis = this.element.querySelectorAll(".crisis-check");
        changeCrisis.forEach((d) => d.addEventListener("click", this._onCrisis.bind(this)));

        const addEmploye = this.element.querySelectorAll(".hotel-AddEmp");
        addEmploye.forEach((d) => d.addEventListener("click", this._onAddEmp.bind(this)));

        const DelEmp = this.element.querySelectorAll(".hotel-DelEmp");
        DelEmp.forEach((d) => d.addEventListener("click", this._onDelEmp.bind(this)));

        if(SYSTEM.isDebug) {
            const isDebug = this.element.querySelectorAll(".hotel-isDebug");
            isDebug.forEach((d) => d.addEventListener("click", this._onisDebug.bind(this)));
        }
    }

    /** @override */
    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'hotel':
            case 'notes':
            case 'employees':
            case 'crisis':
                context.tab = context.tabs[partId];
                break;
            default:
        }
      return context;
    }

    async _onisDebug(event, target) {
        if(!SYSTEM.isDebug) { return; };

        game.actors.forEach((actor) => {
            if(ActorTypes.includes(actor.type)) {
                actor.update({['system.grand_otel']: ""})
            }else if(actor.type == 'hotel'){
                actor.update({ ['system.employees']: [] })
            }
        });
    }

    async _onCrisis(event, target) {
        var Crisis = $(event.currentTarget).data("num");
        if(!$(event.currentTarget)[0].checked) {
            Crisis -= 1;
        }
        this.actor.update({ ['system.crisis']: Crisis });
    }

    async _onDelEmp(event, target) {
        const employe_id = $(event.currentTarget).data("num");
        var employees = foundry.utils.duplicate(this.document.system.employees);
        employees = CztUtility.delElementArray(employees, employe_id);
        var emp = game.actors.get(employe_id);
        emp.update({['system.grand_otel']: ""});
        this.actor.update({ ['system.employees']: employees });
        this.actor.render(true);
    }

    async _onAddEmp(event, target) {
        const employe_id = $('select.hotel-employees option:selected').val();
        var employees = foundry.utils.duplicate(this.document.system.employees);
        // можно без этого, но так от случайного дабл клика и race condition
        if(!employees.includes(employe_id)) {
            employees.push(employe_id);
            var emp = game.actors.get(employe_id);
            emp.update({['system.grand_otel']: this.actor._id});
            this.actor.update({ ['system.employees']: employees });
            this.actor.render(true);
        }    
    }

}