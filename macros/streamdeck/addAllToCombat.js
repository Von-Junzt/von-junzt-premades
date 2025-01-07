/**
 * This script adds all visible tokens to combat. It can be toggled on/off.
 * When toggled on: Creates combat and adds all visible tokens
 * When toggled off: Removes existing combat
 */

if (!game.combat) {
    // If no combat exists, create one and add all tokens
    await Combat.create({scene: canvas.scene.id});

    // Get visible tokens and preserve their original disposition and permissions
    const visibleTokens = [...canvas.tokens.documentCollection.values()]
        .filter(tokenDoc => tokenDoc.visible);

    // Create combatants while maintaining original token settings
    const combatants = visibleTokens.map(tokenDoc => ({
        tokenId: tokenDoc.id,
        actorId: tokenDoc.actorId,
        defeated: false,
        hidden: false,
        // Explicitly preserve token ownership and disposition
        disposition: tokenDoc.disposition,
        flags: {
            // Copy any existing token flags
            ...tokenDoc.flags,
            // Ensure combat-specific flags don't interfere with token control
            core: {
                sourceId: tokenDoc.flags?.core?.sourceId
            }
        }
    }));

    // Create the combatants and activate the combat
    await game.combat.createEmbeddedDocuments("Combatant", combatants);
    await game.combat.activate();
} else {
    // If combat exists, end it
    await game.combat.delete();
}
