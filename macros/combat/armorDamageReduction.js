// Constants for level multipliers
const LEVEL_MULTIPLIERS = {
    '1-4': 0.15,
    '5-8': 0.35,
    '9-12': 0.55,
    '13-16': 0.75,
    '17-20': 1
};

// Armor type modifiers
const ARMOR_MODIFIERS = {
    // Light Armor
    'padded': {
        slashing: 0.85,
        piercing: 0.5,
        bludgeoning: 1.25
    },
    'leather': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 0.85
    },
    'studded': {
        slashing: 1.1,
        piercing: 0.85,
        bludgeoning: 0.75
    },

    // Medium Armor
    'hide': {
        slashing: 1.1,
        piercing: 0.85,
        bludgeoning: 1.1
    },
    'chain shirt': {
        slashing: 1.25,
        piercing: 0.75,
        bludgeoning: 0.85
    },
    'scale': {
        slashing: 1,
        piercing: 1.25,
        bludgeoning: 0.75
    },
    'breastplate': {
        slashing: 1,
        piercing: 1.25,
        bludgeoning: 1
    },
    'half plate': {
        slashing: 1.15,
        piercing: 1.15,
        bludgeoning: 1
    },

    // Heavy Armor
    'ring': {
        slashing: 1.25,
        piercing: 0.75,
        bludgeoning: 0.85
    },
    'chain': {
        slashing: 1.25,
        piercing: 0.75,
        bludgeoning: 1
    },
    'splint': {
        slashing: 1,
        piercing: 0.75,
        bludgeoning: 1.25
    },
    'plate': {
        slashing: 1.25,
        piercing: 1.25,
        bludgeoning: 1
    }
};

export async function removeArmorEffect(actor, item) {
    const effects = actor.effects;
    const existingEffect = effects.find(e => e.name === "Armor Damage Reduction");
    if (existingEffect) {
        const effectData = {
            name: "Armor Damage Reduction",
            icon: item.img,
            changes: [
                {
                    key: "system.traits.dm.amount.slashing",
                    mode: 2,
                    value: 0
                },
                {
                    key: "system.traits.dm.amount.piercing",
                    mode: 2,
                    value: 0
                },
                {
                    key: "system.traits.dm.amount.bludgeoning",
                    mode: 2,
                    value: 0
                }
            ]
        };

        console.log("Armor damage reduction effect exists, updating effect");
        await MidiQOL.socket().executeAsGM("updateEffects", {
            actorUuid: actor.uuid,
            updates: [{
                _id: existingEffect.id,
                ...effectData
            }]
        });
    } else {
        console.log('No armor damage reduction effect found, no need to do anything.');
    }
}

export async function updateArmorDR(actor, item) {
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
        icon: item.img,
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
        ],
        flags: {
            "chris-premades": {
                "noAnimation": true,
                "conditions": []
            }
        }
    };

    const existingEffect = actor.effects.find(e => e.name === "Armor Damage Reduction");
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
}

function getLevelMultiplier(level) {
    if (level > 16) return LEVEL_MULTIPLIERS['17-20'];
    if (level > 12) return LEVEL_MULTIPLIERS['13-16'];
    if (level > 8) return LEVEL_MULTIPLIERS['9-12'];
    if (level > 4) return LEVEL_MULTIPLIERS['5-8'];
    return LEVEL_MULTIPLIERS['1-4'];
}

function getArmorType(armor) {
    // Get exact baseItem match first
    const baseItem = armor.system?.type?.baseItem?.toLowerCase() || '';
    if (ARMOR_MODIFIERS[baseItem]) {
        return baseItem;
    }

    // Fallback to name matching if needed
    const name = armor.name.toLowerCase();
    // Check exact matches first
    for (const type of Object.keys(ARMOR_MODIFIERS)) {
        if (name === type) return type;
    }

    // Then check partial matches
    for (const type of Object.keys(ARMOR_MODIFIERS)) {
        if (name.includes(type)) return type;
    }

    return null;
}

async function refreshAllArmorDR() {
    for (let actor of game.actors) {
        const armor = actor.system.attributes.ac.equippedArmor;
        if(armor) {
            await updateArmorDR(actor, armor);
        }
    }
}
