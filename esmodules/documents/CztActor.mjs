/**
 * Extend the basic Actor
 * @extends {Actor}
 */
import { SYSTEM, ActorTypes } from "../configs/system.mjs";

const defaultActorImg = {
  hotel: `${SYSTEM.assets_path}/hotel-logo.png`,
  guest: `${SYSTEM.assets_path}/guest.png`,
  chef: `${SYSTEM.assets_path}/chef.png`,
  housemaid: `${SYSTEM.assets_path}/housemaid.png`,
  metrdotel: `${SYSTEM.assets_path}/metrdotel.png`,
  porter: `${SYSTEM.assets_path}/porter.png`
}

export default class CztActor extends Actor {
  
  constructor(data = {}, context) {

    if (!data.img && data.type in defaultActorImg) {
      data.img = defaultActorImg[data.type];
    }
    
    super(data, context);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if(this.system.quotes == "" && ActorTypes.includes(this.type)) {
      const quote = `CZT.Actor.RolesQuotes.${this.type}`;
      this.system.quotes = game.i18n.localize(quote);
    }
  }
};