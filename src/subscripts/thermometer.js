import {
  system as system48,
  world as world51,
  ItemStack as ItemStack7,
  EquipmentSlot as EquipmentSlot8,
  EntityComponentTypes as EntityComponentTypes13
} from "@minecraft/server";
var ITEM_TAG = "shapescape_bewe:thermometer";
var TEMPERATURE_RANGES = [{ "identifier": "-3", "min": -1e3, "max": -18 }, { "identifier": "-2", "min": -18, "max": -5 }, { "identifier": "-1", "min": -5, "max": 15 }, { "identifier": "0", "min": 15, "max": 27 }, { "identifier": "1", "min": 27, "max": 40 }, { "identifier": "2", "min": 40, "max": 60 }, { "identifier": "3", "min": 60, "max": 1e3 }];
system48.runInterval(() => {
  let players = world51.getPlayers();
  for (let player of players) {
    const equippable = player.getComponent(EntityComponentTypes13.Equippable);
    const mainhand_item = equippable?.getEquipment(EquipmentSlot8.Mainhand);
    const offhand_item = equippable?.getEquipment(EquipmentSlot8.Offhand);
    if (!mainhand_item && !offhand_item)
      continue;
    if (!mainhand_item?.hasTag(ITEM_TAG) && !offhand_item?.hasTag(ITEM_TAG))
      continue;
    thermometer(player);
  }
}, 2);
function thermometer(player) {
  let surrounding_temperature = player.getDynamicProperty("shapescape_bewe:surrounding_temperature") ?? 0;
  let displayed_surrounding_temperature = toCelsius(
    player,
    surrounding_temperature,
    "displayed_surrounding_temperature"
  );
  let felt_temperature = player.getDynamicProperty("shapescape_bewe:temperature") ?? 0;
  let displayed_felt_temperature = toCelsius(player, felt_temperature, "displayed_felt_temperature");
  item_texture(player, displayed_felt_temperature);
  let unit = player.getDynamicProperty("shapescape_bewe:settings.options.degree_unit") ?? 0;
  if (!(player.getDynamicProperty(`shapescape_bewe:settings.options.actionbar`) ?? true))
    return;
  if ((player.getDynamicProperty(`shapescape_bewe:settings.options.thermometer_sneak`) ?? false) && !player.isSneaking)
    return;
  let message = "";
  if (unit === 0) {
    message = `\xA7r\xA7pWorld Temperature: \xA7${getTempColor(
      displayed_surrounding_temperature
    )}${celsiusToFahrenheit(displayed_surrounding_temperature).toFixed(1)}\xB0F`;
  } else {
    message = `\xA7r\xA7pWorld Temperature: \xA7${getTempColor(
      displayed_surrounding_temperature
    )}${displayed_surrounding_temperature.toFixed(1)}\xB0C`;
  }
  player.onScreenDisplay.setActionBar(message);
}
function item_texture(player, temp) {
  const equippable = player.getComponent("equippable");
  const mainhand_item = equippable?.getEquipment("Mainhand");
  const offhand_item = equippable?.getEquipment("Offhand");
  const newItem = new ItemStack7(`shapescape_bewe:thermometer_${getItem(player, temp)}`, 1);
  if (mainhand_item && mainhand_item?.hasTag(ITEM_TAG)) {
    const selectedSlot = equippable.getEquipmentSlot(EquipmentSlot8.Mainhand);
    if (selectedSlot === void 0)
      return;
    selectedSlot.setItem(newItem);
  }
  if (offhand_item && offhand_item?.hasTag(ITEM_TAG)) {
    const selectedSlot = equippable.getEquipmentSlot(EquipmentSlot8.Offhand);
    if (selectedSlot === void 0)
      return;
    selectedSlot.setItem(newItem);
  }
}
function getItem(player, temp) {
  let itemName = "";
  let temperatureRange = "";
  for (const temperature_range of TEMPERATURE_RANGES) {
    if (temp >= temperature_range.min && temp < temperature_range.max) {
      temperatureRange = temperature_range.identifier + "_";
    }
  }
  itemName = itemName + temperatureRange;
  const sneaking = player.getDynamicProperty("shapescape_bewe:settings.options.thermometer_sneak") ?? false;
  itemName = itemName + (sneaking ? "sneak_" : "");
  const muddyState = player.getDynamicProperty("muddy_state") ?? 0;
  const wetState = player.getDynamicProperty("wet_state") ?? 0;
  const brokenLegState = player.getDynamicProperty("break_leg") ?? false;
  const seaSick = player.getDynamicProperty("sea_sick") ?? 0;
  const altitudeSickness = player.getDynamicProperty("altitude_sickness") ?? false;
  if (muddyState && muddyState > 0.5) {
    itemName = itemName + "_muddy";
  }
  if (wetState && wetState > 0.5) {
    itemName = itemName + "_wet";
  }
  if (brokenLegState) {
    itemName = itemName + "_b_l";
  }
  if (seaSick >= 0.5) {
    itemName = itemName + "_sea_sick";
  }
  if (altitudeSickness) {
    itemName = itemName + "_a_s";
  }
  return itemName.replace("__", "_");
}
function getTempColor(temp) {
  if (temp > 45)
    return "m";
  if (temp > 40)
    return "4";
  if (temp > 32)
    return "c";
  if (temp > 27)
    return "n";
  if (temp > 23)
    return "2";
  if (temp < -10)
    return "1";
  if (temp < 0)
    return "t";
  if (temp < 10)
    return "3";
  if (temp < 15)
    return "b";
  return "q";
}
function toCelsius(player, value, property) {
  let displayed_temperature = player.getDynamicProperty(`shapescape_bewe:${property}`) ?? 0;
  const easeFactor = 0.1;
  const maxChange = 0.5;
  let celsius = calculateCelsius2(value);
  let difference = (celsius ?? 0) - displayed_temperature;
  let step = Math.min(Math.abs(difference) * easeFactor, maxChange);
  if (difference > 0) {
    displayed_temperature += step;
  } else {
    displayed_temperature -= step;
  }
  player.setDynamicProperty(`shapescape_bewe:${property}`, displayed_temperature);
  return displayed_temperature;
}
function celsiusToFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}
function calculateCelsius2(tempPoints) {
  const keyPoints = [
    { tempPoint: -2, temperature: -100 },
    { tempPoint: -1.1, temperature: -20 },
    { tempPoint: -1, temperature: -14 },
    { tempPoint: -0.95, temperature: -12 },
    { tempPoint: -0.9, temperature: -8 },
    { tempPoint: -0.85, temperature: -4 },
    { tempPoint: -0.8, temperature: 4 },
    { tempPoint: -0.75, temperature: 10 },
    { tempPoint: -0.74, temperature: 10.2 },
    { tempPoint: -0.6, temperature: 12 },
    { tempPoint: -0.15, temperature: 14 },
    { tempPoint: 0.15, temperature: 16 },
    { tempPoint: 0.4, temperature: 20 },
    { tempPoint: 0.5, temperature: 23 },
    { tempPoint: 0.6, temperature: 25 },
    { tempPoint: 0.7, temperature: 30 },
    { tempPoint: 0.74, temperature: 39 },
    { tempPoint: 0.75, temperature: 40 },
    { tempPoint: 0.8, temperature: 43 },
    { tempPoint: 0.85, temperature: 46 },
    { tempPoint: 0.9, temperature: 50 },
    { tempPoint: 2, temperature: 100 }
  ];
  if (tempPoints <= keyPoints[0].tempPoint)
    return keyPoints[0].temperature;
  if (tempPoints >= keyPoints[keyPoints.length - 1].tempPoint)
    return keyPoints[keyPoints.length - 1].temperature;
  for (let i = 0; i < keyPoints.length - 1; i++) {
    const { tempPoint: t1, temperature: temp1 } = keyPoints[i];
    const { tempPoint: t2, temperature: temp2 } = keyPoints[i + 1];
    if (tempPoints >= t1 && tempPoints <= t2) {
      const ratio = (tempPoints - t1) / (t2 - t1);
      return temp1 + ratio * (temp2 - temp1);
    }
  }
}
