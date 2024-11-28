async function rechargeWyrmbane() {
    // Get all player actors
    let playerActors = game.actors.filter(actor => actor.hasPlayerOwner);
    let playerItems = [];
    // check if Wyrmbane is in their inventory
    playerActors.forEach(actor => {
        let wyrmbane = actor.items.filter(item => item.name === "Wyrmbane");
        if (wyrmbane.length > 0) {
            playerItems.push(...wyrmbane);
        }
    });
    // If Wyrmbane is found and has been used, recharge it and create a chat message
    if (playerItems.length > 0) {
        for (let wyrmbane of playerItems) {
            if(!wyrmbane.flags.homebrew.effectAvailable) {
                await wyrmbane.update({"flags.homebrew.effectAvailable": true});
                await ChatMessage.create({
                    content: "Wyrmbane has been recharged.",
                });
            } else {
                console.log("Wyrmbane has not been used.");
            }
        }
    }
}

const effectData = {
    "name": "Ducking",
    "transfer": false,
    "flags": {
        "dae": {
            "showIcon": true,
        }
    },
    "img": "modules/levelsautocover/icons/ducking.png",
    "description": "<p>The token is ducking an potentially taking cover.</p>"
}

async function toggleDucking(tokenDocument) {
    console.log("Ducking toggled");
    const token = canvas.tokens.get(tokenDocument.id);

    // Only proceed if this is the gm
    if (!game.user.isGM) return;

    const existingEffect = token.actor.effects.find(e => e.name === "Ducking");
    if (token.document.flags.levelsautocover.ducking) {
        if (!existingEffect) {
            await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: token.actor.uuid, effects: [effectData]});
        }
    } else {
        await MidiQOL.socket().executeAsGM("removeEffects", {actorUuid: token.actor.uuid, effects: [existingEffect.id]});
    }
}

// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDucking);

// NOT NEEDED ATM
// set up a hook to listen for the rest event
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
