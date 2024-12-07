import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {removeArmorDR, updateArmorDR} from "./macros/effects/armorDamageReduction.js";


// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// set up a hook to listen for item updates
Hooks.on('updateItem', async (item, changes, options, userId) => {
    if (!game.user.isGM) return;

    const isValidArmor = item.type === "equipment"
        && item.system?.isArmor
        && item.system.type.label.toLowerCase().includes('armor')
        && !item.system.type.baseItem.includes('shield');

    if (isValidArmor && item.system.equipped) {
        await updateArmorDR(item.parent, item);
    } else if (isValidArmor && !item.system.equipped) {
        await removeArmorDR(item.parent);
    }
});

// NOT NEEDED ATM: import wyrmbane recharge script and set up a hook to listen for the rest event
// import {rechargeWyrmbane} from "./macros/items/rechargeWyrmbane.js";
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
