import { system as system41, world as world44 } from "@minecraft/server";
var DEBUG18 = false;
var REFRESH_RATE16 = 1 * 20;
var STATS2 = {
  "minecraft:torch": 4,
  "minecraft:soul_torch": 4,
  "minecraft:redstone_torch": 2,
  "minecraft:lantern": 2,
  "minecraft:soul_lantern": 2,
  "minecraft:lava_bucket": 8,
  "minecraft:lit_pumpkin": 4,
  // COLD
  powder_snow_bucket: -8,
  "minecraft:ice": -5,
  "minecraft:blue_ice": -6,
  "minecraft:forested_ice": -7,
  "minecraft:packed_ice": -6,
  "minecraft:snow": -3,
  "minecraft:snow_layer": -2,
  "minecraft:powder_snow": -2,
  "minecraft:snowball": -3,
  "minecraft:water_bucket": -4
};
function get_item_temperature(player) {
  const equippable = player.getComponent("equippable");
  const mainhand_item = equippable.getEquipment("Mainhand");
  const offhand_item = equippable.getEquipment("Offhand");
  let item_temperature = 0;
  if (mainhand_item) {
    if (mainhand_item.typeId in STATS2) {
      item_temperature += STATS2[mainhand_item.typeId];
    }
  }
  if (offhand_item) {
    if (offhand_item.typeId in STATS2) {
      item_temperature += STATS2[offhand_item.typeId];
    }
  }
  if (DEBUG18) {
    console.warn("Item Temperature:", item_temperature);
  }
  player.setDynamicProperty("shapescape_bewe:temperature.item", item_temperature);
}
system41.runInterval(() => {
  let players = world44.getPlayers();
  for (let player of players) {
    get_item_temperature(player);
  }
}, REFRESH_RATE16);
