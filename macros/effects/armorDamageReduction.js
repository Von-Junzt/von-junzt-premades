// Constants for level multipliers
const LEVEL_MULTIPLIERS = {
    '1-4': 0.15,
    '5-8': 0.35,
    '9-12': 0.45,
    '13-16': 0.65,
    '17-20': 1
};

// Armor type modifiers
const ARMOR_MODIFIERS = {
    'plate': {
        slashing: 1.25,
        piercing: 1.25,
        bludgeoning: 1
    },
    'splint': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 1.25
    },
    'scale': {
        slashing: 1,
        piercing: 1.25,
        bludgeoning: 0.75
    },
    'chain': {
        slashing: 1.25,
        piercing: 0.75,
        bludgeoning: 1
    },
    'ring': {
        slashing: 1.25,
        piercing: 0.75,
        bludgeoning: 0.85
    },
    'leather': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 0.85
    },
    'padded': {
        slashing: 0.85,
        piercing: 0.5,
        bludgeoning: 1.25
    }
};

async function removeArmorEffect(actor) {
    const effects = actor.effects;
    const existingEffect = effects.find(e => e.name === "Armor Damage Reduction");
    if (existingEffect) {
        await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: actor.uuid,
            effects: [existingEffect.id]
        });
    }
}

export async function removeArmorDR(actor) {
    await removeArmorEffect(actor);
}

export async function updateArmorDR(actor, item) {
    // If there is an existing DR effect, delete it
    await removeArmorEffect(actor);

    // Calculate base DR using actor's AC
    const level = actor.system.details.level || actor.system.details.cr || 1;
    const multiplier = getLevelMultiplier(level);

    // Get armor type modifiers
    const armorType = getArmorType(item);
    const modifiers = ARMOR_MODIFIERS[armorType] || {slashing: 1, piercing: 1, bludgeoning: 1};

    // Debug output
    console.log({
        detectedArmorType: armorType,
        appliedModifiers: modifiers
    });

    // Create effect, make the damage reduction at least 1
    const effectData = {
        name: "Armor Damage Reduction",
        icon: "icons/equipment/chest/breastplate-gorget-steel-purple.webp",
        changes: [
            {
                key: "system.traits.dm.amount.slashing",
                mode: 2,
                value: `-(max(1, floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.slashing})))`
            },
            {
                key: "system.traits.dm.amount.piercing",
                mode: 2,
                value: `-(max(1, floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.piercing})))`
            },
            {
                key: "system.traits.dm.amount.bludgeoning",
                mode: 2,
                value: `-(max(1, floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.bludgeoning})))`
            }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actor.uuid,
        effects: [effectData]
    });
}

function getLevelMultiplier(level) {
    if (level > 16) return LEVEL_MULTIPLIERS['17-20'];
    if (level > 12) return LEVEL_MULTIPLIERS['13-16'];
    if (level > 8) return LEVEL_MULTIPLIERS['9-12'];
    if (level > 4) return LEVEL_MULTIPLIERS['5-8'];
    return LEVEL_MULTIPLIERS['1-4'];
}

function getArmorType(armor) {
    const name = armor.name.toLowerCase();
    const baseItem = armor.system?.type?.baseItem?.toLowerCase() || '';

    // Direct lookup instead of using find()
    for (const type of Object.keys(ARMOR_MODIFIERS)) {
        if (name.includes(type) || baseItem.includes(type)) {
            return type;
        }
    }
    return null;
}

async function refreshAllArmorDR() {
    for (let actor of game.actors) {
        const armor = actor.items.find(i => i.type === "equipment" && i.system.equipped);
        if (armor) {
            await updateArmorDR(actor, armor);
        }
    }
}
