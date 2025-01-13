export async function setupAlternatingInitiative(combat) {
    // Sort all combatants by initiative
    let allCombatants = [...combat.combatants].sort((firstCombatant, secondCombatant) => {
        if (secondCombatant.initiative !== firstCombatant.initiative) {
            return secondCombatant.initiative - firstCombatant.initiative;
        }
    });

    // Separate players...
    const players = allCombatants.filter(c => {
        const actor = game.actors.get(c.actorId);
        return actor?.hasPlayerOwner;
    });

    // ...and monsters
    const allMonsters = allCombatants.filter(c => {
        const actor = game.actors.get(c.actorId);
        return !actor?.hasPlayerOwner;
    });

    // Handle tie between first player and first monster only
    if (players[0] && allMonsters[0] && players[0].initiative === allMonsters[0].initiative) {
        const firstPlayer = game.actors.get(players[0].actorId);
        const firstMonster = game.actors.get(allMonsters[0].actorId);
        const playerDex = firstPlayer?.system.abilities.dex.mod || 0;
        const monsterDex = firstMonster?.system.abilities.dex.mod || 0;

        if (monsterDex > playerDex) {
            // Slightly increase monster initiative to go first
            allMonsters[0].initiative += 0.01;
        } else {
            // Slightly increase player initiative to go first
            players[0].initiative += 0.01;
        }
    }


    // Sort monsters by their original initiative
    const sortedMonsters = [...allMonsters].sort((a, b) => b.initiative - a.initiative);
    const updates = [];
    const lastPlayer = players[players.length - 1];

    // Fill gaps between players with exactly one monster each
    for (let i = 0; i < players.length - 1; i++) {
        const currentPlayer = players[i];
        const nextPlayer = players[i + 1];
        const spacing = (currentPlayer.initiative - nextPlayer.initiative);

        // Place one monster in the middle between players
        if (sortedMonsters.length > 0) {
            const monster = sortedMonsters.shift();
            updates.push({
                _id: monster._id,
                initiative: currentPlayer.initiative - (spacing / 2)
            });
        }
    }

    // Place any remaining monsters after the last player
    if (sortedMonsters.length > 0) {
        const spacingAfterLast = 1; // Consistent spacing between remaining monsters
        sortedMonsters.forEach((monster, index) => {
            updates.push({
                _id: monster._id,
                initiative: lastPlayer.initiative - ((index + 1) * spacingAfterLast)
            });
        });
    }

    // Apply all initiative updates
    if (updates.length > 0) {
        await combat.updateEmbeddedDocuments("Combatant", updates);
    }
}
