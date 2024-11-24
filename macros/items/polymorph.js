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

    const selectedForm = await chrisPremades.utils.dialogUtils.selectDocumentDialog(workflow.item.name, 'Select Polymorph Form', validForms);
    if (!selectedForm) return false;

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
                "onDelete": {
                    "script": `ui.notifications.warn('Reverting Polymorph'); actor.revertOriginalForm({renderSheet: true});`
                }
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: polymorphTarget.actor.uuid, effects: [effectData]});
}
