import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {updateArmorDR} from "./macros/effects/armorDamageReduction.js";


// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// set up a hook to listen for item updates
Hooks.on('updateItem', async (item, changes, options, userId) => {
    if (game.user.id !== userId) return;

    if (item.type === "equipment" && item.system.equipped && item.system?.isArmor) {
        await updateArmorDR(item.parent, item);
    }
});

// NOT NEEDED ATM: import wyrmbane recharge script and set up a hook to listen for the rest event
// import {rechargeWyrmbane} from "./macros/items/rechargeWyrmbane.js";
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
