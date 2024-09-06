if(!macroItem.system.equipped) {
    ui.notifications.warn("You need to equip your lightsource");
    return;
}

let questionText = "";
let contentText = "";
let lanternStatus = actor.effects.find(e => e.name === macroItem.name)?.disabled;

function generateContentText(questionText) {
    return `
        <div class="gps-dialog-container">
            <div class="gps-dialog-section">
                <div class="gps-dialog-content">
                    <div>
                        <div class="gps-dialog-flex">
                            <p class="gps-dialog-paragraph">` + questionText + `</p>
                            <div id="image-container" class="gps-dialog-image-container">
                                <img src="${macroItem.img}" class="gps-dialog-image">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function updateLantern() {
    if (args[0].macroPass === "preApplyDynamicEffects") {
        if (lanternStatus !== undefined) {
            questionText = "Would you like to turn your lantern on or off?";
            contentText = generateContentText(questionText);
            await showLanternDialog("Toggle Lantern", "Turn on/off", toggleLantern);
        } else if (macroItem.system.uses.value > 0) {
            questionText = "Would you like to light your lantern?";
            contentText = generateContentText(questionText);
            await showLanternDialog("Light Lantern", "Light", lightLantern);
        } else {
            questionText = "Would you like to refill your lantern?";
            contentText = generateContentText(questionText);
            await showLanternDialog("Refill Lantern", "Refill", refillLantern);
        }
    }
}

async function showLanternDialog(title, buttonLabel, callback) {
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Lantern' },
        content: contentText,
        buttons: [{
            action: title,
            label: buttonLabel,
            callback: async (event, button, dialog) => {
                await callback();
            }
        }],
        close: async (event, dialog) => {
            return;
        },
        rejectClose: false
    });
}

async function lightLantern() {

    let effectData = chrisPremades.utils.effectUtils.getSidebarEffectData(macroItem.name);
    await chrisPremades.utils.effectUtils.createEffect(actor, effectData);
    let remainingUses = macroItem.system.uses.value - 1;
    await macroItem.update({ "system.uses.value": remainingUses });

}

async function refillLantern() {
    if(actor.items.find(i => i.name === "Oil Flask")) {
        let oilFlask = actor.items.find(i => i.name === "Oil Flask");
        let oilFlasksOwned = oilFlask.system.quantity;
        let remainingOilFlasks = oilFlasksOwned - 1;
        let remainingLanternUses = macroItem.system.uses.value + 1;
        if(oilFlasksOwned > 0) {
            await oilFlask.update({ "system.quantity": remainingOilFlasks });
            await macroItem.update({ "system.uses.value": remainingLanternUses });
            (remainingOilFlasks === 0) ? oilFlask.delete() : null;
            ui.notifications.info("You have refilled your lantern.");
        }
    }  else {
        ui.notifications.warn("You do not have any oil left.");
    }
}

async function toggleLantern() {
    let lanternEffect = actor.effects.find(e => e.name === macroItem.name);
    if(lanternEffect.disabled) {
        await lanternEffect.update({ disabled: false });
        ui.notifications.info("You have turned on your lantern.");
    } else {
        await lanternEffect.update({ disabled: true });
        ui.notifications.info("You have turned off your lantern.");
    }
}

updateLantern();