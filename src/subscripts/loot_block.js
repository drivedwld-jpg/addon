import { system as system26 } from "@minecraft/server";
system26.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("shapescape_bewe:loot_block", {
    onTick: (event2) => {
      const dimension = event2.block.dimension;
      const location = event2.block.center();
      try {
        dimension.spawnParticle(`shapescape_bewe:loot_block`, location);
      } catch {
      }
    }
  });
});
