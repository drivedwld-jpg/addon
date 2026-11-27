import {
  world,
  system,
  ItemStack,
  EntityComponentTypes,
  EquipmentSlot,
  Direction,
  BlockPermutation,
  BlockTypes,
} from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData,
  ModalFormData,
} from "@minecraft/server-ui";

/* -------------------------------------------------------------------------- */
/*                           Constants & Identifiers                          */
/* -------------------------------------------------------------------------- */

const VERSION_TAG = "v2.0.0-beta.3";

const ITEM_ON = "flashlight:flashlight";
const ITEM_OFF = "flashlight:flashlight_off";
const ITEM_WIRE_SPOOL = "flashlight:wire_spool";
const ITEM_CONFIGURATOR = "flashlight:grid_configurator";

const BLOCK_STANDING_SPOTLIGHT = "flashlight:standing_spotlight";
const BLOCK_GROUND_SPOTLIGHT = "flashlight:ground_spotlight";

const BLOCK_FUEL_GEN = "flashlight:fuel_generator";
const BLOCK_SOLAR_PANEL = "flashlight:solar_panel";
const BLOCK_WIND_TURBINE = "flashlight:wind_turbine";
const BLOCK_WATER_TURBINE = "flashlight:water_turbine";

const BLOCK_POWER_CABLE = "flashlight:power_cable";
const BLOCK_INPUT_PORT = "flashlight:power_input_port";
const BLOCK_SOCKET_HUB = "flashlight:electric_socket_hub";

const ENTITY_WIND_ROTOR = "flashlight:wind_rotor";
const ENTITY_WATER_ROTOR = "flashlight:water_rotor";

const MAX_CABLE_BFS_NODES = 192;
const MAX_FUEL_TICKS = 16000;
const SOLAR_BUFFER_MAX_TICKS = 600;

// Dynamic Property Persistence Keys
const DYN_PROP_KEY = "flashlight:active_lights_v1";
const DYN_SPOTLIGHTS_KEY = "flashlight:placed_spotlights_v1";
const DYN_GENERATORS_KEY = "flashlight:placed_generators_v2";
const DYN_CABLES_KEY = "flashlight:placed_cables_v2";
const DYN_INPUT_PORTS_KEY = "flashlight:placed_input_ports_v2";
const DYN_SOCKET_HUBS_KEY = "flashlight:placed_socket_hubs_v2";
const DYN_WIRES_KEY = "flashlight:wire_links_v2";
const DYN_CONFIG_KEY = "flashlight:grid_config_v2";

/**
 * cableArchitectureMode:
 *   0 = Flexible All-in-One (Direct Conditional Plugs + Input Ports + Socket Hubs)
 *   1 = Realistic Port + Socket Hub Required (Strict Option 2: Gen -> Input Port -> Cables -> Socket Hub -> Wire Spool -> Spotlight)
 *   2 = Hybrid (Generators plug directly or via Port; Spotlights require Socket Hub + Wire Spool)
 *   3 = Direct Conditional Cable Plugs Only (Classic Option 1)
 */
const DEFAULT_CONFIG = {
  requireSpotlightEnergy: true,
  enableWireless: true,
  wirelessRadius: 8,
  enableWireSpool: true,
  wireSpoolRange: 24,
  enablePowerCables: true,
  cableArchitectureMode: 0,
  showConditionalPlugs: true,
  allowSocketHubWireless: false,
  requireFlashlightBattery: true,
  batteryMinutes: 10,
  maxBeamDistance: 16,
  spotlightBeamMode: 0,
  generatorCapMultiplier: 1,
  fuelDurationMultiplier: 1,
  enableAnimatedRotors: true,
  enableParticles: true,
};

/** @type {typeof DEFAULT_CONFIG} */
let gridConfig = { ...DEFAULT_CONFIG };

const BASE_BEAM_STEPS = [
  { dist: 1.6, level: 12 },
  { dist: 5.5, level: 13 },
  { dist: 10.0, level: 14 },
  { dist: 13.5, level: 14 },
];

const SPOTLIGHT_CONE_STEPS = [
  { dist: 3.0, centerLevel: 14, sideSpread: 0, sideLevel: 0 },
  { dist: 7.5, centerLevel: 14, sideSpread: 1, sideLevel: 13 },
  { dist: 12.0, centerLevel: 14, sideSpread: 1, sideLevel: 14 },
];

const CONE_TAN_H = 0.25;
const CONE_TAN_V_STANDING = 0.14;
const CONE_TAN_V_GROUND_UP = 0.18;

const CARDINAL_ROTATION_ORDER = ["north", "east", "south", "west"];
const CARDINAL_VECTORS = {
  north: { fx: 0, fz: -1, idx: 0, entityYaw: 180 },
  east: { fx: 1, fz: 0, idx: 1, entityYaw: -90 },
  south: { fx: 0, fz: 1, idx: 2, entityYaw: 0 },
  west: { fx: -1, fz: 0, idx: 3, entityYaw: 90 },
};

const SIX_NEIGHBORS = [
  { state: "flashlight:n", dx: 0, dy: 0, dz: -1 },
  { state: "flashlight:s", dx: 0, dy: 0, dz: 1 },
  { state: "flashlight:e", dx: 1, dy: 0, dz: 0 },
  { state: "flashlight:w", dx: -1, dy: 0, dz: 0 },
  { state: "flashlight:u", dx: 0, dy: 1, dz: 0 },
  { state: "flashlight:d", dx: 0, dy: -1, dz: 0 },
];

/* -------------------------------------------------------------------------- */
/*                                Runtime State                               */
/* -------------------------------------------------------------------------- */

/** @type {Map<string, { dimId: string, x: number, y: number, z: number, level: number, wasWater: boolean }>} */
const activeLights = new Map();

/** @type {Map<string, { dimId: string, x: number, y: number, z: number, wasWater: boolean }>} */
const pendingCleanup = new Map();

/** @type {Map<string, { dimId: string, head: {x:number,y:number,z:number}, dir: {x:number,y:number,z:number}, tick: number, nodes: Array<{key:string, dimId:string, x:number, y:number, z:number, level:number}> }>} */
const playerPoseCache = new Map();

/** @type {Map<string, { dimId: string, x: number, y: number, z: number, powered: boolean, powerSource?: string }>} */
const trackedSpotlights = new Map();

/** @type {Map<string, { cardinal: string, typeId: string, tick: number, nodes: Array<{key:string, dimId:string, x:number, y:number, z:number, level:number}> }>} */
const spotlightBeamCache = new Map();

/**
 * @type {Map<string, { dimId: string, x: number, y: number, z: number, typeId: string, fuelTicks: number, enabled: boolean, bufferTicks: number, active: boolean, capacity: number, usedLoad: number }>}
 */
const trackedGenerators = new Map();

/** @type {Map<string, { dimId: string, x: number, y: number, z: number }>} */
const trackedCables = new Map();

/** @type {Map<string, { dimId: string, x: number, y: number, z: number, energized?: boolean }>} */
const trackedInputPorts = new Map();

/**
 * @type {Map<string, { dimId: string, x: number, y: number, z: number, energized?: boolean, feedGenKeys?: string[] }>}
 */
const trackedSocketHubs = new Map();

/**
 * Wire Spool links: spotlightKey -> sourceKey (either a Generator key OR an Electric Socket Hub key!)
 * @type {Map<string, string>}
 */
const wireLinks = new Map();

/** @type {Map<string, string>} */
const pendingWireSelection = new Map();

/** @type {Map<string, any>} */
const rotorEntities = new Map();

/** @type {Map<string, { ticks: number, lastSyncedMilestone: number }>} */
const playerBatteryState = new Map();

/** @type {Map<string, number>} */
const lastToggleTick = new Map();

/** @type {Map<string, number>} */
const lastConfigOpenTick = new Map();

/** @type {Map<number, { flattenedId: string | null, perm: BlockPermutation | null }>} */
const lightBlockCache = new Map();

let systemStarted = false;
let cableTopologyDirty = true;

function getMaxBatteryTicks() {
  return Math.max(2400, Math.round((gridConfig.batteryMinutes || 10) * 1200));
}

function getMaxBeamDist() {
  return Math.max(8, Math.min(24, Number(gridConfig.maxBeamDistance) || 16));
}

function canCableTouchGeneratorDirectly() {
  return Number(gridConfig.cableArchitectureMode) !== 1;
}

function canCableTouchSpotlightDirectly() {
  const m = Number(gridConfig.cableArchitectureMode) || 0;
  return m === 0 || m === 3;
}

/* -------------------------------------------------------------------------- */
/*                            Block Helper Utilities                          */
/* -------------------------------------------------------------------------- */

function isEntityValid(entity) {
  if (!entity) return false;
  try {
    return typeof entity.isValid === "function"
      ? entity.isValid()
      : Boolean(entity.isValid);
  } catch {
    return false;
  }
}

function makeKey(dimId, x, y, z) {
  return `${dimId}|${x},${y},${z}`;
}

function normalizeVec(vx, vy, vz) {
  const len = Math.hypot(vx, vy, vz) || 1;
  return { x: vx / len, y: vy / len, z: vz / len };
}

function isAirType(typeId) {
  return (
    typeId === "minecraft:air" ||
    typeId === "minecraft:cave_air" ||
    typeId === "minecraft:void_air"
  );
}

function isLightBlockType(typeId) {
  return (
    typeId === "minecraft:light_block" ||
    typeId.startsWith("minecraft:light_block_")
  );
}

function isSpotlightBlockType(typeId) {
  return (
    typeId === BLOCK_STANDING_SPOTLIGHT || typeId === BLOCK_GROUND_SPOTLIGHT
  );
}

function isGeneratorBlockType(typeId) {
  return (
    typeId === BLOCK_FUEL_GEN ||
    typeId === BLOCK_SOLAR_PANEL ||
    typeId === BLOCK_WIND_TURBINE ||
    typeId === BLOCK_WATER_TURBINE
  );
}

function isConduitNodeType(typeId) {
  return (
    typeId === BLOCK_POWER_CABLE ||
    typeId === BLOCK_INPUT_PORT ||
    typeId === BLOCK_SOCKET_HUB
  );
}

function isWaterBlock(block) {
  if (!block) return false;
  const t = block.typeId;
  return (
    t === "minecraft:water" ||
    t === "minecraft:flowing_water" ||
    Boolean(block.isWaterlogged)
  );
}

function isSunlightTransparentType(typeId) {
  return (
    isAirType(typeId) ||
    isLightBlockType(typeId) ||
    typeId.includes("glass") ||
    typeId.includes("leaves") ||
    typeId.includes("iron_bars") ||
    typeId.includes("fence")
  );
}

function isCalmWaterSource(block) {
  if (block.typeId !== "minecraft:water") return false;
  try {
    return block.permutation.getState("liquid_depth") === 0;
  } catch {
    return false;
  }
}

function safeGetBlock(dimension, x, y, z) {
  try {
    const range = dimension.heightRange;
    if (range && (y < range.min || y >= range.max)) return undefined;
    return dimension.getBlock({ x, y, z });
  } catch {
    return undefined;
  }
}

function canPlaceOrKeepLight(dimension, x, y, z) {
  const block = safeGetBlock(dimension, x, y, z);
  if (!block) return false;
  const typeId = block.typeId;
  return (
    isAirType(typeId) ||
    isLightBlockType(typeId) ||
    isCalmWaterSource(block)
  );
}

function resolveLightLevelSpec(clamped) {
  const cached = lightBlockCache.get(clamped);
  if (cached) return cached;

  const flattenedId = `minecraft:light_block_${clamped}`;
  let spec = { flattenedId: null, perm: null };
  try {
    if (
      BlockTypes &&
      typeof BlockTypes.get === "function" &&
      BlockTypes.get(flattenedId)
    ) {
      spec.flattenedId = flattenedId;
    } else {
      spec.perm = BlockPermutation.resolve("minecraft:light_block", {
        block_light_level: clamped,
      });
    }
  } catch {
    try {
      spec.perm = BlockPermutation.resolve(flattenedId);
    } catch {
      spec.flattenedId = flattenedId;
    }
  }

  lightBlockCache.set(clamped, spec);
  return spec;
}

