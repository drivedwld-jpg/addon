import {
  EntityComponentTypes as EntityComponentTypes4,
  EquipmentSlot as EquipmentSlot4,
  ItemComponentTypes,
  system as system15,
  TicksPerSecond as TicksPerSecond3,
  world as world14
} from "@minecraft/server";
var DATA2 = { "crack_cooldown": 1, "crack_around_chance": 0.5 };
var INTERVAL2 = DATA2.crack_cooldown * TicksPerSecond3;
var OFFSETS = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 1, y: 0, z: 1 },
  { x: -1, y: 0, z: -1 },
  { x: 1, y: 0, z: -1 },
  { x: -1, y: 0, z: 1 }
];
system15.runInterval(() => {
  const players = world14.getAllPlayers();
  for (const player of players) {
    const setting = player.getDynamicProperty(`shapescape_bewe:settings.states.cracking_ice`) ?? true;
    if (!setting)
      continue;
    crackIce(player, { x: player.location.x, y: player.location.y - 1, z: player.location.z }, true);
  }
}, INTERVAL2);
function crackIce(player, location, initialCrack) {
  const enchantableComponent = player.getComponent(EntityComponentTypes4.Equippable)?.getEquipment(EquipmentSlot4.Feet)?.getComponent(ItemComponentTypes.Enchantable);
  if (enchantableComponent && enchantableComponent.getEnchantment("minecraft:frost_walker"))
    return;
  let blockToCheck = void 0;
  try {
    blockToCheck = player.dimension.getBlock(location);
  } catch {
  }
  const blockBelow = blockToCheck?.below(1);
  if (!blockToCheck || !blockBelow)
    return;
  if (blockBelow.typeId !== "minecraft:water" && blockBelow.typeId !== "minecraft:flowing_water")
    return;
  const dimension = blockToCheck.dimension;
  const particleLocation = { x: blockToCheck.center().x, y: blockToCheck.center().y + 0.5, z: blockToCheck.center().z };
  const pitch = 0.9 + Math.random() * 0.2;
  if (blockToCheck.typeId === "minecraft:ice") {
    if (initialCrack) {
      dimension.spawnParticle("shapescape_bewe:cracking_ice", particleLocation);
      dimension.playSound(`shapescape_bewe.cracking_ice.crack_0`, blockToCheck.location, {
        pitch
      });
    }
    blockToCheck.setType("shapescape_bewe:cracking_ice");
  } else if (blockToCheck.typeId === "shapescape_bewe:cracking_ice") {
    if (initialCrack) {
      dimension.spawnParticle("shapescape_bewe:cracking_ice", particleLocation);
      dimension.playSound(`shapescape_bewe.cracking_ice.crack_1`, blockToCheck.location, {
        pitch
      });
    }
    const permutation = blockToCheck.permutation.getState("shapescape_bewe:cracking_state");
    if (permutation === 0) {
      blockToCheck.setPermutation(blockToCheck.permutation.withState("shapescape_bewe:cracking_state", 1));
    } else if (permutation === 1) {
      blockToCheck.setType("minecraft:air");
      dimension.playSound(`random.glass`, blockToCheck.location);
    }
    if (initialCrack) {
      for (const offset of OFFSETS) {
        if (Math.random() < DATA2.crack_around_chance)
          continue;
        crackIce(
          player,
          {
            x: location.x + offset.x,
            y: location.y + offset.y,
            z: location.z + offset.z
          },
          false
        );
      }
    }
  }
}
