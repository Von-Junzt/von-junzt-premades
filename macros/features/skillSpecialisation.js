/**
 * This script makes a skill specialisation item that rolls the specialisation roll and displays the result in a chat message.
 */

// change this to the base skill you want to use
let skillAbbreviation = 'prc';

// change this to the bonus you want to use
let skillSpecialisationBonus = 2;

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

// get the actor's skill total bonus
let skillBonusTotal = actor.system.skills[skillAbbreviation].total;

// create chat message
flavorText = `<div>${workflow.activity.name} Skill Check</div>`;

/*
let flavorText = `
<div class="dnd5e2 chat-card">
    <div class="description">
        <div style="display: flex; align-items: center; gap: 5px;">
            <header class="summary">
                <img src="${workflow.item.img}" class="gold-icon" style="width: 32px; height: 32px;"/>
                <div class="name-stacked">
                    <span class="title" style="font-size: 14px; font-style: normal">${workflow.activity.name}</span>
                    <span class="subtitle" style="font-size: 10px;font-style: normal">(${SKILL_NAMES[skillAbbreviation]} +${skillBonusTotal}, Specialisation +${skillSpecialisationBonus})</span>
                </div>
            </header>
        </div>
    </div>
</div>`;
*/

// create roll data and roll
let rollData = `1d20 + ${skillBonusTotal} + 2`;
console.log(rollData);
const roll = await new Roll(rollData).evaluate();
await roll.toMessage({
    flavor: flavorText,
    content: 'Using skill specialisation',
    speaker: ChatMessage.getSpeaker(actor),
});