if(!macroItem.system.equipped) {
    ui.notifications.warn("You need to equip your lightsource");
    return;
}

let lightSource = macroItem.name.toLowerCase();
let file = macroItem.img.toString();
let torchStatus = actor.appliedEffects.find(e => e.name === macroItem.name);

async function updateTorch() {
    if (args[0].macroPass === "preApplyDynamicEffects") {
        if(torchStatus !== undefined) {
            ui.notifications.warn("You already are carrying a burning torch");
        } else if (macroItem.system.quantity > 0 && macroItem.system.uses.value > 0) {
            await showTorchLightDialog();
        }
        else {
            ui.notifications.warn("You do not have any torches remaining.")
        }
    }
}

async function showTorchLightDialog() {
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Torch' },
        content: `
        <div class="gps-dialog-container">
            <div class="gps-dialog-section">
                <div class="gps-dialog-content">
                    <div>
                        <div class="gps-dialog-flex">
                            <p class="gps-dialog-paragraph">Would you like to light a torch?</p>
                            <div id="image-container" class="gps-dialog-image-container">
                                <img src="${macroItem.img}" class="gps-dialog-image">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
        buttons: [{
            action: "Light",
            label: "Light",
            callback: async (event, button, dialog) => {
                await lightNewTorch();
            }
        }],
        close: async (event, dialog) => {
            return;
        }, rejectClose:false
    });
}

async function lightNewTorch() {
    let effectData = chrisPremades.utils.effectUtils.getSidebarEffectData("Torch");
    await chrisPremades.utils.effectUtils.createEffect(actor, effectData);
    if (macroItem.system.quantity > 1) {
        let remainingQuantity = macroItem.system.quantity - 1;
        await macroItem.update({ "system.quantity": remainingQuantity });
    } else if (macroItem.system.quantity <= 1) {
        await actor.deleteEmbeddedDocuments("Item", [macroItem.id]);
    }
}

updateTorch();