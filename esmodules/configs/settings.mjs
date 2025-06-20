// https://foundryvtt.wiki/en/development/guides/handling-data
import { SYSTEM } from "./system.mjs";

export const registerSystemSettings = function() {

  game.settings.register(SYSTEM.id, 'isSystemDebug', {
    name: game.i18n.localize("CZT.Common.Debug.Label"),
    hint: game.i18n.localize("CZT.Common.Debug.Info"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true
  });

  game.settings.register(SYSTEM.id, 'isSendChatCard', {
    name: game.i18n.localize("CZT.Card.PublishToChat"),
    hint: game.i18n.localize("CZT.Card.PublishToChatInfo"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true
  });

  game.settings.register(SYSTEM.id, 'isTypeDeckCard', {
    name: game.i18n.localize("CZT.Card.sourceDeckBruno"),
    hint: game.i18n.localize("CZT.Card.sourceDeckBrunoInfo"),
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "comp": game.i18n.localize("CZT.Card.sourceComp"),
      "item": game.i18n.localize("CZT.Card.sourceItem")
    },
    default: 'comp',
    requiresReload: true
  });


};