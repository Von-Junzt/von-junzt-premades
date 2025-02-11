const effectData = {
    "name": "Summoned Steed",
    "img": "icons/environment/creatures/horse-white.webp",
    "description": "<div class=\"ddb\"><div class=\"ddb\"><p>You can call on the aid of an otherworldly steed. You always have the Find Steed spell prepared.</p><p>You can also cast the spell once without expending a spell slot, and you regain the ability to do so when you finish a Long Rest.</p></div></div>",
    "tint": "#ffffff",
    "statuses": [],
    "flags": {
        "dae": {
            "enableCondition": "",
            "disableCondition": "",
            "disableIncapacitated": false,
            "selfTarget": false,
            "selfTargetAlways": false,
            "dontApply": false,
            "stackable": "multi",
            "showIcon": true,
            "durationExpression": "",
            "macroRepeat": "none",
            "specialDuration": []
        }
    },
    "origin": null
}

const targetActor = workflow.summonedCreatures[0].actor;
await MidiQOL.socket().executeAsGM("createEffects", {
    actorUuid: targetActor.uuid,
    effects: [effectData]
});