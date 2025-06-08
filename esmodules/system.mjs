import { SYSTEM, ActorTypes } from "./configs/system.mjs";
globalThis.SYSTEM = SYSTEM; // Expose the SYSTEM object to the global scope

import { registerSystemSettings } from "./configs/settings.mjs";
import { initializeHandlebars } from "./handlebars/init.mjs";

// Import modules
import * as CztUtility from "./utilities/_module.mjs";
import * as applications from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as models from "./models/_module.mjs";

import { handleSocketEvent } from "./socket.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  globalThis[SYSTEM.id] = game[SYSTEM.id] = Object.assign(game.system, globalThis.SYSTEM);

  game.logger = new CztUtility.Log(SYSTEM.isDebug);
  
  // Expose the system API
  game.system.api = {
    applications,
    models,
    documents,
  }

  CONFIG.Actor.documentClass = documents.CztActor;
  CONFIG.Actor.dataModels = {
    porter: models.CztActor,
    metrdotel: models.CztActor,
    chef: models.CztActor,
    housemaid: models.CztActor,
    guest: models.CztGuest,
    hotel: models.CztHotel
  };

  CONFIG.Item.documentClass = documents.CztMove;
  CONFIG.Item.dataModels = {
    move: models.CztMove
  }

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet(SYSTEM.id, applications.CztActorSheet, { 
    types: ActorTypes, 
    makeDefault: true
  });

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet(SYSTEM.id, applications.CztGuestSheet, { 
    types: ["guest"], 
    makeDefault: true,
    label: "TYPES.Actor.guest"
  });

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet(SYSTEM.id, applications.CztHotelSheet, { 
    types: ["hotel"], 
    makeDefault: true,
    label: "TYPES.Actor.hotel"
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet)
  foundry.documents.collections.Items.registerSheet(SYSTEM.id, applications.CztMoveSheet, { 
    types: ["move"], 
    makeDefault: true,
    label: "TYPES.Item.move"
  })

  // Activate socket handler
  game.socket.on(`system.${SYSTEM.id}`, handleSocketEvent)

  registerSystemSettings();
  initializeHandlebars();

  game.logger.info(`${SYSTEM.id} | System Initialized`);
});

