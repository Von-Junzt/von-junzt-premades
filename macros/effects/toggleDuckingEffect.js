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
    description: "<p>The creature ducks down. While crouching, the creature gains +1 to Stealth checks, but halves its movement speed.</p>"
};

export async function toggleDuckingEffect(tokenDocument) {
    if (!game.user.isGM) return;
    
    const token = canvas.tokens.get(tokenDocument.id);
    const existingEffect = token.actor.effects.find(e => e.name === "Ducking");
    
    if (token.document.flags.levelsautocover.ducking) {
        if (!existingEffect) {
            await MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: token.actor.uuid, 
                effects: [DUCKING_EFFECT]
            });
        }
    } else {
        await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: token.actor.uuid, 
            effects: [existingEffect.id]
        });
    }
}
