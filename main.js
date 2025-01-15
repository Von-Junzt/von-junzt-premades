import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {removeArmorEffect, updateArmorDR} from "./macros/effects/armorDamageReduction.js";
import {removeWeaponInitiativeModifier, updateWeaponInitiativeModifier} from "./macros/effects/weaponInitiativeModifier.js";



// hook into the preUpdateCombat event to set up alternating initiative
Hooks.on("preUpdateCombat", async (combat, changes, options, userId) => {
    if (!game.user.isGM) return;

    // Only proceed when combat is starting (round 0 -> round 1)
    if (combat.round === 0 && changes.round === 1) {
        // Roll initiatives first
        await combat.rollAll();
    }
});

// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// set up a hook to listen for item updates
Hooks.on('preUpdateItem', async (item, changes, options, userId) => {
    if (!game.user.isGM) return;

    if (changes.system?.equipped !== undefined) {
        const isArmorItem = item?.system.type?.label?.toLowerCase().includes('armor');
        const isWeaponItem = item?.type?.toLowerCase().includes('weapon');
        if (isArmorItem) {
            if (changes.system.equipped) {
                await updateArmorDR(item.parent, item);
            } else {
                await removeArmorEffect(item.parent, item);
            }
        }

        if (isWeaponItem) {
            if (changes.system.equipped) {
                // console.log('Updating weapon initiative modifier');
                await updateWeaponInitiativeModifier(item.parent, item);
            } else {
                // console.log('Removing weapon initiative modifier');
                await removeWeaponInitiativeModifier(item.parent, item);
            }
        }
    }
});
