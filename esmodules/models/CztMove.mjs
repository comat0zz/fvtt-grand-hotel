// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztMove extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.description = new fields.HTMLField({ required: true, textSearch: true });
        
        schema.formula = new fields.SchemaField({
            value: new fields.StringField({ required: false, nullable: false, initial: "" })
        });
        
        schema.results = new fields.SchemaField({
            on_10: new fields.HTMLField({ required: false, textSearch: true, initial: "" }),
            on_79: new fields.HTMLField({ required: false, textSearch: true, initial: "" }),
            on_79_tag: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.SetTag"
            }),
            on_6: new fields.HTMLField({ required: false, textSearch: true, initial: "" }),
            on_6_crisis: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.crisis"
            }),
            on_6_tag: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.SetTag"
            })
        });

        schema.examples = new fields.HTMLField({ required: false, textSearch: true, initial: "" });
        schema.grey = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.role = new fields.StringField({ required: true });

        schema.options = new fields.SchemaField({
            disable: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.disabled"
            }),
            scene: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.scene"
            }),
            session: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.session"
            }),
            relation: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.relation"
            }),
            remove_tags: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.remove_tags"
            }),
            crisis: new fields.BooleanField({ 
                required: true, 
                initial: false, 
                label: "CZT.Moves.Options.crisis"
            })
        });
        
        schema.op = new fields.NumberField({ ...requiredInteger, initial: 3, min: 1, max: 5 });

        schema.types = new fields.StringField({ required: false });

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