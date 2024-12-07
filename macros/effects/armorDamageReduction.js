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
        slashing: 1,
        piercing: 1.5,
        bludgeoning: 0.75
    },
    'chain': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 1
    },
    'scale': {
        slashing: 1.25,
        piercing: 1,
        bludgeoning: 0.75
    },
    'leather': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 1
    }
};

export async function updateArmorDR(actor, item) {
    // if not gm, return
    if (!game.user.isGM) return;

    // If there is an existing DR effect, delete it
    const existingEffect = actor.effects.filter(e => e.name === "Armor Damage Reduction")[0];
    if (existingEffect) {
        MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: actor.uuid,
            effects: [existingEffect.id]
        })
    }

    // Calculate base DR using actor's AC
    const level = actor.system.details.level || 1;
    const multiplier = getLevelMultiplier(level);

    // Get armor type modifiers
    const armorType = getArmorType(item);
    const modifiers = ARMOR_MODIFIERS[armorType] || {slashing: 1, piercing: 1, bludgeoning: 1};

    // Debug output
    console.log({
        detectedArmorType: armorType,
        appliedModifiers: modifiers
    });

    // Create effect
    const effectData = {
        name: "Armor Damage Reduction",
        icon: "icons/equipment/chest/breastplate-cuirass-steel-blue.webp",
        changes: [
            {
                key: "system.traits.dm.amount.slashing",
                mode: 2,
                value: `-(floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.slashing}))`
            },
            {
                key: "system.traits.dm.amount.piercing",
                mode: 2,
                value: `-(floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.piercing}))`
            },
            {
                key: "system.traits.dm.amount.bludgeoning",
                mode: 2,
                value: `-(floor(((@attributes.ac.value - 10) * ${multiplier}) * ${modifiers.bludgeoning}))`
            }
        ]
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actor.uuid,
        effects: [effectData]
    });
}

function getLevelMultiplier(level) {
    if (level <= 4) return LEVEL_MULTIPLIERS['1-4'];
    if (level <= 8) return LEVEL_MULTIPLIERS['5-8'];
    if (level <= 12) return LEVEL_MULTIPLIERS['9-12'];
    if (level <= 16) return LEVEL_MULTIPLIERS['13-16'];
    return LEVEL_MULTIPLIERS['17-20'];
}

function getArmorType(armor) {
    const armorTypes = ['plate', 'chain', 'scale', 'leather'];
    const name = armor.name.toLowerCase();
    const baseItem = armor.system?.type?.baseItem?.toLowerCase();

    // Debugging output
    console.log({
        armorName: name,
        baseItem: baseItem,
        matchedType: armorTypes.find(type => name.includes(type) || baseItem?.includes(type))
    });

    // Check both name and baseItem
    return armorTypes.find(type =>
        name.includes(type) || baseItem?.includes(type)
    ) || null;
}
