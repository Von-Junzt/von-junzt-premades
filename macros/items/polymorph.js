/**
 * This macro is used to polymorph a creature it should be used in the polymorph spell/item effectmacro "After Checking Saves"
 * Dependencies aside from Midi-QoL are: Ripper93's Portal lib, Cauldron of Plentiful Ressources
 */

if (args[0].macroPass === "postSave") {
    if(!workflow.failedSaves.size) {
        return false;
    }

    // Change name to match your folder name, if you want to use a different folder
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
    if (!selectedForm) {
        ui.notifications.warn("No form selected");
        return false;
    }

    portal = new Portal();
    portal.size(60);
    portal.origin(polymorphTarget);
    portal.addCreature(selectedForm);
    await portal.transform();

    // TODO: Add sequencer animation: Smokepuff and sound effect when adding or removing polymorph effect
    const effectData = {
        "name": "Polymorphed",
        "icon": "icons/magic/control/energy-stream-link-spiral-teal.webp",
        "description": "<p>The target creature is polymorphed into another form. The transformation lasts for the duration," +
            " or until the target drops to 0 hit points or dies.</br></br> The target assumes the hit points of its new form. When it" +
            " reverts to its normal form, the creature returns to the number of hit points it had before it transformed. If it" +
            " reverts as a result of dropping to 0 hit points, any excess damage carries over to its normal form. As long" +
            " as the excess damage doesn't reduce the creature's normal form to 0 hit points, it isn't knocked unconscious." +
            "</br></br>The creature is limited in the actions it can perform by the nature of its new form, and it can't speak," +
            " cast spells, or take any other action that requires hands or speech.</p>",
        "duration": {
            "seconds": 3600
        },
        "flags": {
            "effectmacro": {
                "onDelete": {
                    "script": `ui.notifications.warn('Reverting Polymorph'); portal = new Portal(); portal.origin(actor.token); portal.transform();`
                }
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: polymorphTarget.actor.uuid, effects: [effectData]});
}
