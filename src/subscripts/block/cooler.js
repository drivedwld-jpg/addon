import { system as system46, world as world49 } from "@minecraft/server";
system46.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("shapescape_bewe:cooler", {
    onTick: (event2) => {
      const block = event2.block;
      const powered = is_powered2(block);
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
            player.setDynamicProperty("shapescape_bewe:temperature.coolerBlock", 20);
          }
        }
        const nearbyThermometerBlocks = block.dimension.getEntities({
          location: block.location,
          maxDistance: 16,
          type: "shapescape_bewe:thermometer_block"
        });
        for (let thermometerBlock of nearbyThermometerBlocks) {
          if (thermometerBlock) {
            thermometerBlock.setDynamicProperty("shapescape_bewe:temperature.coolerBlock", 20);
          }
        }
      }
    }
  });
});
system46.runInterval(() => {
  let players = world49.getPlayers();
  for (let player of players) {
    const coolerBlock = player.getDynamicProperty("shapescape_bewe:temperature.coolerBlock") ?? 0;
    if (coolerBlock > 1) {
      let new_value = coolerBlock - 1;
      player.setDynamicProperty("shapescape_bewe:temperature.coolerBlock", new_value);
    }
  }
}, 1);
function is_powered2(block) {
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
