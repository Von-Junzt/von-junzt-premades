/**
 * This script is called by main.js everytime a token is updated. It checks for the levelsautocover.ducking 
 * flag and applied a predefined effect accordingly. I should maybe add a check for CPR sidebar effects so 
 * you can define your own ducking effect keys.
 */

// default ducking effect
const DUCKING_EFFECT = {
    name: "Ducking",
    transfer: false,
    changes: [],
    flags: {
        dae: {
            showIcon: true,
        }
    },
    img: "modules/levelsautocover/icons/ducking.png",
    description: "<p>The creature ducks down.</p>"
};

export async function toggleDuckingEffect(tokenDocument) {
    // effects are applied once for every client if we don't return on all non-gm machines
    if (!game.user.isGM) return;
    
    // get token and see if effect is allready applied
    const token = canvas.tokens.get(tokenDocument.id);
    const existingEffect = token.actor.effects.find(e => e.name === "Ducking");

    // use CPR Sidebar effect if it exists, otherwise fallback to the default effect
    let effectData = chrisPremades.utils.effectUtils.getSidebarEffectData("Ducking") || DUCKING_EFFECT;

    // check if token is ducking, if yes, add effect if not existing already
    if (token.document.flags?.levelsautocover?.ducking) {
        if (!existingEffect) {
            await MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: token.actor.uuid,
                effects: [effectData]
            });
        }
    } else {
        // if token is not ducking, remove effect if present
        if(existingEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: token.actor.uuid,
                effects: [existingEffect.id]
            });
        }
    }
}
