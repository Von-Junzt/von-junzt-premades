/**
 * This script is used to attach/detach the summoned driftglobe's token to the actor's token.
 */

const driftglobe = {
    async toggleAttachment(workflow){
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
    },
    async moveToToken(workflow) {
      // TODO:  If you move more than 60 feet from the hovering globe, it follows you until it is within 60 feet of you. It takes the shortest route to do so. If prevented from moving, the globe sinks gently to the ground and becomes inactive, and its light winks out.
    }
}

