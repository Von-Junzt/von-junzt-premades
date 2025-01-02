/**
 * This script is used to attach/detach the summoned driftglobe's token to the actor's token.
 */

// Get the driftglobe's token
let driftglobeEffect = actor.effects.find(e => e.name === "Summon: Driftglobe");
if (!driftglobeEffect) {
    console.log("Driftglobe effect not found");
    return;
};
let driftglobeUuid = driftglobeEffect.flags?.dnd5e?.dependents[0]?.uuid;
let driftglobeToken = await fromUuid(driftglobeUuid);

// check if the driftglobe's token is already attached to the actor's token, if not, attach it
console.log(driftglobeToken);
let driftGLobeAttachedFlag = driftglobeToken.getFlag('token-attacher', 'parent');
if (!driftGLobeAttachedFlag) {
    ui.notifications.info("Attaching Driftglobe to player.");
    await tokenAttacher.attachElementToToken(driftglobeToken, token, true);
} else {
    ui.notifications.warn("Removing Driftglobe token attachment.");
    await tokenAttacher.detachElementFromToken(driftglobeToken.object, token, true);
}