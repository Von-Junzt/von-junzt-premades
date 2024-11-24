if (args[0].macroPass === "postSave") {
    if(!workflow.failedSaves.size) {
        return;
    }
    const polymorphFolder = game.folders.getName("Polymorphs");
    if (!polymorphFolder?.contents.length) {
        ui.notifications.warn("Please create a 'Polymorphs' folder with creature actors");
        return;
    }

    const polymorphTarget = Array.from(workflow.targets).shift();
    if (!polymorphTarget) {
        ui.notifications.warn("No target selected");
        return;
    }

    const maxCR = args[0].spellLevel || args[0].item.system.level;

    const validForms = polymorphFolder.contents.filter(actor => actor.system.details.cr <= maxCR);
    if (!validForms.length) {
        ui.notifications.warn("No valid forms found");
        return;
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
    if (!selectedFormId) return;

    const selectedForm = validForms.find(a => a.id === selectedFormId);

    portal = new Portal();
    portal.size(60);
    portal.origin(polymorphTarget);
    portal.addCreature(selectedForm);
    await portal.transform();

    const effect = {
        label: "Polymorph",
        icon: "icons/magic/control/energy-stream-link-spiral-teal.webp",
        duration: {
            seconds: 3600
        },
        flags: {
            "midi-qol": {
                polymorphed: true
            },
            "dae": {
                specialDuration: ["turnEndSource"],
                macroRepeat: "end",
                macro: [{
                    ondelete: "token.actor.revertOriginalForm({renderSheet: true});", //TODO CHECK IF THIS WORKS
                    name: "Revert Polymorph"
                }]
            }
        }
    };

    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: polymorphTarget.uuid, effects: [effect]});
}
