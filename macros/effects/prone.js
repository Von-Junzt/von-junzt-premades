/**
 * This macro will adjust the token height to 1 and store the current height on creation of the effect and restore it on removal.
 * Dependencies: Levels Autocover, Wall Height, DAE, Effect Macro
 */

// onCreation
if(token.document.flags?.levelsautocover?.ducking) {
    await token.document.update({"flags.levelsautocover.ducking": false});
}

const heightToStore = token.document?.flags["wall-height"]?.tokenHeight ?? WallHeight._defaultTokenHeight;
if (heightToStore != null) {
    await token.document.update({"flags.storedTokenHeight": heightToStore});
    // Verify storage worked
    if (token.document.flags.storedTokenHeight === heightToStore) {
        await token.setVerticalHeight(1);
    } else {
        ui.notifications.error("Failed to store token height");
    }
} else {
    ui.notifications.warn("Could not detect token height");
}

// onDeletion
const storedHeight = token.document.flags.storedTokenHeight;
if (storedHeight) {
    await token.setVerticalHeight(storedHeight);
} else {
    ui.notifications.warn("No stored height found to restore");
}
