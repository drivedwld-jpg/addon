import { EquipmentSlot as EquipmentSlot5, system as system40, world as world43 } from "@minecraft/server";
var DEBUG17 = false;
var REFRESH_RATE15 = 1 * 20;
var STATS = {
  // COLD
  "shapescape_bewe:cold_helmet": 15,
  "shapescape_bewe:cold_chestplate": 20,
  "shapescape_bewe:cold_leggings": 20,
  "shapescape_bewe:cold_boots": 15,
  // HEAT
  "shapescape_bewe:sun_helmet": -8,
  "shapescape_bewe:sun_chestplate": -12,
  "shapescape_bewe:sun_leggings": -12,
  "shapescape_bewe:sun_boots": -8,
  // LEATHER WARM
  "shapescape_bewe:leather_warm_helmet": 15,
  "shapescape_bewe:leather_warm_chestplate": 20,
  "shapescape_bewe:leather_warm_leggings": 20,
  "shapescape_bewe:leather_warm_boots": 15,
  // IRON WARM
  "shapescape_bewe:iron_warm_helmet": 15,
  "shapescape_bewe:iron_warm_chestplate": 20,
  "shapescape_bewe:iron_warm_leggings": 20,
  "shapescape_bewe:iron_warm_boots": 15,
  // GOLD WARM
  "shapescape_bewe:gold_warm_helmet": 15,
  "shapescape_bewe:gold_warm_chestplate": 20,
  "shapescape_bewe:gold_warm_leggings": 20,
  "shapescape_bewe:gold_warm_boots": 15,
  // DIAMOND WARM
  "shapescape_bewe:diamond_warm_helmet": 15,
  "shapescape_bewe:diamond_warm_chestplate": 20,
  "shapescape_bewe:diamond_warm_leggings": 20,
  "shapescape_bewe:diamond_warm_boots": 15,
  // NETHERITE WARM
  "shapescape_bewe:netherite_warm_helmet": 15,
  "shapescape_bewe:netherite_warm_chestplate": 20,
  "shapescape_bewe:netherite_warm_leggings": 20,
  "shapescape_bewe:netherite_warm_boots": 15,
  // LEATHER COOLING
  "shapescape_bewe:leather_cooling_helmet": -8,
  "shapescape_bewe:leather_cooling_chestplate": -12,
  "shapescape_bewe:leather_cooling_leggings": -12,
  "shapescape_bewe:leather_cooling_boots": -8,
  // IRON COOLING
  "shapescape_bewe:iron_cooling_helmet": -8,
  "shapescape_bewe:iron_cooling_chestplate": -12,
  "shapescape_bewe:iron_cooling_leggings": -12,
  "shapescape_bewe:iron_cooling_boots": -8,
  // GOLD COOLING
  "shapescape_bewe:gold_cooling_helmet": -8,
  "shapescape_bewe:gold_cooling_chestplate": -12,
  "shapescape_bewe:gold_cooling_leggings": -12,
  "shapescape_bewe:gold_cooling_boots": -8,
  // DIAMOND COOLING
  "shapescape_bewe:diamond_cooling_helmet": -8,
  "shapescape_bewe:diamond_cooling_chestplate": -12,
  "shapescape_bewe:diamond_cooling_leggings": -12,
  "shapescape_bewe:diamond_cooling_boots": -8,
  // NETHERITE COOLING
  "shapescape_bewe:netherite_cooling_helmet": -8,
  "shapescape_bewe:netherite_cooling_chestplate": -12,
  "shapescape_bewe:netherite_cooling_leggings": -12,
  "shapescape_bewe:netherite_cooling_boots": -8,
  // LEATHER
  "minecraft:leather_helmet": 3,
  "minecraft:leather_chestplate": 5,
  "minecraft:leather_leggings": 5,
  "minecraft:leather_boots": 3,
  // IRON
  "minecraft:iron_helmet": 2,
  "minecraft:iron_chestplate": 2,
  "minecraft:iron_leggings": 2,
  "minecraft:iron_boots": 2,
  // CHAINMAIL
  "minecraft:chainmail_helmet": 1,
  "minecraft:chainmail_chestplate": 1,
  "minecraft:chainmail_leggings": 1,
  "minecraft:chainmail_boots": 1,
  // GOLD
  "minecraft:gold_helmet": 2,
  "minecraft:gold_chestplate": 2,
  "minecraft:gold_leggings": 2,
  "minecraft:gold_boots": 2,
  // DIAMOND
  "minecraft:diamond_helmet": 2,
  "minecraft:diamond_chestplate": 2,
  "minecraft:diamond_leggings": 2,
  "minecraft:diamond_boots": 2,
  // NETHERITE
  "minecraft:netherite_helmet": 2,
  "minecraft:netherite_chestplate": 2,
  "minecraft:netherite_leggings": 2,
  "minecraft:netherite_boots": 2,
  // OTHER
  "minecraft:turtle_helmet": 2,
  "minecraft:carved_pumpkin": 2,
  // CUSTOM ARMOR / UNASSIGNED
  custom_helmet: 2,
  custom_chestplate: 2,
  custom_leggings: 2,
  custom_boots: 2
};
function get_armor_temperature(player) {
  const equippable = player.getComponent("equippable");
  const helmet = equippable.getEquipment(EquipmentSlot5.Head);
  const chestplate = equippable.getEquipment(EquipmentSlot5.Chest);
  const leggings = equippable.getEquipment(EquipmentSlot5.Legs);
  const boots = equippable.getEquipment(EquipmentSlot5.Feet);
  let armor_temperature = 0;
  const armor = [helmet, chestplate, leggings, boots];
  for (const part of armor) {
    if (!part)
      continue;
    if (part.typeId in STATS) {
      armor_temperature += STATS[part.typeId];
    } else {
      switch (part) {
        case helmet:
          armor_temperature += STATS.custom_helmet;
          break;
        case chestplate:
          armor_temperature += STATS.custom_chestplate;
          break;
        case leggings:
          armor_temperature += STATS.custom_leggings;
          break;
        case boots:
          armor_temperature += STATS.custom_boots;
          break;
        default:
          break;
      }
    }
  }
  if (DEBUG17) {
    console.warn("Armor Temperature:", armor_temperature);
  }
  player.setDynamicProperty("shapescape_bewe:temperature.armor", armor_temperature);
}
system40.runInterval(() => {
  let players = world43.getPlayers();
  for (let player of players) {
    get_armor_temperature(player);
  }
}, REFRESH_RATE15);
