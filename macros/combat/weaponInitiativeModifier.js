/**
 * Weapon Initiative Modifier System
 * Manages dynamic initiative adjustments based on equipped weapon types.
 * Heavier weapons reduce initiative while lighter weapons improve it.
 *
 * Key features:
 * - Automatic updates on weapon equip/unequip
 * - Handles single and dual-wielding scenarios
 * - Uses debounced updates to prevent race conditions, when multiple updates are triggered rapidly
 * - Integrates with MidiQOL for effect management
 */

/**
 * Time in milliseconds to wait before executing debounced functions
 * @type {number}
 */
const DEBOUNCE_WAIT_MS = 100;

/**
 * Initiative modifiers for different weapon types
 * This scale follows these principles:
 * 0: Lightest weapons requiring minimal effort to wield (dagger, dart, whip, blowgun)
 * -1: Light weapons that maintain good maneuverability
 * -2: Medium weapons requiring more deliberate handling
 * -3: Heavy two-handed weapons that impact mobility
 * -4: Heaviest weapons that significantly impede quick actions
 * Each weapon's modifier reflects its:
 * Weight and bulk
 * Handling requirements
 * Historical use in combat
 * Mechanical complexity (for ranged weapons)
 */
const WEAPON_MODIFIERS = {
    // Simple Melee
    'club': -1,            // Light, one-handed
    'dagger': 0,           // Fastest weapon, perfect for quick strikes
    'greatclub': -3,       // Two-handed, unwieldy
    'handaxe': -1,         // Light throwing weapon
    'javelin': -1,         // Balanced throwing weapon
    'lighthammer': -1,     // Light throwing weapon
    'mace': -2,           // Medium weight, one-handed
    'quarterstaff': -2,    // Versatile, balanced
    'sickle': -1,         // Light curved blade
    'spear': -2,          // Versatile, balanced

    // Simple Ranged
    'lightcrossbow': -2,   // Mechanical weapon, some setup time
    'dart': 0,            // Fastest ranged weapon
    'shortbow': -1,       // Light bow
    'sling': -1,          // Light projectile weapon

    // Martial Melee
    'battleaxe': -2,      // Medium weight, versatile
    'flail': -2,          // Medium weight, chain weapon
    'glaive': -3,         // Heavy reach weapon
    'greataxe': -4,       // Heaviest category
    'greatsword': -3,     // Heavy two-handed
    'halberd': -3,        // Heavy reach weapon
    'lance': -4,          // Heaviest category, special
    'longsword': -2,      // Medium weight, versatile
    'maul': -4,           // Heaviest category
    'morningstar': -3,    // Heavy spiked weapon
    'pike': -3,           // Heavy reach weapon
    'rapier': -1,         // Light thrusting sword
    'scimitar': -1,       // Light curved sword
    'shortsword': -1,     // Light sword
    'trident': -2,        // Medium weight, versatile
    'warpick': -2,        // Medium weight, one-handed
    'warhammer': -2,      // Medium weight, versatile
    'whip': 0,            // Very light, flexible

    // Martial Ranged
    'blowgun': 0,         // Lightest ranged weapon
    'handcrossbow': -1,   // Light mechanical weapon
    'heavycrossbow': -4,  // Heaviest ranged weapon
    'longbow': -3,        // Heavy bow
    'net': -2            // Special throwing weapon
};
/**
 * Debounce function to limit function calls
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds
 * @returns {(function(...[*]): void)|*}
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Finds all equipped weapons on an actor
 * @param {Actor} actor - The actor to check for weapons
 * @returns {Array<Item>} Array of equipped weapon items
 */
async function findWeapons(actor) {
    const equippedWeapons = await actor.items.filter(i =>
        i.type === "weapon" &&
        i.system.equipped
    );
    // console.log(actor);
    // console.log('findWeapon result:', equippedWeapons);
    return equippedWeapons;
}

/**
 * Sets the initiative modifier effect keys to 0, if no weapon is equipped
 * @param {Actor} actor - The actor to remove the effect from
 * @param {Item} item - The weapon item that was unequipped
 */
