// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztHotel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.description = new fields.HTMLField({ required: true, textSearch: true });
        schema.notes = new fields.HTMLField({ required: true, textSearch: true });

        schema.name = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.namel = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.terra = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.terral = new fields.StringField({ required: false, nullable: false, initial: "" });
        
        schema.age = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.agel = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.floor = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.floorl = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.room = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.rooml = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.ladder = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.ladderl = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.basement = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.basementl = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.employee = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.employeel = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.employees = new fields.ArrayField(new fields.StringField());

        schema.crisis = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 5 });

        schema.success_scale = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 4 });
        schema.tags_number = new fields.NumberField({ ...requiredInteger, initial: 5, min: 0});

        return schema;
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        let updates = {};

        if (Object.keys(updates).length > 0) {
            this.parent.update(updates);
        }
    }
}