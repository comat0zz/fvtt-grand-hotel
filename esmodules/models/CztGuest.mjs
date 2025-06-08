// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztGuest extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.description = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.notes = new fields.HTMLField({ required: true, textSearch: true });

        schema.nuance = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.problem = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.secret  = new fields.StringField({ required: false, nullable: false, initial: "" });

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