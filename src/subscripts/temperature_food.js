import { system as system42, world as world45 } from "@minecraft/server";
var DEBUG19 = false;
var REFRESH_RATE17 = 2 * 20;
var DURATION = 120 * 20;
var STATS3 = {
  // hot
  "minecraft:cooked_beef": 5,
  "minecraft:cooked_chicken": 5,
  "minecraft:cooked_cod": 3,
  "minecraft:cooked_mutton": 5,
  "minecraft:cooked_porkchop": 5,
  "minecraft:cooked_rabbit": 5,
  "minecraft:cooked_salmon": 3,
  "shapescape_bewe:self_heating_cup_6": 6,
  "shapescape_bewe:self_heating_cup_5": 6,
  "shapescape_bewe:self_heating_cup_4": 6,
  "shapescape_bewe:self_heating_cup_3": 6,
  "shapescape_bewe:self_heating_cup_2": 6,
  "shapescape_bewe:self_heating_cup_1": 6,
  // cold
  "minecraft:potion": -6,
  "minecraft:milk_bucket": -5,
  "minecraft:melon_slice": -3,
  "minecraft:glistering_melon_slice": -5,
  "minecraft:glow_berries": -4,
  "minecraft:sweet_berries": -3,
  "minecraft:apple": -3,
  "minecraft:enchanted_golden_apple": -3,
  "minecraft:golden_apple": -3,
  "shapescape_bewe:insulated_flask_6": -6,
  "shapescape_bewe:insulated_flask_5": -6,
  "shapescape_bewe:insulated_flask_4": -6,
  "shapescape_bewe:insulated_flask_3": -6,
  "shapescape_bewe:insulated_flask_2": -6,
  "shapescape_bewe:insulated_flask_1": -6
};
world45.afterEvents.playerSpawn.subscribe((event) => {
  list_clear(event.player);
});
world45.afterEvents.itemCompleteUse.subscribe((event) => {
  const item = event.itemStack;
  const player = event.source;
  if (!item)
    return;
  if (item.typeId in STATS3) {
    list_add(player, item);
    system42.runTimeout(() => {
      list_remove(player, item);
    }, DURATION);
  }
});
function update_food_temperature(player) {
  const list = list_get(player);
  let temperature = 0;
  for (const item of list) {
    temperature += STATS3[item];
  }
  if (DEBUG19)
    console.warn("Food Temperature", temperature, JSON.stringify(list));
  player.setDynamicProperty("shapescape_bewe:temperature.food", temperature);
}
system42.runInterval(() => {
  let players = world45.getPlayers();
  for (let player of players) {
    update_food_temperature(player);
  }
}, REFRESH_RATE17);
function list_get(player) {
  let list = [];
  let property_list = player.getDynamicProperty("shapescape_bewe:temperature.food.list") ?? "[]";
  if (property_list)
    list = JSON.parse(property_list);
  return list;
}
function list_add(player, item) {
  let list = [];
  let property_list = player.getDynamicProperty("shapescape_bewe:temperature.food.list") ?? "[]";
  if (property_list)
    list = JSON.parse(property_list);
  list.push(item.typeId);
  player.setDynamicProperty("shapescape_bewe:temperature.food.list", JSON.stringify(list));
}
function list_remove(player, item) {
  let list = [];
  let property_list = player.getDynamicProperty("shapescape_bewe:temperature.food.list") ?? "[]";
  if (property_list)
    list = JSON.parse(property_list);
  list = list.filter((string) => string !== item.typeId);
  player.setDynamicProperty("shapescape_bewe:temperature.food.list", JSON.stringify(list));
}
function list_clear(player) {
  let list = [];
  player.setDynamicProperty("shapescape_bewe:temperature.food.list", JSON.stringify(list));
}
