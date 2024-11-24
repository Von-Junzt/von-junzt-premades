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
// set up a hook to listen for the rest event
Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
