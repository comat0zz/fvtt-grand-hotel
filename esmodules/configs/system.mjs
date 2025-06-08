// Namespace Configuration Values

export const SYSTEM_ID = "grand-hotel";

export const SYSTEM = {
    id: SYSTEM_ID,

    isDebug: true,

    system_path: `systems/${SYSTEM_ID}`,
    assets_path: `systems/${SYSTEM_ID}/assets`,
    template_path: `systems/${SYSTEM_ID}/templates`
};

/**
* Define the set of special ability types
* @type {Object}
*/


export const ActorTypes = [
    "porter",
    "metrdotel",
    "chef",
    "housemaid"
]