import { EntityDamageCause as EntityDamageCause14, system as system51, world as world54, GameMode as GameMode12 } from "@minecraft/server";
var blockTypes = [
  "minecraft:oak_log",
  "minecraft:stripped_oak_log",
  "minecraft:oak_wood",
  "minecraft:stripped_oak_wood",
  "minecraft:spruce_log",
  "minecraft:stripped_spruce_log",
  "minecraft:spruce_wood",
  "minecraft:stripped_spruce_wood",
  "minecraft:birch_log",
  "minecraft:stripped_birch_log",
  "minecraft:birch_wood",
  "minecraft:stripped_birch_wood",
  "minecraft:jungle_log",
  "minecraft:stripped_jungle_log",
  "minecraft:jungle_wood",
  "minecraft:stripped_jungle_wood",
  "minecraft:acacia_log",
  "minecraft:stripped_acacia_log",
  "minecraft:acacia_wood",
  "minecraft:stripped_acacia_wood",
  "minecraft:dark_oak_log",
  "minecraft:stripped_dark_oak_log",
  "minecraft:dark_oak_wood",
  "minecraft:stripped_dark_oak_wood",
  "minecraft:mangrove_log",
  "minecraft:stripped_mangrove_log",
  "minecraft:mangrove_wood",
  "minecraft:stripped_mangrove_wood",
  "minecraft:cherry_log",
  "minecraft:stripped_cherry_log",
  "minecraft:cherry_wood",
  "minecraft:stripped_cherry_wood",
  "minecraft:pale_oak_log",
  "minecraft:stripped_pale_oak_log",
  "minecraft:pale_oak_wood",
  "minecraft:stripped_pale_oak_wood",
  "minecraft:crimson_stem",
  "minecraft:crimson_hyphae",
  "minecraft:stripped_crimson_stem",
  "minecraft:stripped_crimson_hyphae",
  "minecraft:warped_stem",
  "minecraft:warped_hyphae",
  "minecraft:stripped_warped_stem",
  "minecraft:stripped_warped_hyphae",
  "minecraft:oak_planks",
  "minecraft:spruce_planks",
  "minecraft:birch_planks",
  "minecraft:jungle_planks",
  "minecraft:acacia_planks",
  "minecraft:dark_oak_planks",
  "minecraft:mangrove_planks",
  "minecraft:cherry_planks",
  "minecraft:pale_oak_planks",
  "minecraft:crimson_planks",
  "minecraft:warped_planks"
];
world54.beforeEvents.playerBreakBlock.subscribe((event) => {
  const { itemStack, player, block, dimension } = event;
  const allowedGamemode = player.getGameMode() !== GameMode12.Creative;
  if (!allowedGamemode)
    return;
  if (!blockTypes.includes(block.typeId) && !block.typeId.includes("wood") && !block.typeId.includes("log") && !block.typeId.includes("stem") && !block.typeId.includes("hyphae") && !block.typeId.includes("planks"))
    return;
  if (itemStack === void 0 || itemStack.typeId.includes("minecraft:") && !itemStack.typeId.includes("sword") && !itemStack.typeId.includes("axe") && !itemStack.typeId.includes("pickaxe") && !itemStack.typeId.includes("shovel") && !itemStack.typeId.includes("hoe")) {
    event.cancel = true;
    system51.run(() => {
      block.setType("minecraft:air");
      player.addEffect("minecraft:mining_fatigue", 600);
      player.applyDamage(3.1, {
        cause: EntityDamageCause14.none
      });
      player.playAnimation("animation.shapescape_bewe.player.hurt_hand", {
        blendOutTime: 0.2
      });
    });
  }
});
