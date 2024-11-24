if (args[0].macroPass === 'preTargetSave') {

    if (!macroItem.flags.homebrew.effectAvailable || !workflow.item.name.toLowerCase().includes('breath')) return;

    let effectData = [{
        "name": "Wyrm's Ward",
        "icon": "icons/skills/melee/shield-block-fire-orange.webp",
        "origin": macroItem.uuid,
        "disabled": false,
        "changes": [{
            "key": "flags.midi-qol.advantage.ability.save.all",
            "mode": 2,
            "value": "1",
            "priority": 20
        }],
        "flags": {
            "dae": {
                "specialDuration": ["isSave"]
            }
        },
        "transfer": false
    }];

    // { dialogTitle, dialogContent, dialogId, initialTimeLeft, validTokenPrimaryUuid, source, type
    let initialTimeLeft = 15; //Input the time in seconds that the user will have to decide
    let dialogId = "wyrmbane"; //Input your item name with no spaces and no capitalization. Basically this just needs to be something unique to this automation
    const dialogTitlePrimary = `${actor.name} | ${macroItem.name}`; //The dialog the player will see
    const dialogTitleGM = `Waiting for ${actor.name}'s selection | ${macroItem.name}`; //The dialog the gm will see, if Mirror Dialog enabled
    let actorUuid = actor.uuid; //leave as-is
    let dialogContent = `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px; background-color: transparent; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="flex-grow: 1; margin-right: 20px;">
            <p>You have been damaged, would you like to use ${macroItem.name} to gain advantage on the next saving throw?</p>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; padding-left: 20px; border-left: 1px solid #ccc; text-align: center;">
            <p><b>Time Remaining</b></p>
            <p><span id="countdown" style="font-size: 16px; color: red;">${initialTimeLeft}</span> seconds</p>
            <button id="pauseButton_${dialogId}" type="button" class="gps-dialog-button">
                        <i class="fas fa-pause" id="pauseIcon_${dialogId}" style="margin-right: 5px;"></i>Pause
            </button>
        </div>
    </div>
    `; //Build your dialog, note that the pauseButton button and countdown span work with my module, do not remove them or something bad may happen

    let result; //leave as-is
    let browserUser = MidiQOL.playerForActor(actor); //leave as-is
    if (!browserUser.active) {
        browserUser = game.users?.activeGM;
    }

    if (MidiQOL.safeGetGameSetting('gambits-premades', 'Mirror 3rd Party Dialog for GMs') && browserUser.id !== game.users?.activeGM.id) {
        let userDialogPromise = game.gps.socket.executeAsUser("process3rdPartyReactionDialog", browserUser.id, {dialogTitle:dialogTitlePrimary,dialogContent,dialogId,initialTimeLeft,validTokenPrimaryUuid:macroItem.uuid, source: "user", type: "multiDialog"}); //If mirror dialog enabled, this is the users dialog
        let gmDialogPromise = game.gps.socket.executeAsGM("process3rdPartyReactionDialog", {dialogTitle:dialogTitleGM,dialogContent,dialogId,initialTimeLeft,validTokenPrimaryUuid:macroItem.uuid, source: "gm", type: "multiDialog"}); //If mirror dialog enabled, this is the gms dialog
        result = await game.gps.socket.executeAsGM("handleDialogPromises", userDialogPromise, gmDialogPromise);
    } else {
        result = await game.gps.socket.executeAsUser("process3rdPartyReactionDialog", browserUser.id, {dialogTitle:dialogTitlePrimary,dialogContent,initialTimeLeft,validTokenPrimaryUuid:macroItem.uuid, source: browserUser.isGM ? "gm" : "user", type: "singleDialog"}); //Dialog if no Mirror Dialog enabled
    }

    const { userDecision, source, type } = result;

    if (!userDecision) {
        if(source === "user" && type === "multiDialog") await game.gps.socket.executeAsGM("closeDialogById", { dialogId: dialogId }); //These handle Mirror Dialog stuff, leave it!
        if(source === "gm" && type === "multiDialog") await game.gps.socket.executeAsUser("closeDialogById", browserUser.id, { dialogId: dialogId }); //These handle Mirror Dialog stuff, leave it!
        return; //Return if user selected no or timed out, etc
    }
    else if (userDecision) {
        // Sweet success, do whatever you want!
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: effectData });
        await macroItem.update({"flags.homebrew.effectAvailable" : false});
        Hooks.once("", rechargeItem);
    }
}