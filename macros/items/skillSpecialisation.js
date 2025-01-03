/**
 * This script makes a skill specialisation item that rolls the specialisation roll and displays the result in a chat message.
 */

const message = await fromUuid(workflow.itemCardUuid);
await message.delete()

const SKILL_NAMES = {
    "acr": "Acrobatics",
    "ani": "Animal Handling",
    "arc": "Arcana",
    "ath": "Athletics",
    "dec": "Deception",
    "his": "History",
    "ins": "Insight",
    "itm": "Intimidation",
    "inv": "Investigation",
    "med": "Medicine",
    "nat": "Nature",
    "prc": "Perception",
    "prf": "Performance",
    "per": "Persuasion",
    "rel": "Religion",
    "slt": "Sleight of Hand",
    "ste": "Stealth",
    "sur": "Survival"
};
const ABILITY_NAMES = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma"
};

// change this to the base skill you want to use
let skillAbbreviation = 'prc';

// change this to the bonus you want to use
let skillSpecialisationBonus = 2;

let skillBonusTotal = actor.system.skills[skillAbbreviation].total;
let flavorText = `<strong>${workflow.activity.name}</strong><br>(${SKILL_NAMES[skillAbbreviation]} bonus +${skillBonusTotal}, Specialisation bonus +${skillSpecialisationBonus})`;
let rollData = `1d20 + ${skillBonusTotal} + 2`;
console.log(rollData);
const roll = await new Roll(rollData).evaluate();
await roll.toMessage({
    flavor: flavorText,
    content: 'Using skill specialisation',
    speaker: ChatMessage.getSpeaker(actor),
});