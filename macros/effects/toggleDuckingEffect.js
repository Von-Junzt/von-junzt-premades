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
    if (!game.user.isGM) return;
    
    const token = canvas.tokens.get(tokenDocument.id);
    const existingProneEffect = token.actor.effects.find(e => e.name === "Prone");
    const existingDuckingEffect = token.actor.effects.find(e => e.name === "Ducking");

    let effectData = chrisPremades.utils.effectUtils.getSidebarEffectData("Ducking") || DUCKING_EFFECT;

    if (token.document.flags?.levelsautocover?.ducking) {
        if (!existingDuckingEffect) {
            // Batch the updates into a single operation
            const updates = [];

            if (existingProneEffect) {
                updates.push(MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: token.actor.uuid,
                    effects: [existingProneEffect.id]
                }));
            }

            updates.push(MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: token.actor.uuid,
                effects: [effectData]
            }));

            // Execute all updates at once
            await Promise.all(updates);
        }
    } else {
        if(existingDuckingEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: token.actor.uuid,
                effects: [existingDuckingEffect.id]
            });
        }
    }
}