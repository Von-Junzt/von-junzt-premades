/**
 * This script adds a modifier to the actor's initiative based on their used weapon types. The heavier the weapon, the more initiative is deduced.
 */

// Debounce implementation to handle rapid updates
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

// Constants for weapon categories and their initiative modifiers
const WEAPON_MODIFIERS = {
    // Simple Melee
    'club': 1,
    'dagger': 2,
    'greatclub': -1,
    'handaxe': 1,
    'javelin': 0,
    'lighthammer': 1,
    'mace': 0,
    'quarterstaff': 0,
    'sickle': 1,
    'spear': 0,

    // Simple Ranged
    'lightcrossbow': 0,
    'dart': 2,
    'shortbow': 1,
    'sling': 1,

    // Martial Melee
    'battleaxe': 0,
    'flail': 0,
    'glaive': -1,
    'greataxe': -2,
    'greatsword': -1,
    'halberd': -1,
    'lance': -2,
    'longsword': 0,
    'maul': -2,
    'morningstar': -1,
    'pike': -1,
    'rapier': 1,
    'scimitar': 1,
    'shortsword': 1,
    'trident': 0,
    'warpick': 0,
    'warhammer': 0,
    'whip': 1,

    // Martial Ranged
    'blowgun': 2,
    'handcrossbow': 1,
    'heavycrossbow': -2,
    'longbow': -1,
    'net': 0
};

async function findWeapons(actor) {
    const equippedWeapons = await actor.items.filter(i =>
        i.type === "weapon" &&
        i.system.equipped
    );
    // console.log(actor);
    // console.log('findWeapon result:', equippedWeapons);
    return equippedWeapons;
}

export const removeWeaponInitiativeModifier = debounce(async (actor, item) => {
    let equippedWeapons = await findWeapons(actor);
    // console.log('Removing unequipped weapon item:', item);
    equippedWeapons = await equippedWeapons.filter(weapon => weapon.id !== item.id);
    if(equippedWeapons.length > 0) {
        // console.log('Actor still has weapons equipped:', equippedWeapons);
        await updateWeaponInitiativeModifier(actor, undefined, equippedWeapons);
    } else {
        console.log('After removal, actor has no weapons equipped, removing effect');
        const existingEffect = weaponInitiativeModifierExists(actor);
        if (existingEffect) {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: actor.uuid,
                effects: [existingEffect.id]
            });
        }
    }
}, 100);

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
}, 100);

function weaponInitiativeModifierExists(actor) {
    const effects = actor.effects;
    const existingEffect = effects.find(e => e.name === "Weapon Initiative Modifier");
    // console.log('Existing effect:', existingEffect);
    return existingEffect || null;
}
