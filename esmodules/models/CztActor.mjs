// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztActor extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.description = new fields.HTMLField({ required: true, textSearch: true });
        schema.notes = new fields.HTMLField({ required: true, textSearch: true });

        schema.contacts = new fields.SchemaField({
            pl1: new fields.StringField({ required: false, nullable: false, initial: "" }),
            pl2: new fields.StringField({ required: false, nullable: false, initial: "" }),
            pl3: new fields.StringField({ required: false, nullable: false, initial: "" }),
            pl1Info: new fields.StringField({ required: false, nullable: false, initial: "" }),
            pl2Info: new fields.StringField({ required: false, nullable: false, initial: "" }),
            pl3Info: new fields.StringField({ required: false, nullable: false, initial: "" })
        });

        // Связь с чарником отеля.
        schema.grand_hotel = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.quotes = new fields.StringField({ required: false, nullable: false, initial: "" });

        schema.op = new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 5 });

        schema.tags = new fields.StringField({ required: false, nullable: false, initial: "" });

        // Опции задействованных ходов и список коллег, который применен в ходе связей
        schema.moves_disabled = new fields.ArrayField(new fields.StringField());


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