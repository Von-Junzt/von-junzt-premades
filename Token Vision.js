// OnEffectCreation
if(!token.document.sight.enabled){
    const updates = [{_id: token.id, "sight.enabled": true}];
    await canvas.scene.updateEmbeddedDocuments("Token", updates);
    ui.notifications.info("Token Vision enabled");
} else {
    ui.notifications.warn("Token Vision is already enabled");
}

// OnEffectDeletion
if(token.document.sight.enabled){
    const updates = [{_id: token.id, "sight.enabled": false}];
    await canvas.scene.updateEmbeddedDocuments("Token", updates);
    ui.notifications.info("Token Vision disabled");
} else {
    ui.notifications.warn("Token Vision is already disabled");
}