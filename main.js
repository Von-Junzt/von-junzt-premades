import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {removeArmorDR, updateArmorDR} from "./macros/effects/armorDamageReduction.js";


// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// set up a hook to listen for item updates
Hooks.on('preUpdateItem', async (item, changes, options, userId) => {
    if (!game.user.isGM) return;

    if (changes.system?.equipped !== undefined) {
        const isArmorItem = item?.system.type?.label?.toLowerCase().includes('armor');
        if (isArmorItem) {
            if (changes.system.equipped) {
                await updateArmorDR(item.parent, item);
            } else {
                await removeArmorDR(item.parent);
            }
        }
    }
});

// NOT NEEDED ATM: import wyrmbane recharge script and set up a hook to listen for the rest event
// import {rechargeWyrmbane} from "./macros/items/rechargeWyrmbane.js";
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
