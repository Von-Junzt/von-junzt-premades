const saveDC = workflow.saveDC;
const saveResult = workflow.saveResults[0][0]._total;
const failedSaves = workflow.failedSaves;

const frightenedEffectData = await chrisPremades.utils.effectUtils.getSidebarEffectData('Frightened');
const paralyzedEffectData = await chrisPremades.utils.effectUtils.getSidebarEffectData('Paralyzed');

if (failedSaves.size > 0) {
    for (let target of failedSaves) {
        // Handle Frightened effect
        const hasFrightenedEffect = target.actor.effects.find(e => e.label === "Frightened");
        if (!hasFrightenedEffect) {
            try {
                await MidiQOL.socket().executeAsGM("createEffects", {
                    actorUuid: target.actor?.uuid,
                    effects: [frightenedEffectData]
                });
            } catch (error) {
                console.log("Frightened effect already exists on target");
            }
        }

        // Handle Paralyzed effect if save failed by 5 or more
        if ((saveDC - saveResult) >= 5) {
            const hasParalyzedEffect = target.actor.effects.find(e => e.label === "Paralyzed");
            if (!hasParalyzedEffect) {
                try {
                    await MidiQOL.socket().executeAsGM("createEffects", {
                        actorUuid: target.actor?.uuid,
                        effects: [paralyzedEffectData]
                    });
                } catch (error) {
                    console.log("Paralyzed effect already exists on target");
                }
            }
        }
    }
}
