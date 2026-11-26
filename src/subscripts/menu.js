import { system as system27, world as world27, GameMode as GameMode5 } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
system27.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player")
    return;
  const player = event.sourceEntity;
  if (event.id === `shapescape_bewe:menu` && player.getGameMode() !== GameMode5.Creative) {
    player.sendMessage({
      translate: "shapescape_bewe.menu.settings.not_in_creative"
    });
    return;
  }
  if (event.id === `shapescape_bewe:menu` && player.getGameMode() === GameMode5.Creative) {
    menu(player);
  }
});
world27.afterEvents.itemUse.subscribe((event) => {
  const { itemStack, source } = event;
  const player = source;
  const item = itemStack;
  if (item.typeId === "shapescape_bewe:menu" && player.getGameMode() !== GameMode5.Creative) {
    player.sendMessage({
      translate: "shapescape_bewe.menu.settings.not_in_creative"
    });
    return;
  }
  if (item.typeId === "shapescape_bewe:menu" && player.getGameMode() === GameMode5.Creative) {
    menu(player);
  }
});
function cancel_effect(player) {
}
function confirm_effect(player) {
  player.playSound("note.bass", {
    location: player.location,
    volume: 0.6,
    pitch: 1.5
  });
  player.sendMessage({ translate: "shapescape_bewe.menu.settings.saved_message" });
}
var menu_buttons = [
  {
    name: "shapescape_bewe.menu.settings",
    icon: "textures/shapescape/bewe/ui/settings",
    function: (player) => {
      settingsSettings(player);
    }
  },
  {
    name: "shapescape_bewe.menu.states",
    icon: "textures/shapescape/bewe/ui/states",
    function: (player) => {
      settingsStates(player);
    }
  },
  {
    name: "shapescape_bewe.menu.weather",
    icon: "textures/shapescape/bewe/ui/weather",
    function: (player) => {
      settings_weather(player);
    }
  },
  {
    name: "shapescape_bewe.menu.temperature",
    icon: "textures/shapescape/bewe/ui/temperature",
    function: (player) => {
      settings_temperature(player);
    }
  },
  {
    name: "shapescape_bewe.menu.particles",
    icon: "textures/shapescape/bewe/ui/particles",
    function: (player) => {
      settings_particles(player);
    }
  },
  {
    name: "shapescape_bewe.menu.sounds",
    icon: "textures/shapescape/bewe/ui/sounds",
    function: (player) => {
      settings_sounds(player);
    }
  }
];
function menu(player) {
  const menu_ui = new ActionFormData().title({
    translate: "shapescape_bewe.menu.title"
  });
  for (let button of menu_buttons) {
    menu_ui.button({ translate: button["name"] }, button["icon"]);
  }
  menu_ui.show(player).then((r) => {
    if (r.selection !== void 0) {
      let button = menu_buttons[r.selection];
      button.function(player);
    }
  });
}
var weather_buttons = [
  "rain_ripples",
  "wind_driven_rain",
  "rainbow",
  "blizzard",
  "sandstorm",
  "enderstorm",
  "netherstorm",
  "wind_system",
  "fogs",
  "biome_fog",
  "morning_fog",
  "after_rain_fog",
  "night_fog"
];
function settings_weather(player) {
  let form = new ModalFormData().title({
    translate: "shapescape_bewe.menu.weather"
  });
  for (let setting of weather_buttons) {
    let property = world27.getDynamicProperty(
      `shapescape_bewe:settings.weather.${setting}`
    ) ?? true;
    form.toggle(
      { translate: `shapescape_bewe:settings.weather.${setting}` },
      { defaultValue: property }
    );
  }
  form.submitButton({ translate: "shapescape_bewe.menu.submit_button" });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    weather_buttons.forEach((setting, index) => {
      if (setting === "fogs") {
        if (formData.formValues[index] === true)
          player.runCommand("/scriptevent shapescape_bewe:fogs.turn_on");
        if (formData.formValues[index] === false)
          player.runCommand("/scriptevent shapescape_bewe:fogs.turn_off");
      }
      world27.setDynamicProperty(
        `shapescape_bewe:settings.weather.${setting}`,
        formData.formValues[index]
      );
    });
  });
}
var temperature_buttons = [
  "heat_effects",
  "heat_damage",
  "freezing_effects",
  "freezing_damage"
];
function settings_temperature(player) {
  let form = new ModalFormData().title({
    rawtext: [
      { translate: "shapescape_bewe.menu.temperature" },
      { text: ` ` },
      { translate: "shapescape_bewe.menu.per_player" }
    ]
  });
  for (let setting of temperature_buttons) {
    let property = player.getDynamicProperty(
      `shapescape_bewe:settings.temperature.${setting}`
    ) ?? true;
    form.toggle(
      { translate: `shapescape_bewe:settings.temperature.${setting}` },
      { defaultValue: property }
    );
  }
  form.submitButton({
    translate: "shapescape_bewe.menu.submit_button_per_player"
  });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    temperature_buttons.forEach((setting, index) => {
      player.setDynamicProperty(
        `shapescape_bewe:settings.temperature.${setting}`,
        formData.formValues[index]
      );
    });
  });
}
var particles_buttons = ["aurora", "tumbleweed"];
function settings_particles(player) {
  let form = new ModalFormData().title({
    translate: "shapescape_bewe.menu.particles"
  });
  for (let setting of particles_buttons) {
    let property = world27.getDynamicProperty(
      `shapescape_bewe:settings.particles.${setting}`
    ) ?? true;
    form.toggle(
      { translate: `shapescape_bewe:settings.particles.${setting}` },
      { defaultValue: property }
    );
  }
  form.submitButton({ translate: "shapescape_bewe.menu.submit_button" });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    particles_buttons.forEach((setting, index) => {
      if (setting === "tumbleweed") {
        if (formData.formValues[index] === false)
          player.runCommand(
            "/event entity @e[type=shapescape_bewe:tumbleweed] despawn"
          );
      }
      world27.setDynamicProperty(
        `shapescape_bewe:settings.particles.${setting}`,
        formData.formValues[index]
      );
    });
  });
}
var sounds_buttons = [
  "forest_day",
  "forest_night",
  "plains_night",
  "swamp_day",
  "swamp_night",
  "jungle_day",
  "jungle_night",
  "river",
  "beach",
  "ocean",
  "wind"
];
function settings_sounds(player) {
  let form = new ModalFormData().title({
    rawtext: [
      { translate: "shapescape_bewe.menu.sounds" },
      { text: ` ` },
      { translate: "shapescape_bewe.menu.per_player" }
    ]
  });
  for (let setting of sounds_buttons) {
    let property = player.getDynamicProperty(
      `shapescape_bewe:settings.sounds.${setting}`
    ) ?? true;
    form.toggle(
      { translate: `shapescape_bewe:settings.sounds.${setting}` },
      { defaultValue: property }
    );
  }
  form.submitButton({
    translate: "shapescape_bewe.menu.submit_button_per_player"
  });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    sounds_buttons.forEach((setting, index) => {
      player.setDynamicProperty(
        `shapescape_bewe:settings.sounds.${setting}`,
        formData.formValues[index]
      );
    });
  });
}
var states = [
  "altitude_sickness",
  "broken_leg",
  "cracking_ice",
  "muddy_state",
  "sea_sick",
  "wet_state"
];
function settingsStates(player) {
  let form = new ModalFormData().title({
    rawtext: [
      { translate: "shapescape_bewe.menu.states" },
      { text: ` ` },
      { translate: "shapescape_bewe.menu.per_player" }
    ]
  });
  for (let setting of states) {
    let property = player.getDynamicProperty(
      `shapescape_bewe:settings.states.${setting}`
    ) ?? true;
    form.toggle(
      { translate: `shapescape_bewe:settings.states.${setting}` },
      { defaultValue: property }
    );
  }
  form.submitButton({
    translate: "shapescape_bewe.menu.submit_button_per_player"
  });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    states.forEach((setting, index) => {
      player.setDynamicProperty(
        `shapescape_bewe:settings.states.${setting}`,
        formData.formValues[index]
      );
    });
  });
}
var settingsButtonsToggle = [
  { identifier: "thermometer_sneak", tooltip: ``, defaultValue: false },
  { identifier: "actionbar", tooltip: ``, defaultValue: true },
  {
    identifier: "chat_warnings",
    tooltip: `shapescape_bewe:settings.options.chat_warnings.tooltip`,
    defaultValue: true
  }
];
var unitsDropdown = [
  "shapescape_bewe:settings.options.degree_unit_fahrenheit",
  "shapescape_bewe:settings.options.degree_unit_celsius"
];
var difficulty = [
  "shapescape_bewe:settings.options.difficulty.easy",
  "shapescape_bewe:settings.options.difficulty.normal",
  "shapescape_bewe:settings.options.difficulty.hard"
];
function settingsSettings(player) {
  let form = new ModalFormData().title({
    rawtext: [{ translate: "shapescape_bewe.menu.settings" }]
  });
  for (let setting of settingsButtonsToggle) {
    let property = player.getDynamicProperty(
      `shapescape_bewe:settings.options.${setting.identifier}`
    ) ?? setting.defaultValue;
    form.toggle(
      { translate: `shapescape_bewe:settings.options.${setting.identifier}` },
      { defaultValue: property, tooltip: setting.tooltip }
    );
  }
  const stormsFrequency = world27.getDynamicProperty(
    `shapescape_bewe:settings.options.storms`
  ) ?? 50;
  const hailFrequency = world27.getDynamicProperty(`shapescape_bewe:settings.options.hail`) ?? 50;
  form.divider();
  form.dropdown(
    { translate: "shapescape_bewe:settings.options.degree_unit" },
    unitsDropdown,
    {
      defaultValueIndex: player.getDynamicProperty(
        `shapescape_bewe:settings.options.degree_unit`
      ) ?? 0
    }
  );
  form.divider();
  form.dropdown(
    { translate: "shapescape_bewe:settings.options.difficulty" },
    difficulty,
    {
      defaultValueIndex: player.getDynamicProperty(
        `shapescape_bewe:settings.options.difficulty`
      ) ?? 0
    }
  );
  form.divider();
  form.slider({ translate: "shapescape_bewe:settings.options.storms" }, 0, 100, {
    defaultValue: stormsFrequency,
    valueStep: 10
  });
  form.divider();
  form.slider({ translate: "shapescape_bewe:settings.options.hail" }, 0, 100, {
    defaultValue: hailFrequency,
    valueStep: 10
  });
  form.divider();
  form.submitButton({
    translate: "shapescape_bewe.menu.submit_button_per_player"
  });
  form.show(player).then((formData) => {
    if (formData.formValues === void 0) {
      menu(player);
      cancel_effect(player);
      return;
    }
    confirm_effect(player);
    settingsButtonsToggle.forEach((setting, index) => {
      player.setDynamicProperty(
        `shapescape_bewe:settings.options.${setting.identifier}`,
        formData.formValues[index]
      );
    });
    player.setDynamicProperty(
      `shapescape_bewe:settings.options.degree_unit`,
      formData.formValues[settingsButtonsToggle.length + 1]
      // It should be + 0, but apparently dividers are counted in the formValues as well, why....
    );
    player.setDynamicProperty(
      `shapescape_bewe:settings.options.difficulty`,
      formData.formValues[settingsButtonsToggle.length + 3]
      // It should be + 1, but apparently dividers are counted in the formValues as well, why....
    );
    world27.setDynamicProperty(
      `shapescape_bewe:settings.options.storms`,
      formData.formValues[settingsButtonsToggle.length + 5]
      // It should be + 2, but apparently dividers are counted in the formValues as well, why....
    );
    world27.setDynamicProperty(
      `shapescape_bewe:settings.options.hail`,
      formData.formValues[settingsButtonsToggle.length + 7]
      // It should be + 3, but apparently dividers are counted in the formValues as well, why....
    );
    if (stormsFrequency !== formData.formValues[settingsButtonsToggle.length + 5]) {
      world27.sendMessage({
        rawtext: [
          { translate: "shapescape_bewe.menu.settings.storms_message.1" },
          { text: ` ` },
          {
            text: `\xA7a${formData.formValues[settingsButtonsToggle.length + 5]}%%\xA7r`
          },
          { text: ` ` },
          { translate: "shapescape_bewe.menu.settings.storms_message.2" },
          { text: ` ` },
          { text: `\xA7a${player.name}` }
        ]
      });
    }
    if (hailFrequency !== formData.formValues[settingsButtonsToggle.length + 7]) {
      world27.sendMessage({
        rawtext: [
          { translate: "shapescape_bewe.menu.settings.hail_message.1" },
          { text: ` ` },
          {
            text: `\xA7a${formData.formValues[settingsButtonsToggle.length + 7]}%%\xA7r`
          },
          { text: ` ` },
          { translate: "shapescape_bewe.menu.settings.hail_message.2" },
          { text: ` ` },
          { text: `\xA7a${player.name}` }
        ]
      });
    }
  });
}
