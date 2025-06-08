/**
 * Extend the basic Actor
 * @extends {Actor}
 */

import { SYSTEM } from "../configs/system.mjs";

export default class CztHotel extends Actor {

  constructor(data = {}) {
    console.log("AAAAA", data)
    if (!data.img) {
      data.img = `${SYSTEM.assets_path}/hotel-logo.png`;
    }
    super(data);
  }
  /*  
  _onUpdate(changed, options, userId) { 
      return super._onUpdate(changed, options, userId)
    } */
  };