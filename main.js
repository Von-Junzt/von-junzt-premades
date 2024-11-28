import {toggleDuckingEffect} from "./macros/effects/toggleDuckingEffect.js";
import {rechargeWyrmbane} from "./macros/items/rechargeWyrmbane.js";

// set up a hook to listen for token ducking
Hooks.on("updateToken", toggleDuckingEffect);

// NOT NEEDED ATM: set up a hook to listen for the rest event
// Hooks.on("dnd5e.restCompleted", rechargeWyrmbane);
