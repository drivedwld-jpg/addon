import { system as system45, world as world48 } from "@minecraft/server";
system45.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("shapescape_bewe:heater", {
    onTick: (event2) => {
      const block = event2.block;
      const powered = is_powered(block);
      if (block.permutation.getState("shapescape_bewe:powered") === false) {
        if (powered) {
          event2.block.setPermutation(block.permutation.withState("shapescape_bewe:powered", true));
        }
      } else {
        if (!powered) {
          event2.block.setPermutation(block.permutation.withState("shapescape_bewe:powered", false));
        }
        const nearbyPlayers = block.dimension.getEntities({
          location: block.location,
          maxDistance: 16,
          type: "minecraft:player"
        });
        for (let player of nearbyPlayers) {
          if (player) {
            player.setDynamicProperty("shapescape_bewe:temperature.heaterBlock", 20);
          }
        }
        const nearbyThermometerBlocks = block.dimension.getEntities({
          location: block.location,
          maxDistance: 16,
          type: "shapescape_bewe:thermometer_block"
        });
        for (let thermometerBlock of nearbyThermometerBlocks) {
          if (thermometerBlock) {
            thermometerBlock.setDynamicProperty("shapescape_bewe:temperature.heaterBlock", 20);
          }
        }
      }
    }
  });
});
system45.runInterval(() => {
  let players = world48.getPlayers();
  for (let player of players) {
    const heaterBlock = player.getDynamicProperty("shapescape_bewe:temperature.heaterBlock") ?? 0;
    if (heaterBlock > 1) {
      let new_value = heaterBlock - 1;
      player.setDynamicProperty("shapescape_bewe:temperature.heaterBlock", new_value);
    }
  }
}, 1);
function is_powered(block) {
  let powered = false;
  let above = void 0;
  try {
    above = block.above(1);
  } catch {
  }
  let below = void 0;
  try {
    below = block.below(1);
  } catch {
  }
  let north = void 0;
  try {
    north = block.north(1);
  } catch {
  }
  let south = void 0;
  try {
    south = block.south(1);
  } catch {
  }
  let east = void 0;
  try {
    east = block.east(1);
  } catch {
  }
  let west = void 0;
  try {
    west = block.west(1);
  } catch {
  }
  const sides = [above, below, north, south, east, west];
  for (const side of sides) {
    const redstonePower = side?.getRedstonePower();
    if (side === void 0 || !redstonePower)
      continue;
    if (redstonePower > 0)
      powered = true;
  }
  return powered;
}
