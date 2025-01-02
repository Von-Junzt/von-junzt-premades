/**
 * This script is used to create a new effect for the lantern item that will be used to toggle the lantern's 'hooded' light on and off.
 */
const effectDataHoodedLantern = {
    "name": "Hooded Lantern",
    "flags": {},
    "img": "icons/sundries/lights/lantern-steel.webp",
    "type": "base",
    "system": {},
    "changes": [
        {
            "key": "ATL.light.dim",
            "mode": 5,
            "value": "4",
            "priority": 50
        },
        {
            "key": "ATL.light.bright",
            "mode": 5,
            "value": "2",
            "priority": 50
        },
        {
            "key": "ATL.light.color",
            "mode": 5,
            "value": "#f98026",
            "priority": 50
        },
        {
            "key": "ATL.light.alpha",
            "mode": 5,
            "value": "0.2",
            "priority": 50
        },
        {
            "key": "ATL.light.animation",
            "mode": 5,
            "value": "{\"type\": \"lantern\",\"speed\": 1,\"intensity\": 1}",
            "priority": 50
        }
    ],
    "duration": {
        "startTime": null,
        "seconds": 21600,
        "combat": null,
        "rounds": null,
        "turns": null,
        "startRound": null,
        "startTurn": null
    },
    "description": "<p>Adds Hooded Lantern light for 6 hours (requires ATL)</p>",
};
const effectDataLantern = {
    "name": "Lantern",
    "flags": {},
    "img": "icons/sundries/lights/lantern-iron-yellow.webp",
    "changes": [
    {
        "key": "ATL.light.dim",
        "mode": 5,
        "value": "60",
        "priority": 50
    },
    {
        "key": "ATL.light.bright",
        "mode": 5,
        "value": "30",
        "priority": 50
    },
    {
        "key": "ATL.light.color",
        "mode": 5,
        "value": "#f98026",
        "priority": 50
    },
    {
        "key": "ATL.light.alpha",
        "mode": 5,
        "value": "0.4",
        "priority": 50
    },
    {
        "key": "ATL.light.animation",
        "mode": 5,
        "value": "{\"type\": \"lantern\",\"speed\": 1,\"intensity\": 1}",
        "priority": 50
    }
],
    "duration": {
    "startTime": null,
        "seconds": 21600,
        "combat": null,
        "rounds": null,
        "turns": null,
        "startRound": null,
        "startTurn": null
},
    "description": "<p>Adds Lantern light for 6 hours (requires ATL)</p>"
};

// search for existing lantern effects
let hoodedLanternEffects = actor.effects.filter(e => e.name === "Hooded Lantern");

// if hooded lantern effect exists, lantern is lit and hood can be raised
if(hoodedLanternEffects.length >= 1) {
    ui.notifications.warn("Raising the Lanterns hood.");
    hoodedLanternEffects.forEach(effect => {effect.delete()});
} else { // if hooded lantern effect does not exist, hood can be lowered
    ui.notifications.warn("Lowering the Lanterns hood.");
    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actor.uuid,
        effects: [effectDataHoodedLantern]
    });
}