function applyLightBlock(block, level, waterlogged) {
  const clamped = Math.max(1, Math.min(15, level | 0));
  const spec = resolveLightLevelSpec(clamped);
  try {
    if (spec.flattenedId) {
      block.setType(spec.flattenedId);
    } else if (spec.perm) {
      block.setPermutation(spec.perm);
    } else {
      block.setType(`minecraft:light_block_${clamped}`);
    }

    if (waterlogged) {
      try {
        block.setWaterlogged(true);
      } catch {
        block.setType("minecraft:water");
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function restoreBlock(entry) {
  let dim;
  try {
    dim = world.getDimension(entry.dimId);
  } catch {
    return true;
  }
  const block = safeGetBlock(dim, entry.x, entry.y, entry.z);
  if (!block) return false;
  if (isLightBlockType(block.typeId)) {
    try {
      const restoreWater = Boolean(entry.wasWater || block.isWaterlogged);
      block.setType(restoreWater ? "minecraft:water" : "minecraft:air");
    } catch {
      return false;
    }
  }
  return true;
}

function offsetByFace(block, face) {
  let x = block.x;
  let y = block.y;
  let z = block.z;
  switch (face) {
    case Direction.Up:
      y += 1;
      break;
    case Direction.Down:
      y -= 1;
      break;
    case Direction.North:
      z -= 1;
      break;
    case Direction.South:
      z += 1;
      break;
    case Direction.West:
      x -= 1;
      break;
    case Direction.East:
      x += 1;
      break;
  }
  return { x, y, z };
}

/* -------------------------------------------------------------------------- */
/*                       Burnable Fuel & Battery Helpers                      */
/* -------------------------------------------------------------------------- */

function getFuelInfo(typeId) {
  if (!typeId || typeof typeId !== "string") return null;
  if (typeId.includes("crimson") || typeId.includes("warped")) return null;

  if (typeId === "minecraft:lava_bucket") {
    return { ticks: 16000, returnItem: "minecraft:bucket" };
  }
  if (typeId === "minecraft:coal_block" || typeId === "minecraft:charcoal_block") {
    return { ticks: 16000, returnItem: null };
  }
  if (typeId === "minecraft:dried_kelp_block" || typeId === "minecraft:blaze_rod") {
    return { ticks: 4800, returnItem: null };
  }
  if (typeId === "minecraft:coal" || typeId === "minecraft:charcoal") {
    return { ticks: 3200, returnItem: null };
  }
  if (
    typeId.endsWith("_log") ||
    typeId.endsWith("_wood") ||
    typeId.endsWith("_boat") ||
    typeId.endsWith("_chest_boat") ||
    typeId === "minecraft:bamboo_block" ||
    typeId === "minecraft:stripped_bamboo_block"
  ) {
    return { ticks: 800, returnItem: null };
  }
  if (
    typeId.endsWith("_planks") ||
    typeId.endsWith("_fence") ||
    typeId.endsWith("_fence_gate") ||
    typeId.endsWith("_stairs") ||
    typeId.endsWith("_trapdoor") ||
    typeId === "minecraft:crafting_table" ||
    typeId === "minecraft:chest" ||
    typeId === "minecraft:barrel" ||
    typeId === "minecraft:bookshelf" ||
    typeId === "minecraft:ladder"
  ) {
    return { ticks: 640, returnItem: null };
  }
  if (
    typeId === "minecraft:stick" ||
    typeId === "minecraft:bamboo" ||
    typeId === "minecraft:scaffolding" ||
    typeId.endsWith("_sapling") ||
    typeId.endsWith("_slab") ||
    typeId.endsWith("_wool") ||
    typeId.endsWith("_carpet") ||
    typeId === "minecraft:wooden_pickaxe" ||
    typeId === "minecraft:wooden_axe" ||
    typeId === "minecraft:wooden_shovel" ||
    typeId === "minecraft:wooden_sword" ||
    typeId === "minecraft:wooden_hoe"
  ) {
    return { ticks: 320, returnItem: null };
  }
  return null;
}

function formatBatteryBar(pct) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const filled = Math.round(clamped / 10);
  const color = clamped > 40 ? "§a" : clamped > 15 ? "§e" : "§c";
  return `§b⚡ Battery: ${color}${clamped}% §8[${color}${"█".repeat(filled)}§7${"░".repeat(10 - filled)}§8]`;
}

function readBatteryTicksFromItem(item) {
  const maxBat = getMaxBatteryTicks();
  if (!item) return maxBat;
  try {
    if (typeof item.getDynamicProperty === "function") {
      const val = item.getDynamicProperty("flashlight:battery");
      if (typeof val === "number" && !Number.isNaN(val)) {
        return Math.max(0, Math.min(maxBat, val));
      }
    }
  } catch {
    // Fallback
  }
  try {
    const lore = item.getLore();
    if (Array.isArray(lore)) {
      for (const line of lore) {
        const m = String(line).match(/(\d+)%/);
        if (m) {
          const pct = Math.max(0, Math.min(100, Number(m[1])));
          return Math.round((pct / 100) * maxBat);
        }
      }
    }
  } catch {
    // Ignore
  }
  return maxBat;
}

function writeBatteryTicksToItem(item, ticks) {
  const maxBat = getMaxBatteryTicks();
  const clamped = Math.max(0, Math.min(maxBat, Math.round(ticks)));
  const pct =
    clamped <= 0
      ? 0
      : Math.max(1, Math.min(100, Math.round((clamped / maxBat) * 100)));
  try {
    if (typeof item.setDynamicProperty === "function") {
      item.setDynamicProperty("flashlight:battery", clamped);
    }
  } catch {
    // Ignore
  }
  try {
    const prevLore = (item.getLore() || []).filter(
      (l) => !String(l).includes("Battery:")
    );
    item.setLore([formatBatteryBar(pct), ...prevLore]);
  } catch {
    // Ignore
  }
}

/* -------------------------------------------------------------------------- */
/*                       Persistence for Crash/Reload Safety                  */
/* -------------------------------------------------------------------------- */

function saveGridConfig() {
  try {
    world.setDynamicProperty(DYN_CONFIG_KEY, JSON.stringify(gridConfig));
  } catch {
    // Ignore
  }
}

function loadGridConfig() {
  try {
    const raw = world.getDynamicProperty(DYN_CONFIG_KEY);
    if (typeof raw === "string" && raw.length > 0) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        gridConfig = { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch {
    gridConfig = { ...DEFAULT_CONFIG };
  }
}

function saveCoordMap(propKey, mapObj) {
  try {
    if (mapObj.size === 0) {
      world.setDynamicProperty(propKey, undefined);
      return;
    }
    const list = [];
    for (const v of mapObj.values()) {
      list.push([v.dimId, v.x, v.y, v.z]);
    }
    const raw = JSON.stringify(list);
    if (raw.length < 30000) {
      world.setDynamicProperty(propKey, raw);
    }
  } catch {
    // Ignore
  }
}

function loadCoordMap(propKey, mapObj, extraDefaults = {}) {
  try {
    const raw = world.getDynamicProperty(propKey);
    if (typeof raw !== "string" || raw.length === 0) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    for (const item of parsed) {
      if (!Array.isArray(item) || item.length < 4) continue;
      const [dimId, x, y, z] = item;
      const k = makeKey(String(dimId), Number(x), Number(y), Number(z));
      mapObj.set(k, {
        dimId: String(dimId),
        x: Number(x),
        y: Number(y),
        z: Number(z),
        ...extraDefaults,
      });
    }
  } catch {
    // Ignore
  }
}

function saveTrackedState() {
  try {
    /** @type {Record<string, Array<[number,number,number,number]>>} */
    const grouped = {};
    let count = 0;
    const pushEntry = (v) => {
      if (!grouped[v.dimId]) grouped[v.dimId] = [];
      grouped[v.dimId].push([v.x, v.y, v.z, v.wasWater ? 1 : 0]);
      count += 1;
    };
    for (const v of activeLights.values()) pushEntry(v);
    for (const v of pendingCleanup.values()) pushEntry(v);

    if (count === 0) {
      world.setDynamicProperty(DYN_PROP_KEY, undefined);
      return;
    }
    const raw = JSON.stringify(grouped);
    if (raw.length < 30000) {
      world.setDynamicProperty(DYN_PROP_KEY, raw);
    }
  } catch {
    // Ignore
  }
}

function saveTrackedSpotlights() {
  saveCoordMap(DYN_SPOTLIGHTS_KEY, trackedSpotlights);
}
function saveTrackedCables() {
  saveCoordMap(DYN_CABLES_KEY, trackedCables);
}
function saveTrackedInputPorts() {
  saveCoordMap(DYN_INPUT_PORTS_KEY, trackedInputPorts);
}
function saveTrackedSocketHubs() {
  saveCoordMap(DYN_SOCKET_HUBS_KEY, trackedSocketHubs);
}

function saveTrackedGenerators() {
  try {
    if (trackedGenerators.size === 0) {
      world.setDynamicProperty(DYN_GENERATORS_KEY, undefined);
      return;
    }
    const list = [];
    for (const g of trackedGenerators.values()) {
      list.push([
        g.dimId,
        g.x,
        g.y,
        g.z,
        g.typeId,
        Math.round(g.fuelTicks || 0),
        g.enabled ? 1 : 0,
        Math.round(g.bufferTicks || 0),
      ]);
    }
    const raw = JSON.stringify(list);
    if (raw.length < 30000) {
      world.setDynamicProperty(DYN_GENERATORS_KEY, raw);
    }
  } catch {
    // Ignore
  }
}

function saveWireLinks() {
  try {
    if (wireLinks.size === 0) {
      world.setDynamicProperty(DYN_WIRES_KEY, undefined);
      return;
    }
    const raw = JSON.stringify([...wireLinks.entries()]);
    if (raw.length < 30000) {
      world.setDynamicProperty(DYN_WIRES_KEY, raw);
    }
  } catch {
    // Ignore
  }
}

function loadAllPersistedGridData() {
  loadGridConfig();
  loadCoordMap(DYN_SPOTLIGHTS_KEY, trackedSpotlights, { powered: false });
  loadCoordMap(DYN_CABLES_KEY, trackedCables);
  loadCoordMap(DYN_INPUT_PORTS_KEY, trackedInputPorts, { energized: false });
  loadCoordMap(DYN_SOCKET_HUBS_KEY, trackedSocketHubs, {
    energized: false,
    feedGenKeys: [],
  });

  try {
    const raw = world.getDynamicProperty(DYN_GENERATORS_KEY);
    if (typeof raw === "string" && raw.length > 0) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!Array.isArray(item) || item.length < 5) continue;
          const [dimId, x, y, z, typeId, fuelTicks, enabled, bufferTicks] = item;
          const k = makeKey(String(dimId), Number(x), Number(y), Number(z));
          trackedGenerators.set(k, {
            dimId: String(dimId),
            x: Number(x),
            y: Number(y),
            z: Number(z),
            typeId: String(typeId),
            fuelTicks: Number(fuelTicks || 0),
            enabled: enabled === undefined ? true : Boolean(enabled),
            bufferTicks: Number(bufferTicks || 0),
            active: false,
            capacity: 0,
            usedLoad: 0,
          });
        }
      }
    }
  } catch {
    // Ignore
  }

  try {
    const raw = world.getDynamicProperty(DYN_WIRES_KEY);
    if (typeof raw === "string" && raw.length > 0) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const pair of parsed) {
          if (Array.isArray(pair) && pair.length === 2) {
            wireLinks.set(String(pair[0]), String(pair[1]));
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  cableTopologyDirty = true;
}

function loadAndSweepPersistedLights() {
  try {
    const raw = world.getDynamicProperty(DYN_PROP_KEY);
    if (typeof raw !== "string" || raw.length === 0) return;
    const parsed = JSON.parse(raw);
    const sweepEntry = (dimId, x, y, z, waterFlag) => {
      const entry = {
        dimId: String(dimId),
        x: Number(x),
        y: Number(y),
        z: Number(z),
        wasWater: Boolean(waterFlag),
      };
      if (!restoreBlock(entry)) {
        pendingCleanup.set(
          makeKey(entry.dimId, entry.x, entry.y, entry.z),
          entry
        );
      }
    };

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (!Array.isArray(item) || item.length < 4) continue;
        sweepEntry(item[0], item[1], item[2], item[3], item[4]);
      }
    } else if (parsed && typeof parsed === "object") {
      for (const [dimId, coordsList] of Object.entries(parsed)) {
        if (!Array.isArray(coordsList)) continue;
        for (const c of coordsList) {
          if (!Array.isArray(c) || c.length < 3) continue;
          sweepEntry(dimId, c[0], c[1], c[2], c[3]);
        }
      }
    }
    saveTrackedState();
  } catch {
    try {
      world.setDynamicProperty(DYN_PROP_KEY, undefined);
    } catch {
      // Ignore
    }
  }
}

function clearAllLightsImmediate() {
  for (const [key, entry] of activeLights.entries()) {
    if (!restoreBlock(entry)) {
      pendingCleanup.set(key, entry);
    }
  }
  activeLights.clear();
  for (const [key, entry] of [...pendingCleanup.entries()]) {
    if (restoreBlock(entry)) {
      pendingCleanup.delete(key);
    }
  }
  playerPoseCache.clear();
  spotlightBeamCache.clear();
  saveTrackedState();
}

/* -------------------------------------------------------------------------- */
/*                  60-FPS Companion Rotor Entity Lifecycle                   */
/* -------------------------------------------------------------------------- */

function despawnRotorForKey(genKey, dim, gx, gy, gz) {
  const existing = rotorEntities.get(genKey);
  if (existing && isEntityValid(existing)) {
    try {
      existing.remove();
    } catch {
      // Ignore
    }
  }
  rotorEntities.delete(genKey);

  if (dim && typeof dim.getEntities === "function") {
    try {
      const nearby = dim.getEntities({
        location: { x: gx + 0.5, y: gy + 1.0, z: gz + 0.5 },
        maxDistance: 1.6,
        families: ["flashlight_rotor"],
      });
      for (const ent of nearby) {
        try {
          ent.remove();
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    }
  }
}

function ensureRotorEntity(genKey, dim, gen, cardinal) {
  if (!gridConfig.enableAnimatedRotors) {
    despawnRotorForKey(genKey, dim, gen.x, gen.y, gen.z);
    return;
  }
  if (!dim || typeof dim.spawnEntity !== "function") return;

  const isWind = gen.typeId === BLOCK_WIND_TURBINE;
  const entityId = isWind ? ENTITY_WIND_ROTOR : ENTITY_WATER_ROTOR;
  const vec = CARDINAL_VECTORS[cardinal] || CARDINAL_VECTORS.north;

  const targetLoc = isWind
    ? {
        x: gen.x + 0.5 + vec.fx * 0.35,
        y: gen.y + 1.56875,
        z: gen.z + 0.5 + vec.fz * 0.35,
      }
    : {
        x: gen.x + 0.5,
        y: gen.y,
        z: gen.z + 0.5,
      };

  let ent = rotorEntities.get(genKey);
  if (!isEntityValid(ent)) {
    if (typeof dim.getEntities === "function") {
      try {
        const found = dim.getEntities({
          type: entityId,
          location: targetLoc,
          maxDistance: 1.1,
        });
        if (found && found.length > 0) {
          ent = found[0];
          for (let i = 1; i < found.length; i++) {
            try {
              found[i].remove();
            } catch {
              // Ignore
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!isEntityValid(ent)) {
      try {
        ent = dim.spawnEntity(entityId, targetLoc);
      } catch {
        return;
      }
    }
    rotorEntities.set(genKey, ent);
  }

  try {
    if (typeof ent.teleport === "function") {
      ent.teleport(targetLoc, { rotation: { x: 0, y: vec.entityYaw } });
    }
    if (isWind && typeof ent.setProperty === "function") {
      ent.setProperty("flashlight:facing_idx", vec.idx);
    }
  } catch {
    // Ignore
  }
}

/* -------------------------------------------------------------------------- */
/*       6-Way Conduit Arms & Conditional Auto-Hidden Plug Lead Updater       */
/* -------------------------------------------------------------------------- */

/**
 * Determines whether conduit block `srcType` visually snaps an arm/collar to neighbor `dstType`
 * according to the current configurable `cableArchitectureMode`.
 */
function shouldConduitSnapToNeighbor(srcType, dstType) {
  if (!dstType) return false;
  if (isConduitNodeType(dstType)) return true;

  if (srcType === BLOCK_INPUT_PORT) {
    // Power Input Port is designed specifically to couple onto Generators!
    return isGeneratorBlockType(dstType);
  }

  if (srcType === BLOCK_SOCKET_HUB) {
    if (isGeneratorBlockType(dstType)) return canCableTouchGeneratorDirectly();
    if (isSpotlightBlockType(dstType)) return canCableTouchSpotlightDirectly();
    return false;
  }

  if (srcType === BLOCK_POWER_CABLE) {
    if (isGeneratorBlockType(dstType)) return canCableTouchGeneratorDirectly();
    if (isSpotlightBlockType(dstType)) return canCableTouchSpotlightDirectly();
    return false;
  }

  return false;
}

/**
 * Determines whether a Generator or Spotlight should display its auto-appearing
 * conditional plug lead (`pf, pb, pr, pl`) toward adjacent `neighborType`.
 */
function shouldBlockShowConditionalPlug(ownerType, neighborType) {
  if (!gridConfig.showConditionalPlugs || !neighborType) return false;

  if (isGeneratorBlockType(ownerType)) {
    if (neighborType === BLOCK_INPUT_PORT) return true;
    if (
      (neighborType === BLOCK_POWER_CABLE || neighborType === BLOCK_SOCKET_HUB) &&
      canCableTouchGeneratorDirectly()
    ) {
      return true;
    }
    return false;
  }

  if (isSpotlightBlockType(ownerType)) {
    if (
      (neighborType === BLOCK_POWER_CABLE || neighborType === BLOCK_SOCKET_HUB) &&
      canCableTouchSpotlightDirectly()
    ) {
      return true;
    }
    return false;
  }

  return false;
}

function refreshConduitNodeVisuals(dim, cx, cy, cz, energizedOverride) {
  const b = safeGetBlock(dim, cx, cy, cz);
  if (!b || !isConduitNodeType(b.typeId)) return;

  try {
    let perm = b.permutation;
    let changed = false;

    for (const nb of SIX_NEIGHBORS) {
      const adj = safeGetBlock(dim, cx + nb.dx, cy + nb.dy, cz + nb.dz);
      const shouldConnect = Boolean(
        adj && shouldConduitSnapToNeighbor(b.typeId, adj.typeId)
      );
      if (Boolean(perm.getState(nb.state)) !== shouldConnect) {
        perm = perm.withState(nb.state, shouldConnect);
        changed = true;
      }
    }

    if (energizedOverride !== undefined) {
      if (Boolean(perm.getState("flashlight:energized")) !== energizedOverride) {
        perm = perm.withState("flashlight:energized", energizedOverride);
        changed = true;
      }
    }

    if (changed) {
      b.setPermutation(perm);
    }
  } catch {
    // Ignore
  }
}

function refreshMachineConditionalPlugs(dim, bx, by, bz) {
  const b = safeGetBlock(dim, bx, by, bz);
  if (!b) return;
  const t = b.typeId;
  if (!isGeneratorBlockType(t) && !isSpotlightBlockType(t)) return;

  try {
    let perm = b.permutation;
    let cardinal = "north";
    if (t !== BLOCK_WATER_TURBINE) {
      cardinal = String(
        perm.getState("minecraft:cardinal_direction") || "north"
      );
    }
    const vec = CARDINAL_VECTORS[cardinal] || CARDINAL_VECTORS.north;
    const rx = -vec.fz;
    const rz = vec.fx;

    const checks = [
      { state: "flashlight:pf", dx: vec.fx, dz: vec.fz },
      { state: "flashlight:pb", dx: -vec.fx, dz: -vec.fz },
      { state: "flashlight:pr", dx: rx, dz: rz },
      { state: "flashlight:pl", dx: -rx, dz: -rz },
    ];

    let changed = false;
    for (const c of checks) {
      const nb = safeGetBlock(dim, bx + c.dx, by, bz + c.dz);
      const show = shouldBlockShowConditionalPlug(t, nb?.typeId);
      if (Boolean(perm.getState(c.state)) !== show) {
        perm = perm.withState(c.state, show);
        changed = true;
      }
    }

    if (changed) {
      b.setPermutation(perm);
    }
  } catch {
    // Ignore
  }
}

function updateNeighborsAround(dim, x, y, z) {
  if (!dim) return;
  refreshConduitNodeVisuals(dim, x, y, z, undefined);
  refreshMachineConditionalPlugs(dim, x, y, z);
  for (const nb of SIX_NEIGHBORS) {
    const nx = x + nb.dx;
    const ny = y + nb.dy;
    const nz = z + nb.dz;
    refreshConduitNodeVisuals(dim, nx, ny, nz, undefined);
    refreshMachineConditionalPlugs(dim, nx, ny, nz);
  }
}

function refreshAllConditionalPlugs() {
  for (const g of trackedGenerators.values()) {
    try {
      const dim = world.getDimension(g.dimId);
      refreshMachineConditionalPlugs(dim, g.x, g.y, g.z);
    } catch {
      // Ignore
    }
  }
  for (const s of trackedSpotlights.values()) {
    try {
      const dim = world.getDimension(s.dimId);
      refreshMachineConditionalPlugs(dim, s.x, s.y, s.z);
    } catch {
      // Ignore
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                 Power & Lighting Configurator UI (@server-ui)              */
/* -------------------------------------------------------------------------- */

function showFormSafe(form, player, onResult, attempt = 0) {
  if (!isEntityValid(player)) return;
  system.run(() => {
    if (!isEntityValid(player)) return;
    form
      .show(player)
      .then((res) => {
        if (
          res &&
          res.canceled &&
          String(res.cancelationReason) === "UserBusy" &&
          attempt < 4
        ) {
          if (typeof system.runTimeout === "function") {
            system.runTimeout(
              () => showFormSafe(form, player, onResult, attempt + 1),
              4
            );
          }
          return;
        }
        onResult(res);
      })
      .catch(() => {
        // Ignore
      });
  });
}

function describeCableArchShort() {
  const m = Number(gridConfig.cableArchitectureMode) || 0;
  if (m === 1) return "Strict Port + Socket Hub";
  if (m === 2) return "Hybrid (Socket Hub for Lamps)";
  if (m === 3) return "Direct Plugs Only";
  return "Flexible (Ports + Direct Plugs)";
}

function describeActiveDeliveryModes() {
  if (!gridConfig.requireSpotlightEnergy) {
    return "§aFree Power (No Generator Needed)";
  }
  const parts = [];
  if (gridConfig.enableWireless) {
    parts.push(`Wireless (${gridConfig.wirelessRadius}m)`);
  }
  if (gridConfig.enableWireSpool) {
    parts.push(`Wire Spool (${gridConfig.wireSpoolRange}m)`);
  }
  if (gridConfig.enablePowerCables) {
    parts.push(`3D Cables [${describeCableArchShort()}]`);
  }
  return parts.length > 0
    ? `§e${parts.join(" + ")}`
    : "§cNone (Direct Touch Only)";
}

function openConfiguratorHub(player) {
  if (!isEntityValid(player)) return;

  const now = system.currentTick;
  const lastOpen = lastConfigOpenTick.get(player.id) ?? -100;
  if (now - lastOpen < 6) return;
  lastConfigOpenTick.set(player.id, now);

  let activeGenCount = 0;
  for (const g of trackedGenerators.values()) {
    if (g.active) activeGenCount += 1;
  }
  let litSpotCount = 0;
  for (const s of trackedSpotlights.values()) {
    if (s.powered || !gridConfig.requireSpotlightEnergy) litSpotCount += 1;
  }

  const form = new ActionFormData()
    .title("§l⚡ Power & Lighting Configurator")
    .body(
      `§7Version: §b${VERSION_TAG}\n` +
        `§7Delivery: ${describeActiveDeliveryModes()}\n` +
        `§7Generators: §a${activeGenCount}§7/${trackedGenerators.size} §8| §7Socket Hubs: §e${trackedSocketHubs.size} §8| §7Lamps Lit: §a${litSpotCount}§7/${trackedSpotlights.size}\n` +
        `§7Flashlight Battery: ${gridConfig.requireFlashlightBattery ? `§e${gridConfig.batteryMinutes} min` : "§aInfinite"} §8| §7Beam: §f${gridConfig.maxBeamDistance}m\n\n` +
        `§fChoose a category to configure:`
    )
    .button("⚡ Power Delivery & Cable Port Rules", "textures/items/redstone_dust")
    .button("🔦 Flashlight & Beam Settings", "textures/items/glowstone_dust")
    .button("⚙ Generator Output & Visuals", "textures/items/copper_ingot")
    .button("🛠 Quick Grid Actions & Reset", "textures/items/comparator");

  showFormSafe(form, player, (res) => {
    if (!res || res.canceled) return;
    if (res.selection === 0) openPowerDeliveryModal(player);
    else if (res.selection === 1) openBeamAndBatteryModal(player);
    else if (res.selection === 2) openGeneratorTuningModal(player);
    else if (res.selection === 3) openQuickActionsForm(player);
  });
}

function getPresetIndexFromConfig() {
  const { enableWireless: w, enableWireSpool: s, enablePowerCables: c } = gridConfig;
  if (w && s && c) return 0;
  if (!w && s && c) return 1;
  if (!w && !s && c) return 2;
  if (!w && s && !c) return 3;
  if (w && !s && !c) return 4;
  return 5;
}

function openPowerDeliveryModal(player) {
  const presetItems = [
    "All Methods (Wireless + Wire Spool + Cables)",
    "Wired Only (3D Cables + Wire Spool)",
    "Physical 3D Power Cables Only",
    "Wire Spool Overhead Links Only",
    "Wireless Radius Only",
    "Use Custom Toggles Below",
  ];

  const cableArchItems = [
    "Flexible All-in-One (Direct Plugs + Ports + Socket Hubs)",
    "Strict Realistic: Input Port + Socket Hub Required",
    "Hybrid: Direct Gen Plugs + Socket Hub Required for Lamps",
    "Direct Conditional Cable Plugs Only",
  ];

  const modal = new ModalFormData()
    .title("⚡ Power Delivery & Port Rules")
    .toggle("Spotlights Require Generator Energy", {
      defaultValue: Boolean(gridConfig.requireSpotlightEnergy),
    })
    .dropdown("Power Delivery Mode Preset", presetItems, {
      defaultValueIndex: getPresetIndexFromConfig(),
    })
    .dropdown("3D Cable & Port Connection Rules", cableArchItems, {
      defaultValueIndex: Number(gridConfig.cableArchitectureMode) || 0,
    })
    .toggle("Show Auto-Appearing Plug Leads on Blocks", {
      defaultValue: Boolean(gridConfig.showConditionalPlugs),
    })
    .toggle("Allow Electric Socket Hubs to Emit Wireless Power", {
      defaultValue: Boolean(gridConfig.allowSocketHubWireless),
    })
    .toggle("Custom: Enable Wireless Power Radius", {
      defaultValue: Boolean(gridConfig.enableWireless),
    })
    .slider("Wireless Power Radius (Blocks)", 4, 32, {
      valueStep: 2,
      defaultValue: Number(gridConfig.wirelessRadius) || 8,
    })
    .toggle("Custom: Enable Copper Wire Spool", {
      defaultValue: Boolean(gridConfig.enableWireSpool),
    })
    .slider("Wire Spool Max Range (Blocks)", 8, 48, {
      valueStep: 4,
      defaultValue: Number(gridConfig.wireSpoolRange) || 24,
    })
    .toggle("Custom: Enable Physical 3D Power Cables", {
      defaultValue: Boolean(gridConfig.enablePowerCables),
    });

  showFormSafe(modal, player, (res) => {
    if (!res || res.canceled || !Array.isArray(res.formValues)) return;
    const [
      reqEnergy,
      presetIdx,
      cableArchIdx,
      showPlugs,
      hubWireless,
      custWireless,
      wRadius,
      custSpool,
      sRange,
      custCables,
    ] = res.formValues;

    gridConfig.requireSpotlightEnergy = Boolean(reqEnergy);
    gridConfig.cableArchitectureMode = Number(cableArchIdx) || 0;
    gridConfig.showConditionalPlugs = Boolean(showPlugs);
    gridConfig.allowSocketHubWireless = Boolean(hubWireless);
    gridConfig.wirelessRadius = Number(wRadius) || 8;
    gridConfig.wireSpoolRange = Number(sRange) || 24;

    switch (Number(presetIdx)) {
      case 0:
        gridConfig.enableWireless = true;
        gridConfig.enableWireSpool = true;
        gridConfig.enablePowerCables = true;
        break;
      case 1:
        gridConfig.enableWireless = false;
        gridConfig.enableWireSpool = true;
        gridConfig.enablePowerCables = true;
        break;
      case 2:
        gridConfig.enableWireless = false;
        gridConfig.enableWireSpool = false;
        gridConfig.enablePowerCables = true;
        break;
      case 3:
        gridConfig.enableWireless = false;
        gridConfig.enableWireSpool = true;
        gridConfig.enablePowerCables = false;
        break;
      case 4:
        gridConfig.enableWireless = true;
        gridConfig.enableWireSpool = false;
        gridConfig.enablePowerCables = false;
        break;
      default:
        gridConfig.enableWireless = Boolean(custWireless);
        gridConfig.enableWireSpool = Boolean(custSpool);
        gridConfig.enablePowerCables = Boolean(custCables);
        break;
    }

    // Note: if Strict Port + Socket Hub mode (1) or Hybrid (2) is chosen with Preset 2 ("Cables Only"),
    // ensure Wire Spool stays enabled unless Socket Hub Wireless is on so players can hook Socket Hubs to Spotlights!
    if (
      (gridConfig.cableArchitectureMode === 1 ||
        gridConfig.cableArchitectureMode === 2) &&
      Number(presetIdx) === 2 &&
      !gridConfig.allowSocketHubWireless
    ) {
      gridConfig.enableWireSpool = true;
    }

    cableTopologyDirty = true;
    spotlightBeamCache.clear();
    saveGridConfig();
    refreshAllConditionalPlugs();
    updatePowerGrid(0);
    sendFeedback(
      player,
      `§a✔ Saved Grid Rules: §e${describeCableArchShort()}`,
      "random.orb",
      1.25
    );
  });
}

function openBeamAndBatteryModal(player) {
  const beamModes = [
    "Wide Cone + Expanded Far Cluster (Default)",
    "Focused Spine + Expanded Far Cluster",
    "Classic Single-Ray Narrow Beam",
  ];

  const modal = new ModalFormData()
    .title("🔦 Flashlight & Beam Settings")
    .toggle("Handheld Flashlight Uses Battery", {
      defaultValue: Boolean(gridConfig.requireFlashlightBattery),
    })
    .slider("Flashlight Battery Duration (Minutes)", 2, 30, {
      valueStep: 2,
      defaultValue: Number(gridConfig.batteryMinutes) || 10,
    })
    .slider("Max Beam Reach (Blocks)", 8, 24, {
      valueStep: 2,
      defaultValue: Number(gridConfig.maxBeamDistance) || 16,
    })
    .dropdown("Spotlight Beam Shape", beamModes, {
      defaultValueIndex: Number(gridConfig.spotlightBeamMode) || 0,
    });

  showFormSafe(modal, player, (res) => {
    if (!res || res.canceled || !Array.isArray(res.formValues)) return;
    const [reqBat, batMins, reach, beamMode] = res.formValues;

    gridConfig.requireFlashlightBattery = Boolean(reqBat);
    gridConfig.batteryMinutes = Number(batMins) || 10;
    gridConfig.maxBeamDistance = Number(reach) || 16;
    gridConfig.spotlightBeamMode = Number(beamMode) || 0;

    playerPoseCache.clear();
    spotlightBeamCache.clear();
    saveGridConfig();
    sendFeedback(
      player,
      `§a✔ Saved Beam Settings: §f${gridConfig.maxBeamDistance}m Reach §8| §b${gridConfig.requireFlashlightBattery ? `${gridConfig.batteryMinutes}m Battery` : "Infinite Battery"}`,
      "random.orb",
      1.25
    );
  });
}

function openGeneratorTuningModal(player) {
  const modal = new ModalFormData()
    .title("⚙ Generator Output & Visuals")
    .slider("Generator Capacity Multiplier (x Lamps)", 1, 5, {
      valueStep: 1,
      defaultValue: Number(gridConfig.generatorCapMultiplier) || 1,
    })
    .slider("Burner Fuel Duration Multiplier (x Time)", 1, 5, {
      valueStep: 1,
      defaultValue: Number(gridConfig.fuelDurationMultiplier) || 1,
    })
    .toggle("60-FPS 3D Spinning Turbine Rotors", {
      defaultValue: Boolean(gridConfig.enableAnimatedRotors),
    })
    .toggle("Smoke, Bubble & Wire Particles", {
      defaultValue: Boolean(gridConfig.enableParticles),
    });

  showFormSafe(modal, player, (res) => {
    if (!res || res.canceled || !Array.isArray(res.formValues)) return;
    const [capMult, fuelMult, animRotors, particles] = res.formValues;

    gridConfig.generatorCapMultiplier = Number(capMult) || 1;
    gridConfig.fuelDurationMultiplier = Number(fuelMult) || 1;
    gridConfig.enableAnimatedRotors = Boolean(animRotors);
    gridConfig.enableParticles = Boolean(particles);

    saveGridConfig();
    updatePowerGrid(0);
    sendFeedback(
      player,
      `§a✔ Saved Generator Tuning: §e${gridConfig.generatorCapMultiplier}x Capacity §8| §6${gridConfig.fuelDurationMultiplier}x Fuel`,
      "random.orb",
      1.25
    );
  });
}

function openQuickActionsForm(player) {
  const form = new ActionFormData()
    .title("🛠 Quick Grid Actions")
    .body("Choose a utility action for your world's power & lighting grid:")
    .button("🔋 Recharge My Flashlights to 100%")
    .button("⛽ Refill All Placed Fuel Generators to 100%")
    .button("🧹 Refresh Grid & Sweep Stray Light Blocks")
    .button("🔄 Reset All Settings to Default")
    .button("⬅ Back to Main Menu");

  showFormSafe(form, player, (res) => {
    if (!res || res.canceled) return;
    if (res.selection === 0) {
      const { eq } = getHeldEquipment(player);
      if (eq) {
        for (const slot of [EquipmentSlot.Mainhand, EquipmentSlot.Offhand]) {
          const it = eq.getEquipment(slot);
          if (it && (it.typeId === ITEM_ON || it.typeId === ITEM_OFF)) {
            writeBatteryTicksToItem(it, getMaxBatteryTicks());
            eq.setEquipment(slot, it);
          }
        }
      }
      playerBatteryState.set(player.id, {
        ticks: getMaxBatteryTicks(),
        lastSyncedMilestone: 10,
      });
      sendFeedback(player, "§a⚡ Flashlights Recharged to 100%!", "random.orb", 1.3);
    } else if (res.selection === 1) {
      let count = 0;
      for (const g of trackedGenerators.values()) {
        if (g.typeId === BLOCK_FUEL_GEN) {
          g.fuelTicks = MAX_FUEL_TICKS;
          g.enabled = true;
          count += 1;
        }
      }
      saveTrackedGenerators();
      updatePowerGrid(0);
      sendFeedback(
        player,
        `§a⛽ Refilled ${count} Fuel Generator(s) to 100%!`,
        "random.orb",
        1.25
      );
    } else if (res.selection === 2) {
      clearAllLightsImmediate();
      cableTopologyDirty = true;
      refreshAllConditionalPlugs();
      updatePowerGrid(0);
      sendFeedback(
        player,
        "§a🧹 Refreshed Power Grid & Swept All Light Blocks!",
        "random.orb",
        1.2
      );
    } else if (res.selection === 3) {
      gridConfig = { ...DEFAULT_CONFIG };
      cableTopologyDirty = true;
      playerPoseCache.clear();
      spotlightBeamCache.clear();
      saveGridConfig();
      refreshAllConditionalPlugs();
      updatePowerGrid(0);
      sendFeedback(
        player,
        "§e🔄 All Power & Lighting Settings Reset to Default!",
        "random.orb",
        1.1
      );
    } else if (res.selection === 4) {
      lastConfigOpenTick.delete(player.id);
      openConfiguratorHub(player);
    }
  });
}

function openBlockInspectorDialog(player, block) {
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  let body = `§7Block: §f${block.typeId}\n§7Location: §e(${block.x}, ${block.y}, ${block.z})\n§7Cable Rule: §b${describeCableArchShort()}\n\n`;

  if (isGeneratorBlockType(block.typeId)) {
    const g = trackedGenerators.get(key);
    if (g) {
      body += `§7Status: ${g.active ? "§aACTIVE (Generating)" : "§cOFFLINE / IDLE"}\n`;
      body += `§7Output Capacity: §b${g.capacity * 100}W §7(${g.usedLoad}/${g.capacity} Spotlights Used)\n`;
      if (g.typeId === BLOCK_FUEL_GEN) {
        const pct = Math.round((g.fuelTicks / MAX_FUEL_TICKS) * 100);
        const secs = Math.round(
          (g.fuelTicks / 20) * (gridConfig.fuelDurationMultiplier || 1)
        );
        body += `§7Fuel Tank: §6${pct}% §7(~${secs}s remaining)\n`;
      }
    }
  } else if (block.typeId === BLOCK_INPUT_PORT) {
    const p = trackedInputPorts.get(key);
    body += `§7Coupler State: ${p?.energized ? "§aENERGIZED (Feeding Cable Grid)" : "§cIDLE (Place Next to an Active Generator)"}\n`;
  } else if (block.typeId === BLOCK_SOCKET_HUB) {
    const h = trackedSocketHubs.get(key);
    const nGens = h?.feedGenKeys?.length || 0;
    body += `§7Outlet Status: ${h?.energized ? `§aLIVE (${nGens} Connected Generator${nGens === 1 ? "" : "s"})` : "§cUNPOWERED"}\n`;
    body += `§7Tip: §fUse Copper Wire Spool to hook Spotlights to this Socket Hub!\n`;
  } else if (isSpotlightBlockType(block.typeId)) {
    const s = trackedSpotlights.get(key);
    let sw = true;
    try {
      sw = Boolean(block.permutation.getState("flashlight:switched_on"));
    } catch {
      sw = true;
    }
    const powered = !gridConfig.requireSpotlightEnergy || Boolean(s?.powered);
    body += `§7Switch: ${sw ? "§aON" : "§cOFF"}\n`;
    body += `§7Energy Supply: ${powered ? `§aPOWERED (${!gridConfig.requireSpotlightEnergy ? "Free Mode" : s?.powerSource || "Active"})` : "§cNO POWER"}\n`;
    const linkedSrc = wireLinks.get(key);
    if (linkedSrc) {
      const isHub = trackedSocketHubs.has(linkedSrc);
      body += `§7Wire Spool Link: §e${isHub ? "Socket Hub" : "Generator"} @ ${linkedSrc.split("|")[1]}\n`;
    }
  }

  const msgForm = new MessageFormData()
    .title("🔍 Grid Block Diagnostic")
    .body(body)
    .button1("Close")
    .button2("Open Global Settings");

  showFormSafe(msgForm, player, (res) => {
    if (res && !res.canceled && res.selection === 1) {
      lastConfigOpenTick.delete(player.id);
      openConfiguratorHub(player);
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                Block Registration & Player Interaction Logic               */
/* -------------------------------------------------------------------------- */

function getHeldEquipment(player) {
  try {
    const eq = player.getComponent(EntityComponentTypes.Equippable);
    if (!eq) return { eq: null, main: null, off: null };
    return {
      eq,
      main: eq.getEquipment(EquipmentSlot.Mainhand),
      off: eq.getEquipment(EquipmentSlot.Offhand),
    };
  } catch {
    return { eq: null, main: null, off: null };
  }
}

function isHoldingConfigurator(player) {
  if (!player) return false;
  const { main, off } = getHeldEquipment(player);
  return (
    main?.typeId === ITEM_CONFIGURATOR || off?.typeId === ITEM_CONFIGURATOR
  );
}

function registerSpotlightBlock(block) {
  if (!block || !isSpotlightBlockType(block.typeId)) return;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  if (!trackedSpotlights.has(key)) {
    trackedSpotlights.set(key, {
      dimId,
      x: block.x,
      y: block.y,
      z: block.z,
      powered: false,
    });
  }
  spotlightBeamCache.delete(key);
  cableTopologyDirty = true;
  updateNeighborsAround(block.dimension, block.x, block.y, block.z);
  saveTrackedSpotlights();
  updatePowerGrid(0);
}

function unregisterSpotlightBlock(dim, dimId, x, y, z) {
  const key = makeKey(dimId, x, y, z);
  trackedSpotlights.delete(key);
  spotlightBeamCache.delete(key);
  if (wireLinks.delete(key)) saveWireLinks();
  cableTopologyDirty = true;
  updateNeighborsAround(dim, x, y, z);
  saveTrackedSpotlights();
}

function registerGeneratorBlock(block) {
  if (!block || !isGeneratorBlockType(block.typeId)) return;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  if (!trackedGenerators.has(key)) {
    trackedGenerators.set(key, {
      dimId,
      x: block.x,
      y: block.y,
      z: block.z,
      typeId: block.typeId,
      fuelTicks: 0,
      enabled: true,
      bufferTicks: 0,
      active: false,
      capacity: 0,
      usedLoad: 0,
    });
  }
  cableTopologyDirty = true;
  updateNeighborsAround(block.dimension, block.x, block.y, block.z);
  saveTrackedGenerators();
  updatePowerGrid(0);
}

function unregisterGeneratorBlock(dim, dimId, x, y, z) {
  const key = makeKey(dimId, x, y, z);
  trackedGenerators.delete(key);
  despawnRotorForKey(key, dim, x, y, z);

  let wiresChanged = false;
  for (const [sKey, srcKey] of [...wireLinks.entries()]) {
    if (srcKey === key) {
      wireLinks.delete(sKey);
      wiresChanged = true;
    }
  }
  if (wiresChanged) saveWireLinks();

  cableTopologyDirty = true;
  updateNeighborsAround(dim, x, y, z);
  saveTrackedGenerators();
  updatePowerGrid(0);
}

function registerCableBlock(block) {
  if (!block || block.typeId !== BLOCK_POWER_CABLE) return;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  trackedCables.set(key, { dimId, x: block.x, y: block.y, z: block.z });
  cableTopologyDirty = true;
  updateNeighborsAround(block.dimension, block.x, block.y, block.z);
  saveTrackedCables();
  updatePowerGrid(0);
}

function unregisterCableBlock(dim, dimId, x, y, z) {
  const key = makeKey(dimId, x, y, z);
  trackedCables.delete(key);
  cableTopologyDirty = true;
  updateNeighborsAround(dim, x, y, z);
  saveTrackedCables();
  updatePowerGrid(0);
}

function registerInputPortBlock(block) {
  if (!block || block.typeId !== BLOCK_INPUT_PORT) return;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  trackedInputPorts.set(key, {
    dimId,
    x: block.x,
    y: block.y,
    z: block.z,
    energized: false,
  });
  cableTopologyDirty = true;
  updateNeighborsAround(block.dimension, block.x, block.y, block.z);
  saveTrackedInputPorts();
  updatePowerGrid(0);
}

function unregisterInputPortBlock(dim, dimId, x, y, z) {
  const key = makeKey(dimId, x, y, z);
  trackedInputPorts.delete(key);
  cableTopologyDirty = true;
  updateNeighborsAround(dim, x, y, z);
  saveTrackedInputPorts();
  updatePowerGrid(0);
}

function registerSocketHubBlock(block) {
  if (!block || block.typeId !== BLOCK_SOCKET_HUB) return;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  trackedSocketHubs.set(key, {
    dimId,
    x: block.x,
    y: block.y,
    z: block.z,
    energized: false,
    feedGenKeys: [],
  });
  cableTopologyDirty = true;
  updateNeighborsAround(block.dimension, block.x, block.y, block.z);
  saveTrackedSocketHubs();
  updatePowerGrid(0);
}

function unregisterSocketHubBlock(dim, dimId, x, y, z) {
  const key = makeKey(dimId, x, y, z);
  trackedSocketHubs.delete(key);

  let wiresChanged = false;
  for (const [sKey, srcKey] of [...wireLinks.entries()]) {
    if (srcKey === key) {
      wireLinks.delete(sKey);
      wiresChanged = true;
    }
  }
  if (wiresChanged) saveWireLinks();

  cableTopologyDirty = true;
  updateNeighborsAround(dim, x, y, z);
  saveTrackedSocketHubs();
  updatePowerGrid(0);
}

function sendFeedback(player, msg, soundId, pitch = 1.0) {
  if (!player) return;
  try {
    if (soundId) player.playSound(soundId, { pitch, volume: 0.75 });
    player.onScreenDisplay.setActionBar(msg);
  } catch {
    // Ignore
  }
}

function handleInputPortInteract(event) {
  const block = event.block;
  if (!block || block.typeId !== BLOCK_INPUT_PORT) return;
  const player = event.player;
  const key = makeKey(block.dimension.id, block.x, block.y, block.z);
  if (!trackedInputPorts.has(key)) registerInputPortBlock(block);

  if (player && isHoldingConfigurator(player)) {
    updatePowerGrid(0);
    if (player.isSneaking) openBlockInspectorDialog(player, block);
    else openConfiguratorHub(player);
    return;
  }

  updatePowerGrid(0);
  const p = trackedInputPorts.get(key);
  sendFeedback(
    player,
    p?.energized
      ? "§6⚡ Power Input Port: §aCOUPLED & ENERGIZED §7(Feeding 3D Cable Grid)"
      : "§7⚡ Power Input Port: §cIDLE §7(Place Adjacent to an Active Generator)",
    "random.click",
    p?.energized ? 1.25 : 0.85
  );
}

function handleSocketHubInteract(event) {
  const block = event.block;
  if (!block || block.typeId !== BLOCK_SOCKET_HUB) return;

  const player = event.player;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);
  if (!trackedSocketHubs.has(key)) registerSocketHubBlock(block);
  const hub = trackedSocketHubs.get(key);

  if (player && isHoldingConfigurator(player)) {
    updatePowerGrid(0);
    if (player.isSneaking) openBlockInspectorDialog(player, block);
    else openConfiguratorHub(player);
    return;
  }

  const { eq, main, off } = player
    ? getHeldEquipment(player)
    : { eq: null, main: null, off: null };

  // 1. Holding Copper Wire Spool -> Select this Electric Socket Hub as power outlet!
  if (
    player &&
    (main?.typeId === ITEM_WIRE_SPOOL || off?.typeId === ITEM_WIRE_SPOOL)
  ) {
    if (!gridConfig.enableWireSpool) {
      sendFeedback(
        player,
        "§c⚡ Wire Spool Links are disabled in Power Grid Configurator!",
        "random.click",
        0.75
      );
      return;
    }
    pendingWireSelection.set(player.id, key);
    sendFeedback(
      player,
      `§e⚡ Wire Spool: §fElectric Socket Hub Selected (${block.x}, ${block.y}, ${block.z}) §7— Click a Spotlight (≤${gridConfig.wireSpoolRange}m)!`,
      "random.click",
      1.35
    );
    return;
  }

  // 2. Holding Flashlight -> Recharge battery straight from the energized wall/floor Socket Hub!
  const flashSlot =
    main && (main.typeId === ITEM_ON || main.typeId === ITEM_OFF)
      ? EquipmentSlot.Mainhand
      : off && (off.typeId === ITEM_ON || off.typeId === ITEM_OFF)
      ? EquipmentSlot.Offhand
      : null;

  if (player && eq && flashSlot) {
    updatePowerGrid(0);
    if (!hub?.energized) {
      sendFeedback(
        player,
        "§c⚡ Socket Hub Unpowered! §7Connect 3D Power Cables from an Active Generator.",
        "random.click",
        0.7
      );
      return;
    }
    // Deduct small fuel cost if backed by a Fuel Generator
    for (const gk of hub.feedGenKeys || []) {
      const g = trackedGenerators.get(gk);
      if (g && g.active && g.typeId === BLOCK_FUEL_GEN) {
        g.fuelTicks = Math.max(0, g.fuelTicks - 800);
        saveTrackedGenerators();
        break;
      }
    }
    const heldFlash = eq.getEquipment(flashSlot);
    const maxBat = getMaxBatteryTicks();
    writeBatteryTicksToItem(heldFlash, maxBat);
    eq.setEquipment(flashSlot, heldFlash);
    playerBatteryState.set(player.id, {
      ticks: maxBat,
      lastSyncedMilestone: 10,
    });
    lastToggleTick.set(player.id, system.currentTick);
    sendFeedback(
      player,
      "§a⚡ Flashlight Recharged to 100% at Electric Socket Hub!",
      "random.orb",
      1.3
    );
    return;
  }

  // 3. Status Readout
  updatePowerGrid(0);
  if (hub?.energized) {
    let freeUnits = 0;
    for (const gk of hub.feedGenKeys || []) {
      const g = trackedGenerators.get(gk);
      if (g && g.active) freeUnits += Math.max(0, g.capacity - g.usedLoad);
    }
    sendFeedback(
      player,
      `§e⚡ Electric Socket Hub: §aLIVE §7(${freeUnits * 100}W Available — Hook Spotlights with Wire Spool!)`,
      "random.click",
      1.25
    );
  } else {
    sendFeedback(
      player,
      "§c⚡ Electric Socket Hub: NO POWER §7(Connect 3D Cables to an Active Generator / Input Port)",
      "random.click",
      0.8
    );
  }
}

function handleGeneratorInteract(event) {
  const block = event.block;
  if (!block || !isGeneratorBlockType(block.typeId)) return;

  const player = event.player;
  const dim = block.dimension;
  const dimId = dim.id;
  const key = makeKey(dimId, block.x, block.y, block.z);

  if (!trackedGenerators.has(key)) {
    registerGeneratorBlock(block);
  }
  const gen = trackedGenerators.get(key);
  if (!gen) return;

  if (player && isHoldingConfigurator(player)) {
    updatePowerGrid(0);
    if (player.isSneaking) openBlockInspectorDialog(player, block);
    else openConfiguratorHub(player);
    return;
  }

  const { eq, main, off } = player
    ? getHeldEquipment(player)
    : { eq: null, main: null, off: null };

  // 1. Holding Wire Spool -> Select Generator (unless Strict Mode 1 requires using Electric Socket Hubs!)
  if (
    player &&
    (main?.typeId === ITEM_WIRE_SPOOL || off?.typeId === ITEM_WIRE_SPOOL)
  ) {
    if (!gridConfig.enableWireSpool) {
      sendFeedback(
        player,
        "§c⚡ Wire Spool Links are disabled in Power Grid Configurator!",
        "random.click",
        0.75
      );
      return;
    }
    if (Number(gridConfig.cableArchitectureMode) === 1) {
      sendFeedback(
        player,
        "§e⚡ Strict Port Mode: §7Connect Generator -> Input Port -> 3D Cables -> Electric Socket Hub, then hook Wire Spool to the Socket Hub!",
        "random.click",
        0.85
      );
      return;
    }
    pendingWireSelection.set(player.id, key);
    sendFeedback(
      player,
      `§e⚡ Wire Spool: §fGenerator Selected (${block.x}, ${block.y}, ${block.z}) §7— Click a Spotlight (≤${gridConfig.wireSpoolRange}m)`,
      "random.click",
      1.35
    );
    return;
  }

  // 2. Holding Flashlight -> Recharge battery to 100%
  const flashSlot =
    main && (main.typeId === ITEM_ON || main.typeId === ITEM_OFF)
      ? EquipmentSlot.Mainhand
      : off && (off.typeId === ITEM_ON || off.typeId === ITEM_OFF)
      ? EquipmentSlot.Offhand
      : null;

  if (player && eq && flashSlot) {
    const heldFlash = eq.getEquipment(flashSlot);
    updatePowerGrid(0);
    if (!gen.active) {
      sendFeedback(
        player,
        "§c⚡ Generator Offline! §7Activate or fuel this generator to recharge your Flashlight.",
        "random.click",
        0.7
      );
      return;
    }
    if (gen.typeId === BLOCK_FUEL_GEN) {
      gen.fuelTicks = Math.max(0, gen.fuelTicks - 800);
      saveTrackedGenerators();
    }
    const maxBat = getMaxBatteryTicks();
    writeBatteryTicksToItem(heldFlash, maxBat);
    eq.setEquipment(flashSlot, heldFlash);
    playerBatteryState.set(player.id, {
      ticks: maxBat,
      lastSyncedMilestone: 10,
    });
    lastToggleTick.set(player.id, system.currentTick);
    sendFeedback(
      player,
      "§a⚡ Tactical Flashlight Recharged to 100%!",
      "random.orb",
      1.25
    );
    return;
  }

  // 3. Sneak + Interact -> Rotate rotatable generator 90 deg!
  if (player && player.isSneaking && gen.typeId !== BLOCK_WATER_TURBINE) {
    try {
      const perm = block.permutation;
      const curDir = String(
        perm.getState("minecraft:cardinal_direction") || "north"
      );
      const idx = CARDINAL_ROTATION_ORDER.indexOf(curDir);
      const nextDir =
        CARDINAL_ROTATION_ORDER[
          (idx >= 0 ? idx + 1 : 1) % CARDINAL_ROTATION_ORDER.length
        ];
      block.setPermutation(
        perm.withState("minecraft:cardinal_direction", nextDir)
      );
      refreshMachineConditionalPlugs(dim, block.x, block.y, block.z);
      updatePowerGrid(0);
      sendFeedback(
        player,
        `§eGenerator Oriented: §f${nextDir.toUpperCase()}`,
        "random.click",
        1.15
      );
      return;
    } catch {
      // Fallthrough
    }
  }

  // 4. Starter Burner Fuel Generator
  if (gen.typeId === BLOCK_FUEL_GEN) {
    const fuelInfo = main ? getFuelInfo(main.typeId) : null;
    if (fuelInfo && player && eq) {
      if (gen.fuelTicks >= MAX_FUEL_TICKS - 40) {
        sendFeedback(
          player,
          `§e⛽ Fuel Tank Full! §a(100% | Load: ${gen.usedLoad}/${gen.capacity || 3} Spotlights)`,
          "random.click",
          1.1
        );
        return;
      }

      gen.fuelTicks = Math.min(MAX_FUEL_TICKS, gen.fuelTicks + fuelInfo.ticks);
      gen.enabled = true;

      let isCreative = false;
      try {
        if (typeof player.getGameMode === "function") {
          isCreative = String(player.getGameMode()).toLowerCase() === "creative";
        }
      } catch {
        isCreative = false;
      }

      if (!isCreative) {
        if (fuelInfo.returnItem) {
          eq.setEquipment(
            EquipmentSlot.Mainhand,
            new ItemStack(fuelInfo.returnItem, 1)
          );
        } else if (main.amount > 1) {
          main.amount -= 1;
          eq.setEquipment(EquipmentSlot.Mainhand, main);
        } else {
          eq.setEquipment(EquipmentSlot.Mainhand, undefined);
        }
      }

      saveTrackedGenerators();
      updatePowerGrid(0);
      const pct = Math.round((gen.fuelTicks / MAX_FUEL_TICKS) * 100);
      sendFeedback(
        player,
        `§6🔥 Fuel Added! §eTank: §a${pct}% §7| §fLoad: ${gen.usedLoad}/${gen.capacity} Spotlights`,
        "mob.blaze.shoot",
        1.1
      );
      return;
    }

    if (gen.fuelTicks <= 0) {
      sendFeedback(
        player,
        "§c⛽ Out of Fuel! §7Right-click with Coal, Charcoal, Planks, Logs, or Lava Bucket",
        "random.click",
        0.75
      );
      return;
    }

    gen.enabled = !gen.enabled;
    saveTrackedGenerators();
    updatePowerGrid(0);
    const pct = Math.round((gen.fuelTicks / MAX_FUEL_TICKS) * 100);
    sendFeedback(
      player,
      gen.enabled
        ? `§a⚡ Burner Generator: RUNNING §7(Fuel: ${pct}% | Load: ${gen.usedLoad}/${gen.capacity} Lamps)`
        : `§e⏸ Burner Generator: STANDBY §7(Fuel Saved: ${pct}%)`,
      "random.click",
      gen.enabled ? 1.3 : 0.85
    );
    return;
  }

  // 5. Renewable Status Readout
  updatePowerGrid(0);
  if (gen.typeId === BLOCK_SOLAR_PANEL) {
    sendFeedback(
      player,
      gen.active
        ? `§b☀ Solar Panel: §aGENERATING ${gen.capacity * 100}W §7(Load: ${gen.usedLoad}/${gen.capacity} Lamps)`
        : "§7🌙 Solar Panel: §cIDLE §7(Requires Daytime & Clear Sky Above)",
      "random.click",
      1.15
    );
  } else if (gen.typeId === BLOCK_WIND_TURBINE) {
    sendFeedback(
      player,
      gen.active
        ? `§b🌬 Wind Turbine: §aSPINNING ${gen.capacity * 100}W §7(Load: ${gen.usedLoad}/${gen.capacity} Lamps)`
        : "§c🌬 Wind Turbine Blocked! §7Needs ≥3 Air Blocks in Front & Open Sky",
      "random.click",
      1.15
    );
  } else if (gen.typeId === BLOCK_WATER_TURBINE) {
    sendFeedback(
      player,
      gen.active
        ? `§b🌊 Hydro Turbine: §aSPINNING ${gen.capacity * 100}W §7(Load: ${gen.usedLoad}/${gen.capacity} Lamps)`
        : "§c🌊 Hydro Turbine Dry! §7Place Water Beside or Beneath the Turbine",
      "random.click",
      1.15
    );
  }
}

function handleSpotlightInteract(event) {
  const block = event.block;
  if (!block || !isSpotlightBlockType(block.typeId)) return;

  const player = event.player;
  const dimId = block.dimension.id;
  const key = makeKey(dimId, block.x, block.y, block.z);

  if (!trackedSpotlights.has(key)) {
    registerSpotlightBlock(block);
  }
  const spotEntry = trackedSpotlights.get(key);

  if (player && isHoldingConfigurator(player)) {
    updatePowerGrid(0);
    if (player.isSneaking) openBlockInspectorDialog(player, block);
    else openConfiguratorHub(player);
    return;
  }

  spotlightBeamCache.delete(key);

  const { main, off } = player
    ? getHeldEquipment(player)
    : { main: null, off: null };

  // 1. Holding Copper Wire Spool -> Link / Unlink Spotlight to selected Generator OR Electric Socket Hub!
  if (
    player &&
    (main?.typeId === ITEM_WIRE_SPOOL || off?.typeId === ITEM_WIRE_SPOOL)
  ) {
    if (!gridConfig.enableWireSpool) {
      sendFeedback(
        player,
        "§c⚡ Wire Spool Links are disabled in Power Grid Configurator!",
        "random.click",
        0.75
      );
      return;
    }

    if (player.isSneaking) {
      if (wireLinks.delete(key)) {
        saveWireLinks();
        updatePowerGrid(0);
        sendFeedback(
          player,
          "§e⚡ Wire Spool: §cUnlinked Spotlight Wire",
          "random.click",
          0.85
        );
      } else {
        sendFeedback(
          player,
          "§7⚡ Spotlight has no Wire Spool link to remove.",
          "random.click",
          0.85
        );
      }
      return;
    }

    const selSrcKey = pendingWireSelection.get(player.id);
    const srcGen = selSrcKey ? trackedGenerators.get(selSrcKey) : null;
    const srcHub = selSrcKey ? trackedSocketHubs.get(selSrcKey) : null;
    const srcObj = srcHub || srcGen;

    if (!selSrcKey || !srcObj) {
      sendFeedback(
        player,
        "§e⚡ Wire Spool: §7Click an Electric Socket Hub (or Generator) first, then click this Spotlight!",
        "random.click",
        0.9
      );
      return;
    }

    if (srcGen && Number(gridConfig.cableArchitectureMode) === 1) {
      sendFeedback(
        player,
        "§c⚡ Strict Port Mode: §7Hook Spotlights to an Electric Socket Hub instead of directly to a Generator!",
        "random.click",
        0.75
      );
      return;
    }

    if (srcObj.dimId !== dimId) {
      sendFeedback(
        player,
        "§c⚡ Wire Spool: Power source must be in the same dimension!",
        "random.click",
        0.75
      );
      return;
    }

    const maxSpan = Number(gridConfig.wireSpoolRange) || 24;
    const dist = Math.hypot(
      srcObj.x - block.x,
      srcObj.y - block.y,
      srcObj.z - block.z
    );
    if (dist > maxSpan + 0.5) {
      sendFeedback(
        player,
        `§c⚡ Too Far (${dist.toFixed(1)}m)! §7Max Wire Spool span is ${maxSpan}m.`,
        "random.click",
        0.75
      );
      return;
    }

    if (wireLinks.get(key) === selSrcKey) {
      wireLinks.delete(key);
      saveWireLinks();
      updatePowerGrid(0);
      sendFeedback(
        player,
        "§e⚡ Wire Spool: §cDisconnected Wire Link",
        "random.click",
        0.9
      );
    } else {
      wireLinks.set(key, selSrcKey);
      saveWireLinks();
      updatePowerGrid(0);
      sendFeedback(
        player,
        `§a⚡ Hooked Spotlight to ${srcHub ? "Electric Socket Hub" : "Generator"}! §7(${dist.toFixed(1)}m)`,
        "random.orb",
        1.3
      );
    }
    return;
  }

  // 2. Sneak + Interact -> Rotate Spotlight 90 deg clockwise!
  try {
    const perm = block.permutation;
    if (player && player.isSneaking) {
      const curDir = String(
        perm.getState("minecraft:cardinal_direction") || "north"
      );
      const idx = CARDINAL_ROTATION_ORDER.indexOf(curDir);
      const nextDir =
        CARDINAL_ROTATION_ORDER[
          (idx >= 0 ? idx + 1 : 1) % CARDINAL_ROTATION_ORDER.length
        ];
      block.setPermutation(
        perm.withState("minecraft:cardinal_direction", nextDir)
      );
      refreshMachineConditionalPlugs(block.dimension, block.x, block.y, block.z);
      sendFeedback(
        player,
        `§eSpotlight Aimed: §f${nextDir.toUpperCase()}`,
        "random.click",
        1.15
      );
      return;
    }

    // 3. Normal Interact -> Toggle Spotlight Switch ON / OFF!
    const curSwitched = perm.getState("flashlight:switched_on");
    const nextSwitched = !(curSwitched === undefined ? true : Boolean(curSwitched));
    block.setPermutation(
      perm.withState("flashlight:switched_on", nextSwitched)
    );
    updatePowerGrid(0);

    if (!nextSwitched) {
      sendFeedback(
        player,
        "§7Construction Spotlight: §cSWITCHED OFF",
        "random.click",
        0.85
      );
    } else if (!gridConfig.requireSpotlightEnergy || (spotEntry && spotEntry.powered)) {
      sendFeedback(
        player,
        `§eConstruction Spotlight: §aON §7(${!gridConfig.requireSpotlightEnergy ? "Free Power Mode" : spotEntry?.powerSource || "Powered"})`,
        "random.click",
        1.35
      );
    } else {
      sendFeedback(
        player,
        `§c⚡ No Energy! §7Active rules: ${describeActiveDeliveryModes()}`,
        "random.click",
        0.75
      );
    }
  } catch {
    // Ignore
  }
}

/* -------------------------------------------------------------------------- */
/*             Unified Energy Evaluation & Multi-Architecture Grid            */
/* -------------------------------------------------------------------------- */

function hasClearSkyAbove(dim, x, startY, z) {
  const maxH = dim.heightRange ? dim.heightRange.max : 320;
  for (let y = startY; y < maxH; y += 1) {
    const b = safeGetBlock(dim, x, y, z);
    if (!b) return true;
    if (!isSunlightTransparentType(b.typeId)) return false;
    if (y - startY > 48) y += 3;
  }
  return true;
}

function evaluateSingleGenerator(genKey, gen, elapsedTicks) {
  let dim;
  try {
    dim = world.getDimension(gen.dimId);
  } catch {
    return { exists: false };
  }

  const block = safeGetBlock(dim, gen.x, gen.y, gen.z);
  if (!block) return { exists: true, unloaded: true };

  if (!isGeneratorBlockType(block.typeId)) {
    despawnRotorForKey(genKey, dim, gen.x, gen.y, gen.z);
    return { exists: false };
  }

  gen.typeId = block.typeId;
  let cardinal = "north";
  try {
    if (gen.typeId !== BLOCK_WATER_TURBINE) {
      cardinal = String(
        block.permutation.getState("minecraft:cardinal_direction") || "north"
      );
    }
  } catch {
    cardinal = "north";
  }

  const capMult = Math.max(1, Number(gridConfig.generatorCapMultiplier) || 1);
  const fuelMult = Math.max(1, Number(gridConfig.fuelDurationMultiplier) || 1);

  let isActive = false;
  let baseCap = 0;
  let stateDirty = false;

  if (gen.typeId === BLOCK_FUEL_GEN) {
    if (gen.enabled && gen.fuelTicks > 0) {
      const burnRate = (gen.usedLoad > 0 ? 1.0 : 0.5) / fuelMult;
      if (elapsedTicks > 0) {
        gen.fuelTicks = Math.max(0, gen.fuelTicks - elapsedTicks * burnRate);
        stateDirty = true;
      }
      isActive = gen.fuelTicks > 0;
      baseCap = isActive ? 3 : 0;
    }

    if (
      isActive &&
      gridConfig.enableParticles &&
      system.currentTick % 20 === 0 &&
      typeof dim.spawnParticle === "function"
    ) {
      const vec = CARDINAL_VECTORS[cardinal] || CARDINAL_VECTORS.north;
      const rx = -vec.fz;
      const rz = vec.fx;
      try {
        dim.spawnParticle("minecraft:basic_smoke_particle", {
          x: gen.x + 0.5 - vec.fx * 0.29 - rx * 0.27,
          y: gen.y + 1.04,
          z: gen.z + 0.5 - vec.fz * 0.29 - rz * 0.27,
        });
      } catch {
        // Ignore
      }
    }
  } else if (gen.typeId === BLOCK_SOLAR_PANEL) {
    let sunAvailable = false;
    if (gen.dimId === "minecraft:overworld") {
      let tod = 6000;
      try {
        if (typeof world.getTimeOfDay === "function") {
          tod = world.getTimeOfDay() % 24000;
        }
      } catch {
        tod = 6000;
      }
      const isDay = (tod >= 0 && tod <= 12500) || tod >= 23500;
      if (isDay && hasClearSkyAbove(dim, gen.x, gen.y + 1, gen.z)) {
        sunAvailable = true;
      }
    }

    if (sunAvailable) {
      if (gen.bufferTicks !== SOLAR_BUFFER_MAX_TICKS) {
        gen.bufferTicks = SOLAR_BUFFER_MAX_TICKS;
        stateDirty = true;
      }
      isActive = true;
      baseCap = 2;
    } else if (gen.bufferTicks > 0) {
      if (elapsedTicks > 0) {
        gen.bufferTicks = Math.max(0, gen.bufferTicks - elapsedTicks);
        stateDirty = true;
      }
      isActive = gen.bufferTicks > 0;
      baseCap = isActive ? 2 : 0;
    }
  } else if (gen.typeId === BLOCK_WIND_TURBINE) {
    const vec = CARDINAL_VECTORS[cardinal] || CARDINAL_VECTORS.north;
    let frontClear = true;
    for (let step = 1; step <= 3; step++) {
      for (const dy of [1, 2]) {
        const fb = safeGetBlock(
          dim,
          gen.x + vec.fx * step,
          gen.y + dy,
          gen.z + vec.fz * step
        );
        if (fb && !isAirType(fb.typeId) && !isLightBlockType(fb.typeId)) {
          frontClear = false;
          break;
        }
      }
      if (!frontClear) break;
    }
    const topOpen = hasClearSkyAbove(dim, gen.x, gen.y + 2, gen.z);
    isActive = frontClear && topOpen;
    baseCap = isActive ? (gen.y >= 85 ? 4 : 3) : 0;

    if (isActive && gridConfig.enableAnimatedRotors) {
      ensureRotorEntity(genKey, dim, gen, cardinal);
    } else {
      despawnRotorForKey(genKey, dim, gen.x, gen.y, gen.z);
    }
  } else if (gen.typeId === BLOCK_WATER_TURBINE) {
    let waterCount = 0;
    for (const [dx, dy, dz] of [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 0, 1],
      [0, 0, -1],
      [0, -1, 0],
    ]) {
      const wb = safeGetBlock(dim, gen.x + dx, gen.y + dy, gen.z + dz);
      if (isWaterBlock(wb)) waterCount += 1;
    }
    isActive = waterCount >= 1;
    baseCap = isActive ? (waterCount >= 2 ? 4 : 3) : 0;

    if (isActive && gridConfig.enableAnimatedRotors) {
      ensureRotorEntity(genKey, dim, gen, "north");
      if (
        gridConfig.enableParticles &&
        system.currentTick % 20 === 0 &&
        typeof dim.spawnParticle === "function"
      ) {
        try {
          dim.spawnParticle("minecraft:bubble_column_up_particle", {
            x: gen.x + 0.5,
            y: gen.y + 0.35,
            z: gen.z + 0.5,
          });
        } catch {
          // Ignore
        }
      }
    } else {
      despawnRotorForKey(genKey, dim, gen.x, gen.y, gen.z);
    }
  }

  gen.active = isActive;
  gen.capacity = baseCap * capMult;

  const visualBlockActive =
    gen.typeId === BLOCK_WIND_TURBINE || gen.typeId === BLOCK_WATER_TURBINE
      ? Boolean(isActive && gridConfig.enableAnimatedRotors)
      : isActive;

  try {
    const perm = block.permutation;
    if (Boolean(perm.getState("flashlight:active")) !== visualBlockActive) {
      block.setPermutation(perm.withState("flashlight:active", visualBlockActive));
    }
  } catch {
    // Ignore
  }

  return { exists: true, unloaded: false, stateDirty };
}

function updatePowerGrid(elapsedTicks = 10) {
  let generatorsMutated = false;

  // 1. Evaluate all placed Generators
  /** @type {Map<string, number>} */
  const remainingCap = new Map();
  for (const [gKey, gen] of [...trackedGenerators.entries()]) {
    const res = evaluateSingleGenerator(gKey, gen, elapsedTicks);
    if (!res.exists) {
      trackedGenerators.delete(gKey);
      generatorsMutated = true;
      continue;
    }
    if (res.stateDirty) generatorsMutated = true;
    gen.usedLoad = 0;
    if (!res.unloaded && gen.active && gen.capacity > 0) {
      remainingCap.set(gKey, gen.capacity);
    }
  }

  // 2. Gather Spotlights
  /** @type {Map<string, { entry: any, block: any, switchedOn: boolean, powered: boolean, source: string }>} */
  const spotStates = new Map();
  let spotlightsMutated = false;

  for (const [sKey, sEntry] of [...trackedSpotlights.entries()]) {
    let dim;
    try {
      dim = world.getDimension(sEntry.dimId);
    } catch {
      trackedSpotlights.delete(sKey);
      spotlightsMutated = true;
      continue;
    }
    const b = safeGetBlock(dim, sEntry.x, sEntry.y, sEntry.z);
    if (!b) continue;
    if (!isSpotlightBlockType(b.typeId)) {
      trackedSpotlights.delete(sKey);
      spotlightBeamCache.delete(sKey);
      spotlightsMutated = true;
      continue;
    }
    let sw = true;
    try {
      const st = b.permutation.getState("flashlight:switched_on");
      sw = st === undefined ? true : Boolean(st);
    } catch {
      sw = true;
    }
    const freePower = !gridConfig.requireSpotlightEnergy;
    spotStates.set(sKey, {
      entry: sEntry,
      block: b,
      switchedOn: sw,
      powered: freePower,
      source: freePower ? "Free Power Mode" : "",
    });
  }

  // Reset Socket Hubs & Input Ports before BFS
  for (const ip of trackedInputPorts.values()) ip.energized = false;
  for (const sh of trackedSocketHubs.values()) {
    sh.energized = false;
    sh.feedGenKeys = [];
  }

  // 3. Build unified Conduit Node Pool (Cables + Input Ports + Socket Hubs) & run BFS
  /** @type {Map<string, { dimId: string, x: number, y: number, z: number, kind: string }>} */
  const allConduitNodes = new Map();
  let cablesMutated = false;
  let portsMutated = false;
  let hubsMutated = false;

  for (const [k, v] of [...trackedCables.entries()]) {
    allConduitNodes.set(k, { ...v, kind: BLOCK_POWER_CABLE });
  }
  for (const [k, v] of [...trackedInputPorts.entries()]) {
    allConduitNodes.set(k, { ...v, kind: BLOCK_INPUT_PORT });
  }
  for (const [k, v] of [...trackedSocketHubs.entries()]) {
    allConduitNodes.set(k, { ...v, kind: BLOCK_SOCKET_HUB });
  }

  // Direct Generator <-> Spotlight side-by-side touch (allowed when direct cable plugs allowed)
  if (
    gridConfig.requireSpotlightEnergy &&
    canCableTouchGeneratorDirectly() &&
    canCableTouchSpotlightDirectly()
  ) {
    for (const [sKey, st] of spotStates.entries()) {
      if (!st.switchedOn || st.powered) continue;
      const { dimId, x, y, z } = st.entry;
      for (const nb of SIX_NEIGHBORS) {
        const adjGKey = makeKey(dimId, x + nb.dx, y + nb.dy, z + nb.dz);
        const rem = remainingCap.get(adjGKey) || 0;
        if (rem > 0) {
          remainingCap.set(adjGKey, rem - 1);
          const g = trackedGenerators.get(adjGKey);
          if (g) g.usedLoad += 1;
          st.powered = true;
          st.source = "Direct Touch";
          break;
        }
      }
    }
  }

  const visitedConduits = new Set();
  for (const [startKey, startNode] of allConduitNodes.entries()) {
    if (visitedConduits.has(startKey)) continue;
    let dim;
    try {
      dim = world.getDimension(startNode.dimId);
    } catch {
      continue;
    }

    const startBlock = safeGetBlock(dim, startNode.x, startNode.y, startNode.z);
    if (!startBlock) continue; // Unloaded chunk
    if (startBlock.typeId !== startNode.kind) {
      if (startNode.kind === BLOCK_POWER_CABLE) {
        trackedCables.delete(startKey);
        cablesMutated = true;
      } else if (startNode.kind === BLOCK_INPUT_PORT) {
        trackedInputPorts.delete(startKey);
        portsMutated = true;
      } else if (startNode.kind === BLOCK_SOCKET_HUB) {
        trackedSocketHubs.delete(startKey);
        hubsMutated = true;
      }
      continue;
    }

    const compNodes = [];
    const feedGenKeys = new Set();
    const directSpotKeys = new Set();
    const queue = [startKey];
    visitedConduits.add(startKey);

    while (queue.length > 0 && compNodes.length < MAX_CABLE_BFS_NODES) {
      const curKey = queue.shift();
      const cur = allConduitNodes.get(curKey);
      if (!cur) continue;
      compNodes.push({ key: curKey, ...cur });

      for (const nb of SIX_NEIGHBORS) {
        const nx = cur.x + nb.dx;
        const ny = cur.y + nb.dy;
        const nz = cur.z + nb.dz;
        const nKey = makeKey(cur.dimId, nx, ny, nz);

        // Check adjacent Generator:
        // - Always accepted if touching a Power Input Port!
        // - Accepted if touching Cable / Socket Hub when canCableTouchGeneratorDirectly()!
        if (trackedGenerators.has(nKey)) {
          if (
            cur.kind === BLOCK_INPUT_PORT ||
            canCableTouchGeneratorDirectly()
          ) {
            feedGenKeys.add(nKey);
          }
        }

        // Check adjacent Spotlight (direct conduit feed when canCableTouchSpotlightDirectly())
        if (spotStates.has(nKey) && canCableTouchSpotlightDirectly()) {
          directSpotKeys.add(nKey);
        }

        // Traverse connected conduit blocks (Cable <-> Input Port <-> Socket Hub)
        if (allConduitNodes.has(nKey) && !visitedConduits.has(nKey)) {
          const nbNode = allConduitNodes.get(nKey);
          const nbBlock = safeGetBlock(dim, nx, ny, nz);
          if (nbBlock && nbBlock.typeId === nbNode.kind) {
            visitedConduits.add(nKey);
            queue.push(nKey);
          }
        }
      }
    }

    const activeFeedGens = gridConfig.enablePowerCables
      ? [...feedGenKeys].filter((gk) => trackedGenerators.get(gk)?.active)
      : [];
    const networkEnergized = activeFeedGens.length > 0;

    // Record energized state on Input Ports & Socket Hubs in this component
    for (const cn of compNodes) {
      if (cn.kind === BLOCK_INPUT_PORT) {
        const ip = trackedInputPorts.get(cn.key);
        if (ip) ip.energized = networkEnergized;
      } else if (cn.kind === BLOCK_SOCKET_HUB) {
        const sh = trackedSocketHubs.get(cn.key);
        if (sh) {
          sh.energized = networkEnergized;
          sh.feedGenKeys = activeFeedGens;
        }
      }
    }

    // Power direct-touching Spotlights if allowed by architecture mode
    if (networkEnergized && gridConfig.requireSpotlightEnergy) {
      for (const sKey of directSpotKeys) {
        const st = spotStates.get(sKey);
        if (!st || !st.switchedOn || st.powered) continue;
        for (const gk of activeFeedGens) {
          const rem = remainingCap.get(gk) || 0;
          if (rem > 0) {
            remainingCap.set(gk, rem - 1);
            const g = trackedGenerators.get(gk);
            if (g) g.usedLoad += 1;
            st.powered = true;
            st.source = "3D Cable Grid";
            break;
          }
        }
      }
    }

    // Update 6-way conduit arms & energized state on all nodes in this component
    for (const cn of compNodes) {
      if (cableTopologyDirty || system.currentTick % 20 === 0) {
        refreshConduitNodeVisuals(dim, cn.x, cn.y, cn.z, networkEnergized);
      } else {
        const b = safeGetBlock(dim, cn.x, cn.y, cn.z);
        if (b && isConduitNodeType(b.typeId)) {
          try {
            if (
              Boolean(b.permutation.getState("flashlight:energized")) !==
              networkEnergized
            ) {
              b.setPermutation(
                b.permutation.withState("flashlight:energized", networkEnergized)
              );
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  }

  if (cableTopologyDirty) {
    refreshAllConditionalPlugs();
    cableTopologyDirty = false;
  }

  // 4. PASS B — Copper Wire Spool Links (from Electric Socket Hubs OR Generators!)
  let wiresMutated = false;
  if (gridConfig.requireSpotlightEnergy && gridConfig.enableWireSpool) {
    const maxWireSpan = (Number(gridConfig.wireSpoolRange) || 24) + 0.5;
    const strictPortMode = Number(gridConfig.cableArchitectureMode) === 1;

    for (const [sKey, srcKey] of [...wireLinks.entries()]) {
      const spot = trackedSpotlights.get(sKey);
      const srcHub = trackedSocketHubs.get(srcKey);
      const srcGen = trackedGenerators.get(srcKey);
      const srcObj = srcHub || srcGen;

      if (!spot || !srcObj || srcObj.dimId !== spot.dimId) {
        wireLinks.delete(sKey);
        wiresMutated = true;
        continue;
      }

      const d = Math.hypot(
        srcObj.x - spot.x,
        srcObj.y - spot.y,
        srcObj.z - spot.z
      );
      if (d > maxWireSpan) continue;

      const st = spotStates.get(sKey);
      if (!st || !st.switchedOn || st.powered) continue;

      if (srcHub) {
        if (!srcHub.energized || !srcHub.feedGenKeys) continue;
        for (const gk of srcHub.feedGenKeys) {
          const rem = remainingCap.get(gk) || 0;
          if (rem > 0) {
            remainingCap.set(gk, rem - 1);
            const g = trackedGenerators.get(gk);
            if (g) g.usedLoad += 1;
            st.powered = true;
            st.source = `Socket Hub Wire (${d.toFixed(1)}m)`;
            break;
          }
        }
      } else if (srcGen && !strictPortMode) {
        const rem = remainingCap.get(srcKey) || 0;
        if (rem > 0) {
          remainingCap.set(srcKey, rem - 1);
          srcGen.usedLoad += 1;
          st.powered = true;
          st.source = `Generator Wire (${d.toFixed(1)}m)`;
        }
      }
    }
  }

  // 5. PASS C — Wireless Induction Radius (Generators + optional energized Socket Hubs)
  if (gridConfig.requireSpotlightEnergy && gridConfig.enableWireless) {
    const maxWireless = (Number(gridConfig.wirelessRadius) || 8) + 0.5;
    for (const [sKey, st] of spotStates.entries()) {
      if (!st.switchedOn || st.powered) continue;
      const { dimId, x, y, z } = st.entry;

      let bestGenKey = null;
      let bestDist = Infinity;
      let bestLabel = "Wireless";

      // Check active Generators directly
      for (const [gKey, rem] of remainingCap.entries()) {
        if (rem <= 0) continue;
        const g = trackedGenerators.get(gKey);
        if (!g || g.dimId !== dimId) continue;
        const d = Math.hypot(g.x - x, g.y - y, g.z - z);
        if (d <= maxWireless && d < bestDist) {
          bestDist = d;
          bestGenKey = gKey;
          bestLabel = `Wireless (${d.toFixed(1)}m)`;
        }
      }

      // Optionally check energized Electric Socket Hubs if enabled in Configurator
      if (gridConfig.allowSocketHubWireless) {
        for (const sh of trackedSocketHubs.values()) {
          if (!sh.energized || sh.dimId !== dimId || !sh.feedGenKeys) continue;
          const d = Math.hypot(sh.x - x, sh.y - y, sh.z - z);
          if (d <= maxWireless && d < bestDist) {
            const availGk = sh.feedGenKeys.find(
              (gk) => (remainingCap.get(gk) || 0) > 0
            );
            if (availGk) {
              bestDist = d;
              bestGenKey = availGk;
              bestLabel = `Socket Hub Wireless (${d.toFixed(1)}m)`;
            }
          }
        }
      }

      if (bestGenKey) {
        remainingCap.set(bestGenKey, (remainingCap.get(bestGenKey) || 1) - 1);
        const g = trackedGenerators.get(bestGenKey);
        if (g) g.usedLoad += 1;
        st.powered = true;
        st.source = bestLabel;
      }
    }
  }

  // 6. Sync every Spotlight's flashlight:lit state & beam cache
  for (const [sKey, st] of spotStates.entries()) {
    const desiredLit = Boolean(st.switchedOn && st.powered);
    st.entry.powered = st.powered;
    st.entry.powerSource = st.source;

    try {
      const perm = st.block.permutation;
      const curLit = Boolean(perm.getState("flashlight:lit"));
      if (curLit !== desiredLit) {
        st.block.setPermutation(perm.withState("flashlight:lit", desiredLit));
        spotlightBeamCache.delete(sKey);
      }
    } catch {
      // Ignore
    }
  }

  if (generatorsMutated && system.currentTick % 40 === 0) {
    saveTrackedGenerators();
  }
  if (spotlightsMutated) saveTrackedSpotlights();
  if (cablesMutated) saveTrackedCables();
  if (portsMutated) saveTrackedInputPorts();
  if (hubsMutated) saveTrackedSocketHubs();
  if (wiresMutated) saveWireLinks();
}

function renderWireSpoolParticles() {
  if (!gridConfig.enableParticles || !gridConfig.enableWireSpool) return;
  if (wireLinks.size === 0) return;

  for (const player of world.getAllPlayers()) {
    if (!isEntityValid(player)) continue;
    const { main, off } = getHeldEquipment(player);
    if (main?.typeId !== ITEM_WIRE_SPOOL && off?.typeId !== ITEM_WIRE_SPOOL) {
      continue;
    }
    const dim = player.dimension;
    if (typeof dim.spawnParticle !== "function") continue;
    const pLoc = player.location || player.getHeadLocation();

    for (const [sKey, srcKey] of wireLinks.entries()) {
      const s = trackedSpotlights.get(sKey);
      const src = trackedSocketHubs.get(srcKey) || trackedGenerators.get(srcKey);
      if (!s || !src || s.dimId !== dim.id) continue;
      if (Math.hypot(s.x - pLoc.x, s.z - pLoc.z) > 48) continue;

      const steps = 6;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const sag = Math.sin(t * Math.PI) * 0.32;
        try {
          dim.spawnParticle("minecraft:endRod", {
            x: src.x + 0.5 + (s.x - src.x) * t,
            y: src.y + 0.75 + (s.y - src.y) * t - sag,
            z: src.z + 0.5 + (s.z - src.z) * t,
          });
        } catch {
          break;
        }
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                   Spotlight Cone & Far-Cluster Beam Solver                 */
/* -------------------------------------------------------------------------- */

function computeBeamNodesForSpotlight(entry) {
  let dim;
  try {
    dim = world.getDimension(entry.dimId);
  } catch {
    return { valid: false, nodes: null };
  }

  const block = safeGetBlock(dim, entry.x, entry.y, entry.z);
  if (!block) return { valid: true, nodes: null };

  const typeId = block.typeId;
  if (!isSpotlightBlockType(typeId)) return { valid: false, nodes: null };

  let isLit = false;
  let cardinal = "north";
  try {
    isLit = Boolean(block.permutation.getState("flashlight:lit"));
    cardinal = String(
      block.permutation.getState("minecraft:cardinal_direction") || "north"
    );
  } catch {
    isLit = false;
  }

  const spotKey = makeKey(entry.dimId, entry.x, entry.y, entry.z);
  if (!isLit) {
    spotlightBeamCache.delete(spotKey);
    return { valid: true, nodes: null };
  }

  const now = system.currentTick;
  const cached = spotlightBeamCache.get(spotKey);
  if (
    cached &&
    cached.cardinal === cardinal &&
    cached.typeId === typeId &&
    now - cached.tick < 10
  ) {
    return { valid: true, nodes: cached.nodes };
  }

  const maxReach = getMaxBeamDist();
  const distScale = maxReach / 16.0;
  const beamMode = Number(gridConfig.spotlightBeamMode) || 0;

  const vec = CARDINAL_VECTORS[cardinal] || CARDINAL_VECTORS.north;
  const rx = -vec.fz;
  const rz = vec.fx;
  const isStanding = typeId === BLOCK_STANDING_SPOTLIGHT;

  const rawVy = isStanding ? -0.05 : 0.07;
  const centerDir = normalizeVec(vec.fx, rawVy, vec.fz);
  const origin = {
    x: entry.x + 0.5 + vec.fx * 0.55,
    y: entry.y + (isStanding ? 1.55 : 0.55),
    z: entry.z + 0.5 + vec.fz * 0.55,
  };

  /** @type {Map<string, {key:string, dimId:string, x:number, y:number, z:number, level:number}>} */
  const nodeMap = new Map();
  const addNode = (nx, ny, nz, level) => {
    if (nx === entry.x && ny === entry.y && nz === entry.z) return false;
    if (!canPlaceOrKeepLight(dim, nx, ny, nz)) return false;
    const k = makeKey(entry.dimId, nx, ny, nz);
    const prev = nodeMap.get(k);
    if (!prev || level > prev.level) {
      nodeMap.set(k, { key: k, dimId: entry.dimId, x: nx, y: ny, z: nz, level });
    }
    return true;
  };

  const traceConeRay = (rayDir, stepSpecs, endLevel) => {
    const traced = traceIgnoringLightBlocks(dim, origin, rayDir, maxReach);
    const endDist = Math.min(maxReach, Math.max(0.4, traced.dist));
    let endCoord = null;

    if (endLevel > 0) {
      if (traced.blocked) {
        if (
          traced.freePos &&
          addNode(traced.freePos.x, traced.freePos.y, traced.freePos.z, endLevel)
        ) {
          endCoord = {
            x: traced.freePos.x,
            y: traced.freePos.y,
            z: traced.freePos.z,
          };
        } else {
          for (const backoff of [0.3, 0.8, 1.3]) {
            if (backoff >= endDist) break;
            const bx = Math.floor(origin.x + rayDir.x * (endDist - backoff));
            const by = Math.floor(origin.y + rayDir.y * (endDist - backoff));
            const bz = Math.floor(origin.z + rayDir.z * (endDist - backoff));
            if (addNode(bx, by, bz, endLevel)) {
              endCoord = { x: bx, y: by, z: bz };
              break;
            }
          }
        }
      } else {
        for (const d of [maxReach, maxReach - 0.75, maxReach - 1.5]) {
          const tx = Math.floor(origin.x + rayDir.x * d);
          const ty = Math.floor(origin.y + rayDir.y * d);
          const tz = Math.floor(origin.z + rayDir.z * d);
          if (addNode(tx, ty, tz, endLevel)) {
            endCoord = { x: tx, y: ty, z: tz };
            break;
          }
        }
      }
    }

    for (const st of stepSpecs) {
      const scaledDist = st.dist * distScale;
      if (scaledDist >= endDist - 0.85) break;
      const sx = Math.floor(origin.x + rayDir.x * scaledDist);
      const sy = Math.floor(origin.y + rayDir.y * scaledDist);
      const sz = Math.floor(origin.z + rayDir.z * scaledDist);
      addNode(sx, sy, sz, st.level);
    }

    return endCoord;
  };

  const centerSteps = SPOTLIGHT_CONE_STEPS.map((s) => ({
    dist: s.dist,
    level: s.centerLevel,
  }));
  const focalPos = traceConeRay(centerDir, centerSteps, 15);

  if (beamMode === 0) {
    const wingSteps = SPOTLIGHT_CONE_STEPS.filter((s) => s.sideSpread > 0).map(
      (s) => ({ dist: s.dist, level: s.sideLevel })
    );
    const leftConeDir = normalizeVec(
      vec.fx - rx * CONE_TAN_H,
      rawVy,
      vec.fz - rz * CONE_TAN_H
    );
    const rightConeDir = normalizeVec(
      vec.fx + rx * CONE_TAN_H,
      rawVy,
      vec.fz + rz * CONE_TAN_H
    );
    traceConeRay(leftConeDir, wingSteps, 14);
    traceConeRay(rightConeDir, wingSteps, 14);

    if (isStanding) {
      const upConeDir = normalizeVec(vec.fx, rawVy + CONE_TAN_V_STANDING, vec.fz);
      const downConeDir = normalizeVec(
        vec.fx,
        rawVy - CONE_TAN_V_STANDING,
        vec.fz
      );
      traceConeRay(upConeDir, [{ dist: 10.5, level: 13 }], 14);
      traceConeRay(downConeDir, [{ dist: 10.5, level: 13 }], 14);
    } else {
      const upFloodDir = normalizeVec(
        vec.fx,
        rawVy + CONE_TAN_V_GROUND_UP,
        vec.fz
      );
      traceConeRay(
        upFloodDir,
        [
          { dist: 9.0, level: 13 },
          { dist: 13.0, level: 14 },
        ],
        14
      );
    }
  }

  if (focalPos && beamMode <= 1) {
    const fx0 = focalPos.x;
    const fy0 = focalPos.y;
    const fz0 = focalPos.z;

    if (isStanding) {
      const openL1 = addNode(fx0 - rx, fy0, fz0 - rz, 15);
      const openR1 = addNode(fx0 + rx, fy0, fz0 + rz, 15);
      const openU1 = addNode(fx0, fy0 + 1, fz0, 15);
      const openD1 = addNode(fx0, fy0 - 1, fz0, 15);
      const openFwd = addNode(fx0 + vec.fx, fy0, fz0 + vec.fz, 15);
      const openBck = addNode(fx0 - vec.fx, fy0, fz0 - vec.fz, 15);

      if (openL1) addNode(fx0 - rx * 2, fy0, fz0 - rz * 2, 14);
      if (openR1) addNode(fx0 + rx * 2, fy0, fz0 + rz * 2, 14);
      if (openU1) addNode(fx0, fy0 + 2, fz0, 14);
      if (openD1) addNode(fx0, fy0 - 2, fz0, 14);

      if (openL1 || openU1) addNode(fx0 - rx, fy0 + 1, fz0 - rz, 14);
      if (openR1 || openU1) addNode(fx0 + rx, fy0 + 1, fz0 + rz, 14);
      if (openL1 || openD1) addNode(fx0 - rx, fy0 - 1, fz0 - rz, 14);
      if (openR1 || openD1) addNode(fx0 + rx, fy0 - 1, fz0 + rz, 14);
      if (openL1 || openFwd)
        addNode(fx0 - rx + vec.fx, fy0, fz0 - rz + vec.fz, 14);
      if (openR1 || openFwd)
        addNode(fx0 + rx + vec.fx, fy0, fz0 + rz + vec.fz, 14);
      if (openL1 || openBck)
        addNode(fx0 - rx - vec.fx, fy0, fz0 - rz - vec.fz, 14);
      if (openR1 || openBck)
        addNode(fx0 + rx - vec.fx, fy0, fz0 + rz - vec.fz, 14);
    } else {
      const openU1 = addNode(fx0, fy0 + 1, fz0, 15);
      const openU2 = openU1 ? addNode(fx0, fy0 + 2, fz0, 15) : false;
      if (openU2) addNode(fx0, fy0 + 3, fz0, 14);

      const sideLOpen = canPlaceOrKeepLight(dim, fx0 - rx, fy0, fz0 - rz);
      const sideROpen = canPlaceOrKeepLight(dim, fx0 + rx, fy0, fz0 + rz);
      const openUL1 =
        openU1 || sideLOpen
          ? addNode(fx0 - rx, fy0 + 1, fz0 - rz, 15)
          : false;
      const openUR1 =
        openU1 || sideROpen
          ? addNode(fx0 + rx, fy0 + 1, fz0 + rz, 15)
          : false;
      if (openUL1 && openU2) addNode(fx0 - rx, fy0 + 2, fz0 - rz, 14);
      if (openUR1 && openU2) addNode(fx0 + rx, fy0 + 2, fz0 + rz, 14);
    }
  }

  const nodes = [...nodeMap.values()];
  spotlightBeamCache.set(spotKey, {
    cardinal,
    typeId,
    tick: now,
    nodes,
  });
  return { valid: true, nodes };
}

/* -------------------------------------------------------------------------- */
/*                 Rechargeable Handheld Flashlight Toggle & Drain            */
/* -------------------------------------------------------------------------- */

function toggleFlashlight(player) {
  if (!isEntityValid(player)) return;

  try {
    const lookHit = player.getBlockFromViewDirection({
      maxDistance: 5.5,
      includePassableBlocks: false,
      includeLiquidBlocks: false,
    });
    if (
      lookHit?.block &&
      (isGeneratorBlockType(lookHit.block.typeId) ||
        lookHit.block.typeId === BLOCK_SOCKET_HUB)
    ) {
      return;
    }
  } catch {
    // Ignore
  }

  const now = system.currentTick;
  const prev = lastToggleTick.get(player.id) ?? -100;
  if (now - prev < 5) return;

  const { eq, main, off } = getHeldEquipment(player);
  if (!eq) return;

  let targetSlot = EquipmentSlot.Mainhand;
  let held = main;
  if (!held || (held.typeId !== ITEM_ON && held.typeId !== ITEM_OFF)) {
    if (off && (off.typeId === ITEM_ON || off.typeId === ITEM_OFF)) {
      targetSlot = EquipmentSlot.Offhand;
      held = off;
    } else {
      return;
    }
  }

  const maxBat = getMaxBatteryTicks();
  const cachedState = playerBatteryState.get(player.id);
  const currentTicks = cachedState
    ? Math.min(maxBat, cachedState.ticks)
    : readBatteryTicksFromItem(held);

  if (
    gridConfig.requireFlashlightBattery &&
    held.typeId === ITEM_OFF &&
    currentTicks <= 0
  ) {
    lastToggleTick.set(player.id, now);
    sendFeedback(
      player,
      "§c⚡ Flashlight Battery Empty (0%)! §7Right-click an Active Generator or Socket Hub to Recharge",
      "random.click",
      0.65
    );
    return;
  }

  const turningOn = held.typeId === ITEM_OFF;
  const targetType = turningOn ? ITEM_ON : ITEM_OFF;

  lastToggleTick.set(player.id, now);
  playerPoseCache.delete(player.id);

  const nextItem = new ItemStack(targetType, 1);
  if (held.nameTag) nextItem.nameTag = held.nameTag;
  const existingLore = held.getLore();
  if (existingLore && existingLore.length > 0) nextItem.setLore(existingLore);

  if (typeof held.getDynamicPropertyIds === "function") {
    try {
      for (const propId of held.getDynamicPropertyIds()) {
        nextItem.setDynamicProperty(propId, held.getDynamicProperty(propId));
      }
    } catch {
      // Ignore
    }
  }

  if (gridConfig.requireFlashlightBattery) {
    writeBatteryTicksToItem(nextItem, currentTicks);
  }
  eq.setEquipment(targetSlot, nextItem);

  const pct =
    currentTicks <= 0
      ? 0
      : Math.max(1, Math.min(100, Math.round((currentTicks / maxBat) * 100)));
  playerBatteryState.set(player.id, {
    ticks: currentTicks,
    lastSyncedMilestone: Math.ceil(pct / 10),
  });

  const batSuffix = gridConfig.requireFlashlightBattery
    ? ` §8| §b⚡ ${pct}%`
    : "";
  sendFeedback(
    player,
    turningOn
      ? `§eFlashlight: §aON §7(${getMaxBeamDist()}m)${batSuffix}`
      : `§7Flashlight: §cOFF${batSuffix}`,
    "random.click",
    turningOn ? 1.35 : 0.85
  );
}

function tickPlayerFlashlightBattery(player) {
  const { eq, main, off } = getHeldEquipment(player);
  if (!eq) return false;

  const activeSlot =
    main?.typeId === ITEM_ON
      ? EquipmentSlot.Mainhand
      : off?.typeId === ITEM_ON
      ? EquipmentSlot.Offhand
      : null;

  if (!activeSlot) return false;
  if (!gridConfig.requireFlashlightBattery) return true;

  const held = eq.getEquipment(activeSlot);
  if (!held) return false;

  const maxBat = getMaxBatteryTicks();
  let bState = playerBatteryState.get(player.id);
  if (!bState) {
    const initialTicks = readBatteryTicksFromItem(held);
    bState = {
      ticks: initialTicks,
      lastSyncedMilestone: Math.ceil((initialTicks / maxBat) * 10),
    };
    playerBatteryState.set(player.id, bState);
  }

  bState.ticks = Math.max(0, Math.min(maxBat, bState.ticks) - 1);

  if (bState.ticks <= 0) {
    const depletedItem = new ItemStack(ITEM_OFF, 1);
    if (held.nameTag) depletedItem.nameTag = held.nameTag;
    const lore = held.getLore();
    if (lore && lore.length > 0) depletedItem.setLore(lore);
    writeBatteryTicksToItem(depletedItem, 0);
    eq.setEquipment(activeSlot, depletedItem);
    bState.lastSyncedMilestone = 0;
    playerPoseCache.delete(player.id);
    sendFeedback(
      player,
      "§c⚡ Flashlight Battery Depleted! §7Right-click an Active Generator or Socket Hub to Recharge",
      "random.click",
      0.65
    );
    return false;
  }

  const milestone = Math.ceil((bState.ticks / maxBat) * 10);
  if (milestone !== bState.lastSyncedMilestone) {
    bState.lastSyncedMilestone = milestone;
    writeBatteryTicksToItem(held, bState.ticks);
    eq.setEquipment(activeSlot, held);
    const pct = milestone * 10;
    if (pct <= 20) {
      sendFeedback(
        player,
        `§e⚡ Low Flashlight Battery: §c${pct}% §7(Recharge at Generator or Socket Hub)`,
        null,
        1.0
      );
    }
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                     View-Direction Beam Raycast                            */
/* -------------------------------------------------------------------------- */

function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function traceIgnoringLightBlocks(dim, head, dir, maxDist = 16) {
  let prevX = NaN;
  let prevY = NaN;
  let prevZ = NaN;
  let lastFree = null;

  for (let d = 0.2; d <= maxDist; d += 0.35) {
    const px = head.x + dir.x * d;
    const py = head.y + dir.y * d;
    const pz = head.z + dir.z * d;
    const bx = Math.floor(px);
    const by = Math.floor(py);
    const bz = Math.floor(pz);

    if (bx === prevX && by === prevY && bz === prevZ) continue;
    prevX = bx;
    prevY = by;
    prevZ = bz;

    const block = safeGetBlock(dim, bx, by, bz);
    if (!block) return { blocked: true, dist: d, freePos: lastFree };

    const typeId = block.typeId;
    if (
      isAirType(typeId) ||
      isLightBlockType(typeId) ||
      typeId === "minecraft:water" ||
      block.isLiquid
    ) {
      lastFree = { x: bx, y: by, z: bz };
      continue;
    }

    return { blocked: true, dist: d, freePos: lastFree };
  }

  return { blocked: false, dist: maxDist, freePos: lastFree };
}

function computeBeamNodesForPlayer(player) {
  if (!isEntityValid(player)) return null;

  try {
    const health = player.getComponent(EntityComponentTypes.Health);
    if (health && health.currentValue <= 0) {
      playerPoseCache.delete(player.id);
      return null;
    }
  } catch {
    // Ignore
  }

  if (!tickPlayerFlashlightBattery(player)) {
    playerPoseCache.delete(player.id);
    return null;
  }

  const maxReach = getMaxBeamDist();
  const distScale = maxReach / 16.0;

  const dim = player.dimension;
  const dimId = dim.id;
  const head = player.getHeadLocation();
  const rawDir = player.getViewDirection();
  const dirLen = Math.hypot(rawDir.x, rawDir.y, rawDir.z);
  if (dirLen < 1e-6) return null;
  const dir = {
    x: rawDir.x / dirLen,
    y: rawDir.y / dirLen,
    z: rawDir.z / dirLen,
  };
  const now = system.currentTick;

  const cached = playerPoseCache.get(player.id);
  if (
    cached &&
    cached.dimId === dimId &&
    now - cached.tick < 6 &&
    distSq(head, cached.head) < 0.0064 &&
    distSq(dir, cached.dir) < 0.000225
  ) {
    return cached.nodes;
  }

  /** @type {Map<string, {key:string, dimId:string, x:number, y:number, z:number, level:number}>} */
  const nodeMap = new Map();

  const addNode = (x, y, z, level) => {
    if (!canPlaceOrKeepLight(dim, x, y, z)) return false;
    const key = makeKey(dimId, x, y, z);
    const existing = nodeMap.get(key);
    if (!existing || level > existing.level) {
      nodeMap.set(key, { key, dimId, x, y, z, level });
    }
    return true;
  };

  let hit = undefined;
  let usedFallbackTrace = false;
  try {
    hit = player.getBlockFromViewDirection({
      maxDistance: maxReach,
      includePassableBlocks: false,
      includeLiquidBlocks: false,
    });
  } catch {
    hit = undefined;
    usedFallbackTrace = true;
  }

  if (hit && hit.block && isLightBlockType(hit.block.typeId)) {
    hit = undefined;
    usedFallbackTrace = true;
  }

  let beamEndDist = maxReach;

  if (usedFallbackTrace) {
    const traced = traceIgnoringLightBlocks(dim, head, dir, maxReach);
    beamEndDist = Math.min(maxReach, Math.max(0.4, traced.dist));
    if (traced.blocked) {
      let placedFocal = false;
      if (traced.freePos) {
        placedFocal = addNode(
          traced.freePos.x,
          traced.freePos.y,
          traced.freePos.z,
          15
        );
      }
      if (!placedFocal) {
        for (const backoff of [0.25, 0.75, 1.25, 1.75]) {
          if (backoff >= beamEndDist) break;
          const bx = Math.floor(head.x + dir.x * (beamEndDist - backoff));
          const by = Math.floor(head.y + dir.y * (beamEndDist - backoff));
          const bz = Math.floor(head.z + dir.z * (beamEndDist - backoff));
          if (addNode(bx, by, bz, 15)) break;
        }
      }
    } else {
      for (const d of [maxReach, maxReach - 0.75, maxReach - 1.5]) {
        const tx = Math.floor(head.x + dir.x * d);
        const ty = Math.floor(head.y + dir.y * d);
        const tz = Math.floor(head.z + dir.z * d);
        if (addNode(tx, ty, tz, 15)) break;
      }
    }
  } else if (hit && hit.block) {
    const fl = hit.faceLocation ?? { x: 0.5, y: 0.5, z: 0.5 };
    const hx = hit.block.x + fl.x;
    const hy = hit.block.y + fl.y;
    const hz = hit.block.z + fl.z;
    const rawDist = Math.hypot(hx - head.x, hy - head.y, hz - head.z);
    beamEndDist = Math.min(maxReach, Math.max(0.4, rawDist));

    const adj = offsetByFace(hit.block, hit.face);
    const adjDist = Math.hypot(
      adj.x + 0.5 - head.x,
      adj.y + 0.5 - head.y,
      adj.z + 0.5 - head.z
    );

    let placedFocal = false;
    if (adjDist <= maxReach + 0.85) {
      placedFocal = addNode(adj.x, adj.y, adj.z, 15);
    }

    if (!placedFocal) {
      for (const backoff of [0.25, 0.75, 1.25, 1.75]) {
        if (backoff >= beamEndDist) break;
        const bx = Math.floor(hx - dir.x * backoff);
        const by = Math.floor(hy - dir.y * backoff);
        const bz = Math.floor(hz - dir.z * backoff);
        if (addNode(bx, by, bz, 15)) break;
      }
    }
  } else {
    beamEndDist = maxReach;
    for (const d of [maxReach, maxReach - 0.75, maxReach - 1.5]) {
      const tx = Math.floor(head.x + dir.x * d);
      const ty = Math.floor(head.y + dir.y * d);
      const tz = Math.floor(head.z + dir.z * d);
      if (addNode(tx, ty, tz, 15)) break;
    }
  }

  for (const step of BASE_BEAM_STEPS) {
    const scaledDist = step.dist * distScale;
    if (scaledDist >= beamEndDist - 0.85) break;
    const sx = Math.floor(head.x + dir.x * scaledDist);
    const sy = Math.floor(head.y + dir.y * scaledDist);
    const sz = Math.floor(head.z + dir.z * scaledDist);
    addNode(sx, sy, sz, step.level);
  }

  const nodes = [...nodeMap.values()];
  playerPoseCache.set(player.id, {
    dimId,
    head: { x: head.x, y: head.y, z: head.z },
    dir: { x: dir.x, y: dir.y, z: dir.z },
    tick: now,
    nodes,
  });

  return nodes;
}

/* -------------------------------------------------------------------------- */
/*                               Main Tick Loop                               */
/* -------------------------------------------------------------------------- */

function tickFlashlights() {
  if (system.currentTick % 10 === 0) {
    updatePowerGrid(10);
  }
  if (system.currentTick % 20 === 0) {
    renderWireSpoolParticles();
  }
  if (system.currentTick % 200 === 0 && trackedGenerators.size > 0) {
    saveTrackedGenerators();
  }

  /** @type {Map<string, {key:string, dimId:string, x:number, y:number, z:number, level:number}>} */
  const desired = new Map();

  for (const player of world.getAllPlayers()) {
    const nodes = computeBeamNodesForPlayer(player);
    if (!nodes) continue;
    for (const node of nodes) {
      const prev = desired.get(node.key);
      if (!prev || node.level > prev.level) {
        desired.set(node.key, node);
      }
    }
  }

  if (trackedSpotlights.size > 0) {
    let spotlightsMutated = false;
    for (const [sKey, sEntry] of [...trackedSpotlights.entries()]) {
      const res = computeBeamNodesForSpotlight(sEntry);
      if (!res.valid) {
        trackedSpotlights.delete(sKey);
        spotlightBeamCache.delete(sKey);
        spotlightsMutated = true;
        continue;
      }
      if (!res.nodes) continue;
      for (const node of res.nodes) {
        const prev = desired.get(node.key);
        if (!prev || node.level > prev.level) {
          desired.set(node.key, node);
        }
      }
    }
    if (spotlightsMutated) saveTrackedSpotlights();
  }

  let stateChanged = false;

  for (const [key, existing] of [...activeLights.entries()]) {
    if (!desired.has(key)) {
      activeLights.delete(key);
      if (!restoreBlock(existing)) {
        pendingCleanup.set(key, existing);
      }
      stateChanged = true;
    }
  }

  for (const [key, target] of desired.entries()) {
    if (pendingCleanup.has(key)) {
      pendingCleanup.delete(key);
      stateChanged = true;
    }

    const current = activeLights.get(key);
    if (current && current.level === target.level) {
      if ((system.currentTick & 3) !== 0) continue;
      let dim;
      try {
        dim = world.getDimension(target.dimId);
      } catch {
        continue;
      }
      const checkBlock = safeGetBlock(dim, target.x, target.y, target.z);
      if (checkBlock && isLightBlockType(checkBlock.typeId)) {
        continue;
      }
    }

    let dim;
    try {
      dim = world.getDimension(target.dimId);
    } catch {
      continue;
    }
    const block = safeGetBlock(dim, target.x, target.y, target.z);
    if (!block) continue;

    const typeId = block.typeId;
    let wasWater = current?.wasWater ?? false;

    if (isAirType(typeId)) {
      wasWater = false;
    } else if (isCalmWaterSource(block)) {
      wasWater = true;
    } else if (isLightBlockType(typeId)) {
      wasWater = Boolean(wasWater || block.isWaterlogged);
    } else {
      if (current) {
        activeLights.delete(key);
        stateChanged = true;
      }
      continue;
    }

    if (applyLightBlock(block, target.level, wasWater)) {
      activeLights.set(key, {
        dimId: target.dimId,
        x: target.x,
        y: target.y,
        z: target.z,
        level: target.level,
        wasWater,
      });
      stateChanged = true;
    }
  }

  if (pendingCleanup.size > 0 && system.currentTick % 40 === 0) {
    for (const [key, entry] of [...pendingCleanup.entries()]) {
      if (restoreBlock(entry)) {
        pendingCleanup.delete(key);
        stateChanged = true;
      }
    }
  }

  if (stateChanged) {
    saveTrackedState();
  }
}

/* -------------------------------------------------------------------------- */
/*                      Event Subscriptions (Early-Exec Safe)                 */
/* -------------------------------------------------------------------------- */

function startFlashlightSystem() {
  if (systemStarted) return;
  systemStarted = true;
  loadAndSweepPersistedLights();
  loadAllPersistedGridData();
  updatePowerGrid(0);
  system.runInterval(tickFlashlights, 1);
}

if (system.beforeEvents && system.beforeEvents.startup) {
  system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.itemComponentRegistry.registerCustomComponent(
      "flashlight:toggle",
      {
        onUse(event) {
          const source = event.source;
          if (!source || source.typeId !== "minecraft:player") return;
          toggleFlashlight(source);
        },
      }
    );

    initEvent.itemComponentRegistry.registerCustomComponent(
      "flashlight:config_tool",
      {
        onUse(event) {
          const source = event.source;
          if (!source || source.typeId !== "minecraft:player") return;
          openConfiguratorHub(source);
        },
      }
    );

    if (initEvent.blockComponentRegistry) {
      initEvent.blockComponentRegistry.registerCustomComponent(
        "flashlight:spotlight",
        {
          onPlace(event) {
            registerSpotlightBlock(event.block);
          },
          onBreak(event) {
            unregisterSpotlightBlock(
              event.dimension,
              event.dimension.id,
              event.block.x,
              event.block.y,
              event.block.z
            );
          },
          onPlayerInteract(event) {
            handleSpotlightInteract(event);
          },
        }
      );

      initEvent.blockComponentRegistry.registerCustomComponent(
        "flashlight:generator",
        {
          onPlace(event) {
            registerGeneratorBlock(event.block);
          },
          onBreak(event) {
            unregisterGeneratorBlock(
              event.dimension,
              event.dimension.id,
              event.block.x,
              event.block.y,
              event.block.z
            );
          },
          onPlayerInteract(event) {
            handleGeneratorInteract(event);
          },
        }
      );

      initEvent.blockComponentRegistry.registerCustomComponent(
        "flashlight:cable",
        {
          onPlace(event) {
            registerCableBlock(event.block);
          },
          onBreak(event) {
            unregisterCableBlock(
              event.dimension,
              event.dimension.id,
              event.block.x,
              event.block.y,
              event.block.z
            );
          },
        }
      );

      initEvent.blockComponentRegistry.registerCustomComponent(
        "flashlight:input_port",
        {
          onPlace(event) {
            registerInputPortBlock(event.block);
          },
          onBreak(event) {
            unregisterInputPortBlock(
              event.dimension,
              event.dimension.id,
              event.block.x,
              event.block.y,
              event.block.z
            );
          },
          onPlayerInteract(event) {
            handleInputPortInteract(event);
          },
        }
      );

      initEvent.blockComponentRegistry.registerCustomComponent(
        "flashlight:socket_hub",
        {
          onPlace(event) {
            registerSocketHubBlock(event.block);
          },
          onBreak(event) {
            unregisterSocketHubBlock(
              event.dimension,
              event.dimension.id,
              event.block.x,
              event.block.y,
              event.block.z
            );
          },
          onPlayerInteract(event) {
            handleSocketHubInteract(event);
          },
        }
      );
    }
  });
}

if (world.afterEvents && world.afterEvents.playerPlaceBlock) {
  world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const b = event.block;
    if (!b) return;
    if (isSpotlightBlockType(b.typeId)) registerSpotlightBlock(b);
    else if (isGeneratorBlockType(b.typeId)) registerGeneratorBlock(b);
    else if (b.typeId === BLOCK_POWER_CABLE) registerCableBlock(b);
    else if (b.typeId === BLOCK_INPUT_PORT) registerInputPortBlock(b);
    else if (b.typeId === BLOCK_SOCKET_HUB) registerSocketHubBlock(b);
  });
}

world.afterEvents.itemUse.subscribe((event) => {
  const stack = event.itemStack;
  if (!stack) return;
  if (stack.typeId === ITEM_ON || stack.typeId === ITEM_OFF) {
    toggleFlashlight(event.source);
  } else if (stack.typeId === ITEM_CONFIGURATOR) {
    openConfiguratorHub(event.source);
  }
});

if (world.beforeEvents && world.beforeEvents.playerLeave) {
  world.beforeEvents.playerLeave.subscribe((event) => {
    const playerId = event.player.id;
    playerPoseCache.delete(playerId);
    lastToggleTick.delete(playerId);
    lastConfigOpenTick.delete(playerId);
    pendingWireSelection.delete(playerId);
    playerBatteryState.delete(playerId);
  });
}

if (system.afterEvents && system.afterEvents.scriptEventReceive) {
  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "flashlight:cleanup") {
      clearAllLightsImmediate();
    } else if (event.id === "flashlight:config" && event.sourceEntity) {
      openConfiguratorHub(event.sourceEntity);
    }
  });
}

if (world.afterEvents && world.afterEvents.worldLoad) {
  world.afterEvents.worldLoad.subscribe(() => {
    startFlashlightSystem();
  });
}

system.run(() => {
  startFlashlightSystem();
});
