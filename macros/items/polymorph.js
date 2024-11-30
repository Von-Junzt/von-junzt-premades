/**
 * This macro is used to polymorph a creature. It should be used in the polymorph spell/items Midi-QoL itemmacro settings
 * "After Checking Saves".
 * Dependencies aside from Midi-QoL: Ripper93's Portal lib, Cauldron of Plentiful Resources, Effect Macro
 */

if (args[0].macroPass === "postSave") {
    if(!workflow.failedSaves.size) {
        return;
    }

    // Change name to match your folder name, if you want to use a different folder
    const polymorphFolder = game.folders.getName("Polymorph");
    if (!polymorphFolder?.contents.length) {
        ui.notifications.warn("Please create a 'Polymorph' folder with creature actors.");
        return;
    }

    const polymorphTarget = Array.from(workflow.targets).shift();
    if (!polymorphTarget) {
        ui.notifications.warn("No target selected.");
        return;
    }

    if (polymorphTarget.actor.system.details.type.subtype === 'Shapechanger' || polymorphTarget.actor.system.attributes.hp.value === 0) {
        ui.notifications.warn("Target is already polymorphed, shapeshifter or dead.");
        return;
    }

    const maxCR = args[0].spellLevel || args[0].item.system.level;
    const validForms = polymorphFolder.contents.filter(actor => actor.system.details.cr <= maxCR);

    if (!validForms.length) {
        ui.notifications.warn("No valid forms found.");
        return;
    }

    const selectedForm = await chrisPremades.utils.dialogUtils.selectDocumentDialog(item.name, 'Select Polymorph Form', validForms);
    if (!selectedForm) {
        ui.notifications.warn("No form selected.");
        return;
    }

    portal = new Portal();
    portal.size(item.system?.range?.value || 60);
    portal.origin(polymorphTarget);
    portal.addCreature(selectedForm);
    await portal.transform({ skipSheetRender: true });

    const effectData = {
        "name": "Polymorphed",
        "icon": item.img,
        "description": item.system.description?.value,
        "duration": {
            "seconds": 3600
        },
        "flags": {
            "effectmacro": {
                "onDelete": {
                    "script": `portal = new Portal(); portal.origin(actor.token); portal.transform({ skipSheetRender: true });`
                }
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: polymorphTarget.actor.uuid,
        effects: [effectData]
    });
}
