/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export default class CztActor extends Actor {
  
  constructor(data = {}, context) {
      if (!data.img && data.type == 'hotel') {
        data.img = `${SYSTEM.assets_path}/hotel-logo.png`;
      }else if (!data.img && data.type == 'guest') {
        data.img = `${SYSTEM.assets_path}/guest.png`;
      }

      super(data, context);
    }

  };