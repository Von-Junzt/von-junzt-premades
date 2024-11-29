// Define effect data once at module level
const DUCKING_EFFECT = {
    name: "Ducking",
    transfer: false,
    changes: [
        {
            key: "system.skills.ste.bonuses.check",
            mode: 2,
            value: "+2",
            priority: 20
        },
        {
            key: "system.attributes.movement.walk",
            mode: 1,
            value: "0.5",
            priority: 20
        }
    ],
    flags: {
        dae: {
            showIcon: true,
        }
    },
    img: "modules/levelsautocover/icons/ducking.png",
    description: "<p>The creature ducks down. While crouching, the creature gains +2 to Stealth checks, but halves its movement speed.</p>"
};

export async function toggleDuckingEffect(tokenDocument) {
    // effects are applied once for every client if we don't return on all non-gm machines
    if (!game.user.isGM) return;
    
    // get token and see if effect is allready applied
    const token = canvas.tokens.get(tokenDocument.id);
    const existingEffect = token.actor.effects.find(e => e.name === "Ducking");
    
    // check if token is ducking, if yes, add effect if not existing already
    if (token.document.flags.levelsautocover.ducking) {
        if (!existingEffect) { 
            await MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: token.actor.uuid, 
                effects: [DUCKING_EFFECT]
            });
        }
    } else {
        // if token is not ducking, remove effect
        await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: token.actor.uuid, 
            effects: [existingEffect.id]
        });
    }
}
