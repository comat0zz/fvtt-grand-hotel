/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export default class CztActor extends Actor {
  
  constructor(data = {}, context) {
      if (!data.img && data.type == 'hotel') {
        data.img = `${SYSTEM.assets_path}/hotel-logo.png`;
      }
      super(data, context);
    }

  };