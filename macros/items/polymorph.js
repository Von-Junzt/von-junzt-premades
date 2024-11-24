if (args[0].macroPass === "postSave") {
    if(!workflow.failedSaves.size) {
        return false;
    }
    const polymorphFolder = game.folders.getName("Polymorphs");
    if (!polymorphFolder?.contents.length) {
        ui.notifications.warn("Please create a 'Polymorphs' folder with creature actors");
        return false;
    }

    const polymorphTarget = Array.from(workflow.targets).shift();
    console.log(polymorphTarget);
    if (!polymorphTarget) {
        ui.notifications.warn("No target selected");
        return false;
    }

    if (polymorphTarget.actor.system.details.type.subtype === 'Shapechanger' || polymorphTarget.actor.system.attributes.hp.value === 0) {
        ui.notifications.warn("Target is already polymorphed, a shapeshifter or dead");
        return false;
    }

    const maxCR = args[0].spellLevel || args[0].item.system.level;

    const validForms = polymorphFolder.contents.filter(actor => actor.system.details.cr <= maxCR);
    if (!validForms.length) {
        ui.notifications.warn("No valid forms found");
        return false;
    }

    const formChoices = validForms.map(a => [a.id, a.name]);
    const selectedFormId = await Dialog.prompt({
        title: "Select New Form",
        content: `
            <div class="form-group">
                <select id="form-select">
                    ${formChoices.map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}
                </select>
            </div>
        `,
        callback: (html) => html.find('#form-select').val()
    });
    if (!selectedFormId) {
        return false;
    }
    const selectedForm = validForms.find(a => a.id === selectedFormId);

    portal = new Portal();
    portal.size(60);
    portal.origin(polymorphTarget);
    portal.addCreature(selectedForm);
    await portal.transform();

    const effectData = {
        "name": "Polymorph",
        "icon": "icons/magic/control/energy-stream-link-spiral-teal.webp",
        "duration": {
            "seconds": 3600
        },
        "flags": {
            "effectmacro": {
                "onDelete": "if(actor.isPolymorphed) {ui.notifications.warn('Reverting Polymorph'); actor.revertOriginalForm({renderSheet: true})};",
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: polymorphTarget.actor.uuid, effects: [effectData]});
}