export const removeWeaponInitiativeModifier = debounce(async (actor, item) => {
    let equippedWeapons = await findWeapons(actor);
    // console.log('Removing unequipped weapon item:', item);
    equippedWeapons = await equippedWeapons.filter(weapon => weapon.id !== item.id);
    if(equippedWeapons.length > 0) {
        // console.log('Actor still has weapons equipped:', equippedWeapons);
        await updateWeaponInitiativeModifier(actor, undefined, equippedWeapons);
    } else {
        console.log('Actor has no weapons equipped, setting modifier to 0');
        const existingEffect = weaponInitiativeModifierExists(actor);
        if (existingEffect) {
            const effectData = {
                name: "Weapon Initiative Modifier",
                icon: item.img,
                changes: [{
                    key: "system.attributes.init.bonus",
                    mode: 2,
                    value: 0,
                    priority: 20
                }],
                flags: {
                    "chris-premades": {
                        "noAnimation": true,
                        "conditions": []
                    }
                }
            };

           console.log("Effect exists, updating effect");
           await MidiQOL.socket().executeAsGM("updateEffects", {
               actorUuid: actor.uuid,
               updates: [{
                   _id: existingEffect.id,
                   ...effectData
               }]
           });
       } else {
            console.log("Effect does not exist, don't need to do anything.");
        }
    }
}, DEBOUNCE_WAIT_MS);

/**
 * Updates the initiative modifier effect on an actor based on their equipped weapons
 * @param {Actor} actor - The actor to update the effect for
 * @param {Item} item - The weapon item that has changes
 * @param {Array<Item>} weaponArray - The array of weapon items to consider
 */
export const updateWeaponInitiativeModifier = debounce(async (actor, item, weaponArray) => {
    let finalModifier;
    let equippedWeapons = weaponArray || await findWeapons(actor);

    // add item if not undefined or already equipped
    if (item && !equippedWeapons.some(weapon => weapon.id === item.id)) {
        // console.log('Changed weapon item: ', item);
        equippedWeapons = [...equippedWeapons, item];
    }
    // console.log('updateWeaponInitiativeModifier equippedWeapons:', equippedWeapons);

    if (equippedWeapons.length > 1) {
        // Find the worst (lowest) modifier among equipped weapons
        finalModifier = equippedWeapons.reduce((worstMod, weapon) => {
            const modifier = WEAPON_MODIFIERS[weapon.system.type.baseItem] ?? 0;
            console.log(`Dual-wield: ${weapon.name} (${weapon.system.type.baseItem}) -> ${modifier}`);
            return Math.min(worstMod, modifier);
        }, Infinity);
        console.log(`Final dual-wield worst modifier: ${finalModifier}`);
    } else {
        finalModifier = WEAPON_MODIFIERS[equippedWeapons[0].system.type.baseItem] ?? 0;
        console.log(`Single weapon: ${equippedWeapons[0].name} (${equippedWeapons[0].system.type.baseItem}) -> ${finalModifier}`);
    }

    // Create effect data with weapon initiative modifier, uses mode 2 for additive stacking
    const effectData = {
        name: "Weapon Initiative Modifier",
        icon: equippedWeapons[0].img,
        changes: [{
            key: "system.attributes.init.bonus",
            mode: 2,
            value: finalModifier.toString(),
            priority: 20
        }]
    };

    const existingEffect = weaponInitiativeModifierExists(actor);
    if (existingEffect) {
        console.log("Effect exists, updating effect");
        await MidiQOL.socket().executeAsGM("updateEffects", {
            actorUuid: actor.uuid,
            updates: [{
                _id: existingEffect.id,
                ...effectData
            }]
        });
    } else {
        console.log("No effect exists, creating new effect");
        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: actor.uuid,
            effects: [effectData]
        });
    }
}, DEBOUNCE_WAIT_MS);

/**
 * Checks if the actor has a weapon initiative modifier effect
 * @param actor
 * @returns {effect|null}
 */
function weaponInitiativeModifierExists(actor) {
    const effects = actor.effects;
    const existingEffect = effects.find(e => e.name === "Weapon Initiative Modifier");
    // console.log('Existing effect:', existingEffect);
    return existingEffect || null;
}
