// Hooks for the rechargeItem function:
Hooks.on("dnd5e.restCompleted", async () => {

    game.critsRevisited.helperFunctions.createChatMessage(game.users.activeGM, "Wyrmbane has been recharged.");
});