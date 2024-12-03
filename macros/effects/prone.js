/**
 * This macro will adjust the token height to 1 and store the current height on creation of the effect and restore it on removal.
 * Dependencies: Levels Autocover, Wall Height, DAE, Effect Macro
 */

// onCreation
if(token.document.flags?.levelsautocover?.ducking) {
    await token.document.update({"flags.levelsautocover.ducking": false});
}
if (token.document?.flags["wall-height"]?.tokenHeight) {
    await token.document.update({"flags.storedTokenHeight": token.document.flags["wall-height"].tokenHeight});
}
await token.setVerticalHeight(1);

// onDeletion
const storedHeight = token.document.flags.storedTokenHeight;
if (storedHeight) {
    await token.setVerticalHeight(storedHeight);
}
