// Hooks for the rechargeItem function:
Hooks.on("dnd5e.restComplete", async () => {
    await rechargeItem();
});