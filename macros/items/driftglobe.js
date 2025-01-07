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
    async moveAndAttach(workflow) {
        let driftglobeEffect = actor.effects.find(e => e.name === "Summon: Driftglobe");
        if (!driftglobeEffect) return;

        let driftglobeUuid = driftglobeEffect.flags?.dnd5e?.dependents[0]?.uuid;
        let driftglobeToken = await fromUuid(driftglobeUuid);

        const gridSize = canvas.grid.size;
        const startX = driftglobeToken.x;
        const startY = driftglobeToken.y;

        // Calculate distances for both axes
        const xDiff = Math.abs(token.x - startX);
        const yDiff = Math.abs(token.y - startY);

        let targetX = token.x;
        let targetY = token.y;

        // Determine which axis had the greater movement
        if (xDiff > yDiff) {
            // Horizontal movement dominates
            targetX = startX < token.x ? token.x - gridSize : token.x + gridSize;
            targetY = token.y;
        } else {
            // Vertical movement dominates
            targetX = token.x;
            targetY = startY < token.y ? token.y - gridSize : token.y + gridSize;
        }

        await MidiQOL.moveToken(
            driftglobeToken,
            { x: targetX, y: targetY },
            true
        );

        let driftGLobeAttachedFlag = driftglobeToken.getFlag('token-attacher', 'parent');
        if (!driftGLobeAttachedFlag) {
            await tokenAttacher.attachElementToToken(driftglobeToken, token, true);
            ui.notifications.info("Driftglobe attached to player.");
        }
    }
}

