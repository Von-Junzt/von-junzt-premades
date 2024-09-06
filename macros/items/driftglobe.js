if(!game.actors.getName('Driftglobe')) {
    ui.notifications.warn("You need to have an actor named Driftglobe in the sidebar in order to use this macro.");
    return;
}

const DRIFTGLOBE_FLAG = "flags.homebrew.driftglobe";
const DRIFTGLOBE_ACTIVATED = `${DRIFTGLOBE_FLAG}.activated`;
const DRIFTGLOBE_UUID = `${DRIFTGLOBE_FLAG}.uuid`;
const LIGHT_EFFECTS = ["Driftglobe (Light)", "Driftglobe (Daylight)"];

// Check if the item has the homebrew flag, if not, add it
if (!macroItem.flags.homebrew?.driftglobe) {
    macroItem.update({ [DRIFTGLOBE_FLAG]: { "activated": false, "uuid": "" } });
}

// Generates the content for the dialog with styling from Gambit's Premades
function generateContentText(questionText) {
    return `
        <div class="gps-dialog-container">
            <div class="gps-dialog-section">
                <div class="gps-dialog-content">
                    <div>
                        <div class="gps-dialog-flex">
                            <p class="gps-dialog-paragraph">${questionText}</p>
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

// Generates the light effect options for the dialog, if showOptions is true
function generateLightEffectOptions(showOptions) {
    if (!showOptions) return '';
    return `
        <div class="gps-dialog-section">
            <label for="light-effect-select">Choose Light:</label>
            <select id="light-effect-select" name="lightEffect">
                ${LIGHT_EFFECTS.map(effect => `<option value="${effect}">${effect}</option>`).join('')}
            </select>
        </div>
    `;
}

// Shows the dialog, allowing the player to choose a light effect
async function showDialog(title, buttonLabel, callback, showOptions) {
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Driftglobe' },
        content: generateContentText(title) + generateLightEffectOptions(showOptions),
        buttons: [{
            action: title,
            label: buttonLabel,
            callback: async (event, button, dialog) => {
                const selectedEffect = showOptions ? document.getElementById('light-effect-select').value : null;
                callback(selectedEffect); // not awaited, so the dialog can close before spawning for better oversight
            }
        }],
        close: async (event, dialog) => {},
        rejectClose: false
    });
}

// Spawns the driftglobe with Ripper83's Portal module, and attaches it to the token
async function createDriftGlobe(selectedEffect) {
    const portal = new Portal();
    portal.addCreature("Driftglobe");
    portal.color("#65c0c9");
    portal.origin(token);
    portal.range(5);
    portal.pick();
    let summonedToken = await portal.spawn();
    let summonedActor = summonedToken[0].actor;
    await applyLightEffect(summonedActor, selectedEffect);
    await summonedToken[0].update({ "sort": 20 });
    await macroItem.update({ [DRIFTGLOBE_FLAG]: { "activated": true, "uuid": summonedToken[0].uuid } });
    await tokenAttacher.attachElementToToken(summonedToken[0], token, true);
}

// Deletes the driftglobe, if it exists
async function deleteDriftGlobe() {
    let driftGlobe = canvas.scene.tokens.find(t => t.uuid === macroItem.flags.homebrew?.driftglobe.uuid);
    if (driftGlobe) {
        await driftGlobe.delete();
    }
}

// Updates the driftglobe, activating or deactivating it
async function updateDriftGlobe() {
    const driftglobeActivated = macroItem.flags.homebrew?.driftglobe.activated;
    const driftglobeExists = canvas.scene.tokens.find(t => t.uuid === macroItem.flags.homebrew?.driftglobe.uuid);

    if (!driftglobeActivated || !driftglobeExists) {
        await showDialog("Activate Driftglobe", "Activate", createDriftGlobe, true);
        await macroItem.update({ [DRIFTGLOBE_ACTIVATED]: true });
    } else {
        await showDialog("Deactivate Driftglobe", "Deactivate", deleteDriftGlobe, false);
        await macroItem.update({ [DRIFTGLOBE_ACTIVATED]: false });
    }
}

// Applies the selected light effect to the actor, if it exists in the CPR Sidebar
async function applyLightEffect(actor, effectName) {
    let effectData = chrisPremades.utils.effectUtils.getSidebarEffectData(effectName);
    if (!effectData) {
        ui.notifications.error(`The effect ${effectName} does not exist in the CPR Sidebar.`);
    } else {
        await chrisPremades.utils.effectUtils.createEffect(actor, effectData);
    }
}

updateDriftGlobe();