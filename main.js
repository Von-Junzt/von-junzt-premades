import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {removeArmorDR, updateArmorDR} from "./macros/effects/armorDamageReduction.js";


// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// set up a hook to listen for item updates
Hooks.on('updateItem', async (item, changes, options, userId) => {
    if (!game.user.isGM) return;

    // Check if this is an armor item being equipped/unequipped
    const isArmorItem = item.system.type.label.toLowerCase().includes('armor');
    const isEquippedArmor = item.parent.system.attributes.ac?.equippedArmor;

    if (isArmorItem) {
        if (isEquippedArmor) {
            // Armor is being equipped or updated
            await updateArmorDR(item.parent, item);
        } else {
            // Armor is being unequipped
            await removeArmorDR(item.parent);
        }
    }
});

// NOT NEEDED ATM: import wyrmbane recharge script and set up a hook to listen for the rest event
// import {rechargeWyrmbane} from "./macros/items/rechargeWyrmbane.js";
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
