import { system as system56, world as world59 } from "@minecraft/server";
var DEBUG24 = false;
var REFRESH_RATE19 = 1 * 20;
world59.afterEvents.worldLoad.subscribe(() => {
  world59.setDynamicProperty("shapescape_bewe:max_armor_weight", 19);
});
var STATS_ARMOR = {
  // LEATHER
  "minecraft:leather_helmet": 2,
  "minecraft:leather_chestplate": 4,
  "minecraft:leather_leggings": 3,
  "minecraft:leather_boots": 2,
  // IRON
  "minecraft:iron_helmet": 3,
  "minecraft:iron_chestplate": 5,
  "minecraft:iron_leggings": 4,
  "minecraft:iron_boots": 3,
  // CHAINMAIL
  "minecraft:chainmail_helmet": 2,
  "minecraft:chainmail_chestplate": 4,
  "minecraft:chainmail_leggings": 3,
  "minecraft:chainmail_boots": 2,
  // GOLD
  "minecraft:gold_helmet": 5,
  "minecraft:gold_chestplate": 7,
  "minecraft:gold_leggings": 6,
  "minecraft:gold_boots": 5,
  // DIAMOND
  "minecraft:diamond_helmet": 3,
  "minecraft:diamond_chestplate": 5,
  "minecraft:diamond_leggings": 4,
  "minecraft:diamond_boots": 3,
  // NETHERITE
  "minecraft:netherite_helmet": 4,
  "minecraft:netherite_chestplate": 6,
  "minecraft:netherite_leggings": 5,
  "minecraft:netherite_boots": 4,
  // OTHER
  "minecraft:turtle_helmet": 2,
  "minecraft:carved_pumpkin": 2,
  // CUSTOM ARMOR / UNASSIGNED
  custom_helmet: 2,
  custom_chestplate: 2,
  custom_leggings: 2,
  custom_boots: 2
};
function get_armor_weight(player) {
  const equippable = player.getComponent("equippable");
  const helmet = equippable.getEquipment("Head");
  const chestplate = equippable.getEquipment("Chest");
  const leggings = equippable.getEquipment("Legs");
  const boots = equippable.getEquipment("Feet");
  let armor_weight = 0;
  const armor = [helmet, chestplate, leggings, boots];
  for (const part of armor) {
    if (!part)
      continue;
    if (part.typeId in STATS_ARMOR) {
      armor_weight += STATS_ARMOR[part.typeId];
    } else {
      switch (part) {
        case helmet:
          armor_weight += STATS_ARMOR.custom_helmet;
          break;
        case chestplate:
          armor_weight += STATS_ARMOR.custom_chestplate;
          break;
        case leggings:
          armor_weight += STATS_ARMOR.custom_leggings;
          break;
        case boots:
          armor_weight += STATS_ARMOR.custom_boots;
          break;
        default:
          break;
      }
    }
  }
  if (DEBUG24) {
    console.warn("Armor weight:", armor_weight);
  }
  player.setDynamicProperty("shapescape_bewe:armor_weight", armor_weight);
}
system56.runInterval(() => {
  let players = world59.getPlayers();
  for (let player of players) {
    get_armor_weight(player);
  }
}, REFRESH_RATE19);
