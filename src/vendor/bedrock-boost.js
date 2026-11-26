// Vendored third-party library: @bedrock-oss/bedrock-boost (dist/index.mjs).
// Reconstructed verbatim from the bundled copy (tree-shaken subset).
// Only the symbols consumed by this project are guaranteed; public classes are re-exported below.
import { __defProp, __defNormalProp, __publicField } from "../utils/esbuild-helpers.js";

import { Direction } from "@minecraft/server";
import { system as system2, world as world2 } from "@minecraft/server";
import { system as system22 } from "@minecraft/server";
import { BlockPermutation, world as world22 } from "@minecraft/server";
import { world as world3 } from "@minecraft/server";
import { Player as Player2 } from "@minecraft/server";
import { system as system3 } from "@minecraft/server";
import { system as system4 } from "@minecraft/server";
import {
  system as system5,
  world as world4
} from "@minecraft/server";
import { Player as Player22, system as system6, world as world5 } from "@minecraft/server";
import {
  InputPermissionCategory
} from "@minecraft/server";
import { system as system7 } from "@minecraft/server";
import { Direction as Direction2 } from "@minecraft/server";
import { StructureSaveMode, world as world6 } from "@minecraft/server";
import { EntityEquippableComponent, EquipmentSlot as EquipmentSlot2, ItemDurabilityComponent, ItemEnchantableComponent } from "@minecraft/server";
var _a;
var ChatColor = (_a = class {
  /**
   * Class ChatColor Constructor.
   * @param code - The color code as a string.
   * @param color - The color code as a hexadecimal number. Can be undefined.
   */
  constructor(code, color) {
    __publicField(this, "r");
    __publicField(this, "g");
    __publicField(this, "b");
    this.code = code;
    this.color = color;
    if (color) {
      this.r = color >> 16 & 255;
      this.g = color >> 8 & 255;
      this.b = color & 255;
    }
  }
  /**
   * Returns the string representation of the ChatColor instance,
   * which includes the PREFIX followed by the color code.
   * @returns A string representing the ChatColor instance
   */
  toString() {
    return _a.PREFIX + this.code;
  }
  /**
   * Returns the color code of the ChatColor instance.
   * @returns The color code of this ChatColor instance.
   */
  toRGB() {
    return this.color;
  }
  /**
   * Returns the hexadecimal string representation of the color code
   * @returns {string | undefined} The hexadecimal representation of the color.
   */
  toHex() {
    return this.color?.toString(16);
  }
  /**
   * Retrieve the value of the red component.
   *
   * @returns {number | undefined} The value of the red component, or undefined if it is not set.
   */
  getRed() {
    return this.r;
  }
  /**
   * Retrieves the green value of the current color.
   *
   * @returns {number | undefined} The green value of the color, or undefined if it is not set.
   */
  getGreen() {
    return this.g;
  }
  /**
   * Retrieves the blue value of a color.
   *
   * @returns The blue value of the color.
   * @type {number | undefined}
   */
  getBlue() {
    return this.b;
  }
  /**
   * Retrieves the format code associated with the chat color.
   *
   * @returns {string} The format code of the chat color.
   */
  getCode() {
    return this.code;
  }
  /**
   * Removes color codes from the specified string
   * @param str - The string from which color codes will be removed.
   * @returns The string cleared from color codes.
   */
  static stripColor(str) {
    return str.replace(/§[0-9a-u]/g, "");
  }
  /**
   * Finds the closest ChatColor code for the given RGB values
   * @param r - Red part of the color.
   * @param g - Green part of the color.
   * @param b - Blue part of the color.
   * @returns The closest ChatColor for the given RGB values.
   */
  static findClosestColor(r, g, b) {
    let minDistance = Number.MAX_VALUE;
    let closestColor = _a.WHITE;
    for (const color of _a.ALL_COLORS) {
      if (color.r && color.g && color.b) {
        const distance = Math.sqrt(Math.pow(color.r - r, 2) + Math.pow(color.g - g, 2) + Math.pow(color.b - b, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }
    }
    return closestColor;
  }
}, /**
 * Black color code. (0)
 */
__publicField(_a, "BLACK", new _a("0", 0)), /**
 * Dark blue color code. (1)
 */
__publicField(_a, "DARK_BLUE", new _a("1", 170)), /**
 * Dark green color code. (2)
 */
__publicField(_a, "DARK_GREEN", new _a("2", 43520)), /**
 * Dark aqua color code. (3)
 */
__publicField(_a, "DARK_AQUA", new _a("3", 43690)), /**
 * Dark red color code. (4)
 */
__publicField(_a, "DARK_RED", new _a("4", 11141120)), /**
 * Dark purple color code. (5)
 */
__publicField(_a, "DARK_PURPLE", new _a("5", 11141290)), /**
 * Gold color code. (6)
 */
__publicField(_a, "GOLD", new _a("6", 16755200)), /**
 * Gray color code. (7)
 */
__publicField(_a, "GRAY", new _a("7", 11184810)), /**
 * Dark gray color code. (8)
 */
__publicField(_a, "DARK_GRAY", new _a("8", 5592405)), /**
 * Blue color code. (9)
 */
__publicField(_a, "BLUE", new _a("9", 5592575)), /**
 * Green color code. (a)
 */
__publicField(_a, "GREEN", new _a("a", 5635925)), /**
 * Aqua color code. (b)
 */
__publicField(_a, "AQUA", new _a("b", 5636095)), /**
 * Red color code. (c)
 */
__publicField(_a, "RED", new _a("c", 16733525)), /**
 * Light purple color code. (d)
 */
__publicField(_a, "LIGHT_PURPLE", new _a("d", 16733695)), /**
 * Yellow color code. (e)
 */
__publicField(_a, "YELLOW", new _a("e", 16777045)), /**
 * White color code. (f)
 */
__publicField(_a, "WHITE", new _a("f", 16777215)), /**
 * MineCoin gold color code. (g)
 */
__publicField(_a, "MINECOIN_GOLD", new _a("g", 14603781)), /**
 * Material quartz color code. (h)
 */
__publicField(_a, "MATERIAL_QUARTZ", new _a("h", 14931153)), /**
 * Material iron color code. (i)
 */
__publicField(_a, "MATERIAL_IRON", new _a("i", 13552330)), /**
 * Material netherite color code. (j)
 */
__publicField(_a, "MATERIAL_NETHERITE", new _a("j", 4471355)), /**
 * Material redstone color code. (m)
 */
__publicField(_a, "MATERIAL_REDSTONE", new _a("m", 9901575)), /**
 * Material copper color code. (n)
 */
__publicField(_a, "MATERIAL_COPPER", new _a("n", 11823181)), /**
 * Material gold color code. (p)
 */
__publicField(_a, "MATERIAL_GOLD", new _a("p", 14594349)), /**
 * Material emerald color code. (q)
 */
__publicField(_a, "MATERIAL_EMERALD", new _a("q", 1155126)), /**
 * Material diamond color code. (s)
 */
__publicField(_a, "MATERIAL_DIAMOND", new _a("s", 2931368)), /**
 * Material lapis color code. (t)
 */
__publicField(_a, "MATERIAL_LAPIS", new _a("t", 2181499)), /**
 * Material amethyst color code. (u)
 */
__publicField(_a, "MATERIAL_AMETHYST", new _a("u", 10116294)), /**
 * Obfuscated color code. (k)
 */
__publicField(_a, "OBFUSCATED", new _a("k")), /**
 * Bold color code. (l)
 */
__publicField(_a, "BOLD", new _a("l")), /**
 * Italic color code. (o)
 */
__publicField(_a, "ITALIC", new _a("o")), /**
 * Reset color code. (r)
 */
__publicField(_a, "RESET", new _a("r")), /**
 * All available color codes.
 */
__publicField(_a, "VALUES", [
  _a.BLACK,
  _a.DARK_BLUE,
  _a.DARK_GREEN,
  _a.DARK_AQUA,
  _a.DARK_RED,
  _a.DARK_PURPLE,
  _a.GOLD,
  _a.GRAY,
  _a.DARK_GRAY,
  _a.BLUE,
  _a.GREEN,
  _a.AQUA,
  _a.RED,
  _a.LIGHT_PURPLE,
  _a.YELLOW,
  _a.WHITE,
  _a.MINECOIN_GOLD,
  _a.MATERIAL_QUARTZ,
  _a.MATERIAL_IRON,
  _a.MATERIAL_NETHERITE,
  _a.MATERIAL_REDSTONE,
  _a.MATERIAL_COPPER,
  _a.MATERIAL_GOLD,
  _a.MATERIAL_EMERALD,
  _a.MATERIAL_DIAMOND,
  _a.MATERIAL_LAPIS,
  _a.MATERIAL_AMETHYST,
  _a.OBFUSCATED,
  _a.BOLD,
  _a.ITALIC,
  _a.RESET
]), /**
 * All available color codes excluding the formatting codes.
 */
__publicField(_a, "ALL_COLORS", [
  _a.BLACK,
  _a.DARK_BLUE,
  _a.DARK_GREEN,
  _a.DARK_AQUA,
  _a.DARK_RED,
  _a.DARK_PURPLE,
  _a.GOLD,
  _a.GRAY,
  _a.DARK_GRAY,
  _a.BLUE,
  _a.GREEN,
  _a.AQUA,
  _a.RED,
  _a.LIGHT_PURPLE,
  _a.YELLOW,
  _a.WHITE,
  _a.MINECOIN_GOLD,
  _a.MATERIAL_QUARTZ,
  _a.MATERIAL_IRON,
  _a.MATERIAL_NETHERITE,
  _a.MATERIAL_REDSTONE,
  _a.MATERIAL_COPPER,
  _a.MATERIAL_GOLD,
  _a.MATERIAL_EMERALD,
  _a.MATERIAL_DIAMOND,
  _a.MATERIAL_LAPIS,
  _a.MATERIAL_AMETHYST
]), /**
 * PREFIX is the section sign (§) used in Minecraft color codes.
 */
__publicField(_a, "PREFIX", "\xA7"), _a);
var _a2;
var ColorJSON = (_a2 = class {
  constructor() {
    // Tokens
    __publicField(this, "OpenObject", "{");
    __publicField(this, "CloseObject", "}");
    __publicField(this, "OpenArray", "[");
    __publicField(this, "CloseArray", "]");
    __publicField(this, "Comma", ",");
    __publicField(this, "KeyValueSeparator", ":");
    __publicField(this, "StringDelimiter", '"');
    __publicField(this, "KeyDelimiter", "");
    __publicField(this, "Indent", "  ");
    __publicField(this, "NewLine", "\n");
    __publicField(this, "Space", " ");
    // Threshold for inline representation
    __publicField(this, "InlineThreshold", 60);
    // Maximum depth to which objects will be traversed
    __publicField(this, "MaxDepth", 1);
    // Whether to include class names
    __publicField(this, "IncludeClassNames", true);
    // Values
    __publicField(this, "FunctionValue", "\u0192");
    __publicField(this, "NullValue", "null");
    __publicField(this, "UndefinedValue", "undefined");
    __publicField(this, "TrueValue", "true");
    __publicField(this, "FalseValue", "false");
    __publicField(this, "CycleValue", "[...cycle...]");
    __publicField(this, "TruncatedObjectValue", "{...}");
    // Colors
    __publicField(this, "OpenCloseObjectColor", ChatColor.YELLOW);
    __publicField(this, "OpenCloseArrayColor", ChatColor.AQUA);
    __publicField(this, "NumberColor", ChatColor.DARK_AQUA);
    __publicField(this, "StringColor", ChatColor.DARK_GREEN);
    __publicField(this, "BooleanColor", ChatColor.GOLD);
    __publicField(this, "NullColor", ChatColor.GOLD);
    __publicField(this, "KeyColor", ChatColor.GRAY);
    __publicField(this, "EscapeColor", ChatColor.GOLD);
    __publicField(this, "FunctionColor", ChatColor.GRAY);
    __publicField(this, "ClassColor", ChatColor.GRAY);
    __publicField(this, "ClassStyle", ChatColor.BOLD);
    __publicField(this, "CycleColor", ChatColor.DARK_RED);
  }
  static createPlain() {
    const plain = new _a2();
    plain.OpenCloseObjectColor = "";
    plain.OpenCloseArrayColor = "";
    plain.NumberColor = "";
    plain.StringColor = "";
    plain.BooleanColor = "";
    plain.NullColor = "";
    plain.KeyColor = "";
    plain.EscapeColor = "";
    plain.FunctionColor = "";
    plain.ClassColor = "";
    plain.ClassStyle = "";
    plain.CycleColor = "";
    return plain;
  }
  /**
   * Transforms a value into a chat-friendly, colored JSON representation.
   * @param value - The value to transform.
   */
  stringify(value) {
    return this.stringifyValue(value, {
      indentLevel: 0,
      visited: /* @__PURE__ */ new WeakSet()
    });
  }
  /**
   * Transforms a string into a JSON representation.
   * @param value - The string to transform.
   */
  stringifyString(value) {
    return this.StringColor + this.StringDelimiter + this.escapeString(value) + this.StringDelimiter + ChatColor.RESET;
  }
  /**
   * Transforms a number into a JSON representation.
   * @param value - The number to transform.
   */
  stringifyNumber(value) {
    return this.NumberColor + value.toString() + ChatColor.RESET;
  }
  /**
   * Transforms a boolean into a JSON representation.
   * @param value - The boolean to transform.
   */
  stringifyBoolean(value) {
    return this.BooleanColor + (value ? this.TrueValue : this.FalseValue) + ChatColor.RESET;
  }
  /**
   * Transforms a function into a JSON representation.
   * @param value - The function to transform.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  stringifyFunction(value) {
    return this.FunctionColor + this.FunctionValue + ChatColor.RESET;
  }
  /**
   * Returns a null JSON representation.
   */
  stringifyNull() {
    return this.NullColor + this.NullValue + ChatColor.RESET;
  }
  /**
   * Returns an undefined JSON representation.
   */
  stringifyUndefined() {
    return this.NullColor + this.UndefinedValue + ChatColor.RESET;
  }
  /**
   * Returns a cycle JSON representation.
   */
  stringifyCycle() {
    return this.CycleColor + this.CycleValue + ChatColor.RESET;
  }
  /**
   * Transforms an array into a JSON representation.
   * @param value - The array to transform.
   * @param indentLevel - The indentation level for pretty-printing.
   */
  stringifyArray(value, ctx) {
    const indentSpace = this.Indent.repeat(ctx.indentLevel);
    if (value.length === 0) {
      return this.OpenCloseArrayColor + this.OpenArray + this.CloseArray + ChatColor.RESET;
    }
    let result = this.OpenCloseArrayColor + this.OpenArray + ChatColor.RESET + this.NewLine;
    let compactResult = this.OpenCloseArrayColor + this.OpenArray + ChatColor.RESET;
    value.forEach((item, index) => {
      result += indentSpace + this.Indent + this.stringifyValue(item, this.indent(ctx));
      result += index < value.length - 1 ? this.Comma + this.NewLine : this.NewLine;
      compactResult += this.stringifyValue(item, this.indent(ctx));
      compactResult += index < value.length - 1 ? this.Comma + this.Space : "";
    });
    result += indentSpace + this.OpenCloseArrayColor + this.CloseArray + ChatColor.RESET;
    compactResult += this.OpenCloseArrayColor + this.CloseArray + ChatColor.RESET;
    if (compactResult.length < this.InlineThreshold) {
      return compactResult;
    }
    return result;
  }
  /**
   * Transforms an object into a truncated JSON representation.
   * @param value - The object to transform.
   * @param className - Class Name of the object.
   * @param indentLevel - The indentation level for pretty-printing.
   */
  stringifyTruncatedObject(value, className, ctx) {
    return (this.IncludeClassNames ? this.ClassColor + "" + this.ClassStyle + className + ChatColor.RESET + this.Space : "") + this.TruncatedObjectValue;
  }
  /**
   * Transforms an object into a JSON representation.
   * @param value - The object to transform.
   * @param className - Class Name of the object.
   * @param entries - Entries of the object to transform.
   * @param indentLevel - The indentation level for pretty-printing.
   */
  stringifyObject(value, className, entries, ctx) {
    const indentSpace = this.Indent.repeat(ctx.indentLevel);
    const prefix = this.IncludeClassNames && className !== "Object" ? this.ClassColor + "" + this.ClassStyle + className + ChatColor.RESET + this.Space : "";
    if (entries.length === 0) {
      return prefix + this.OpenCloseObjectColor + this.OpenObject + this.CloseObject + ChatColor.RESET;
    }
    let result = prefix + this.OpenCloseObjectColor + this.OpenObject + ChatColor.RESET + this.NewLine;
    let compactResult = prefix + this.OpenCloseObjectColor + this.OpenObject + ChatColor.RESET;
    entries.forEach(([key, val], index) => {
      const compactVal = this.stringifyValue(val, this.indent(ctx));
      result += indentSpace + this.Indent + this.KeyColor + this.KeyDelimiter + key + this.KeyDelimiter + ChatColor.RESET + this.KeyValueSeparator + this.Space + compactVal;
      result += index < entries.length - 1 ? this.Comma + this.NewLine : this.NewLine;
      compactResult += this.KeyColor + key + ChatColor.RESET + this.KeyValueSeparator + this.Space + compactVal;
      compactResult += index < entries.length - 1 ? this.Comma + this.Space : "";
    });
    result += indentSpace + this.OpenCloseObjectColor + this.CloseObject + ChatColor.RESET;
    compactResult += this.OpenCloseObjectColor + this.CloseObject + ChatColor.RESET;
    if (compactResult.length < this.InlineThreshold) {
      return compactResult;
    }
    return result;
  }
  shouldTruncateObject(value, className, ctx) {
    return !(className === "Object" || ctx.indentLevel <= this.MaxDepth || this.MaxDepth <= 0);
  }
  /**
   * Transforms a value of any type into a JSON representation. This function is not meant to be overridden.
   * @param value - The value to transform.
   * @param indentLevel - The indentation level for pretty-printing.
   */
  stringifyValue(value, ctx) {
    if (value === null)
      return this.stringifyNull();
    if (value === void 0)
      return this.stringifyUndefined();
    if (typeof value === "number")
      return this.stringifyNumber(value);
    if (typeof value === "string")
      return this.stringifyString(value);
    if (typeof value === "boolean")
      return this.stringifyBoolean(value);
    if (typeof value === "function")
      return this.stringifyFunction(value);
    if (this.isCycle(value, ctx)) {
      return this.stringifyCycle();
    }
    this.markCycle(value, ctx);
    if (Array.isArray(value)) {
      const result = this.stringifyArray(value, ctx.indentLevel ? this.indent(ctx) : ctx);
      this.clearCycle(value, ctx);
      return result;
    }
    if (typeof value === "object") {
      const name = value.constructor.name;
      if (!this.shouldTruncateObject(value, name, ctx)) {
        const keySet = /* @__PURE__ */ new Set();
        let prototype = Object.getPrototypeOf(value);
        let keys = Object.keys(prototype);
        while (keys.length > 0) {
          keys.forEach((key) => keySet.add(key));
          prototype = Object.getPrototypeOf(prototype);
          keys = Object.keys(prototype);
        }
        Object.keys(value).forEach((key) => keySet.add(key));
        keySet.delete("__cycleDetection__");
        const allKeys = [...keySet].sort();
        const entries = allKeys.map((key) => {
          try {
            return [key, value[key] ?? void 0];
          } catch (e) {
            return [key, void 0];
          }
        }).filter(([, val]) => typeof val !== "function" && val !== void 0);
        const result = this.stringifyObject(value, name, entries, ctx);
        this.clearCycle(value, ctx);
        return result;
      } else {
        const result = this.stringifyTruncatedObject(value, name, ctx);
        this.clearCycle(value, ctx);
        return result;
      }
    }
    this.clearCycle(value, ctx);
    return ChatColor.RESET + value.toString();
  }
  /**
   * Escapes a string for JSON.
   * @param str - The string to escape.
   */
  escapeString(str) {
    return str.replace(/\\/g, this.EscapeColor + "\\\\" + this.StringColor).replace(/"/g, this.EscapeColor + '\\"' + this.StringColor).replace(/\n/g, this.EscapeColor + "\\n" + this.StringColor).replace(/\r/g, this.EscapeColor + "\\r" + this.StringColor).replace(/\t/g, this.EscapeColor + "\\t" + this.StringColor);
  }
  markCycle(value, ctx) {
    ctx.visited.add(value);
  }
  isCycle(value, ctx) {
    return ctx.visited.has(value);
  }
  clearCycle(value, ctx) {
    ctx.visited.delete(value);
  }
  indent(ctx) {
    return { ...ctx, indentLevel: ctx.indentLevel + 1 };
  }
}, /**
 * The default ColorJSON instance
 */
__publicField(_a2, "DEFAULT", new _a2()), /**
 * A ColorJSON instance that does not colorize anything.
 */
__publicField(_a2, "PLAIN", _a2.createPlain()), _a2);
var sourceMapping = void 0;
try {
  sourceMapping = globalSourceMapping;
} catch (e) {
}
var _a3;
var LogLevel = (_a3 = class {
  /**
   * The constructor for each log level.
   *
   * @param {number} level - The numerical level for this logger.
   * @param {string} name - The string name for this logger.
   * @param {ChatColor} color - The color to use for this logger. Defaults to `ChatColor.RESET`.
   */
  constructor(level, name, color = ChatColor.RESET) {
    this.level = level;
    this.name = name;
    this.color = color;
  }
  /**
   * Return the logging level as a string.
   *
   * @returns {string} The string representation of the logging level.
   */
  toString() {
    return this.color + this.name.toUpperCase() + ChatColor.RESET;
  }
  /**
   * Parse a string to get the corresponding `LogLevel`.
   *
   * @param {string} str - The string to parse.
   * @returns {LogLevel} The corresponding `LogLevel`, or `undefined` if none was found.
   */
  static parse(str) {
    str = str.toLowerCase();
    for (const level of _a3.values) {
      if (level.name === str)
        return level;
    }
    const num = parseInt(str);
    if (!isNaN(num)) {
      for (const level of _a3.values) {
        if (level.level === num)
          return level;
      }
    }
    return void 0;
  }
}, __publicField(_a3, "All", new _a3(-2, "all")), __publicField(_a3, "Trace", new _a3(-2, "trace", ChatColor.DARK_AQUA)), __publicField(_a3, "Debug", new _a3(-1, "debug", ChatColor.AQUA)), __publicField(_a3, "Info", new _a3(0, "info", ChatColor.GREEN)), __publicField(_a3, "Warn", new _a3(1, "warn", ChatColor.GOLD)), __publicField(_a3, "Error", new _a3(2, "error", ChatColor.RED)), __publicField(_a3, "Fatal", new _a3(3, "fatal", ChatColor.DARK_RED)), __publicField(_a3, "Off", new _a3(100, "off")), /**
 * The list of all available log levels.
 */
__publicField(_a3, "values", [
  _a3.All,
  _a3.Trace,
  _a3.Debug,
  _a3.Info,
  _a3.Warn,
  _a3.Error,
  _a3.Fatal,
  _a3.Off
]), _a3);
function starMatch(pattern, str) {
  if (pattern === "*")
    return true;
  if (pattern.includes("*")) {
    if (pattern.startsWith("*")) {
      return str.endsWith(pattern.substring(1));
    }
    if (pattern.endsWith("*")) {
      return str.startsWith(pattern.substring(0, pattern.length - 1));
    }
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    return regex.test(str);
  }
  return pattern === str;
}
var loggingSettings = {
  level: LogLevel.Info,
  filter: ["*"],
  outputTags: false,
  formatFunction: (level, logger, message, tags = void 0) => {
    const _tags = tags !== void 0 ? `\xA77${tags.map((tag) => `[${tag}]`).join("")}\xA7r` : "";
    return `[${level}][${ChatColor.MATERIAL_EMERALD}${logger.name}${ChatColor.RESET}]${_tags} ${message}`;
  },
  messagesJoinFunction: (messages) => {
    return messages.join(" ");
  },
  jsonFormatter: ColorJSON.DEFAULT,
  outputConfig: {
    [LogLevel.Trace.level]: [
      0,
      1
      /* ConsoleInfo */
    ],
    [LogLevel.Debug.level]: [
      0,
      1
      /* ConsoleInfo */
    ],
    [LogLevel.Info.level]: [
      0,
      1
      /* ConsoleInfo */
    ],
    [LogLevel.Warn.level]: [
      0,
      1,
      2
      /* ConsoleWarn */
    ],
    [LogLevel.Error.level]: [
      0,
      1,
      3
      /* ConsoleError */
    ],
    [LogLevel.Fatal.level]: [
      0,
      1,
      3
      /* ConsoleError */
    ]
  }
};
var _a4;
var Logger = (_a4 = class {
  /**
   * Construct a new Logger
   *
   * @param {string} name - The name of the Logger.
   * @param {string[]} tags - The tags for the logger as strings.
   */
  constructor(name, tags = []) {
    this.name = name;
    this.tags = tags;
  }
  /**
   *  Initialize logger class
   */
  static init() {
    LOGGING: {
      if (_a4.initialized)
        return;
      _a4.initialized = true;
      system2.afterEvents.scriptEventReceive.subscribe((ev) => {
        if (ev.id === "logging:level" || ev.id === "log:level") {
          if (!ev.message) {
            loggingSettings.level = LogLevel.Info;
            world2.sendMessage(
              `${ChatColor.AQUA}Logging level set to ${ChatColor.BOLD}${loggingSettings.level}`
            );
          } else {
            const level = LogLevel.parse(ev.message);
            if (level) {
              loggingSettings.level = level;
              world2.sendMessage(
                `${ChatColor.AQUA}Logging level set to ${ChatColor.BOLD}${loggingSettings.level}`
              );
            } else {
              world2.sendMessage(
                `${ChatColor.DARK_RED}Invalid logging level: ${ev.message}`
              );
            }
          }
        } else if (ev.id === "logging:filter" || ev.id === "log:filter") {
          if (!ev.message) {
            loggingSettings.filter = ["*"];
          } else {
            loggingSettings.filter = ev.message.split(",");
          }
          world2.sendMessage(
            `${ChatColor.AQUA}Logging filter set to ${ChatColor.BOLD}${loggingSettings.filter.join(", ")}`
          );
        }
      });
    }
  }
  /**
   * @param {LogLevel} level - The level to set.
   */
  static setLevel(level) {
    loggingSettings.level = level;
  }
  /**
   * Filter the loggers by the given tags. Tags can use the `*` wildcard.
   * @param {'*' | string[]} filter - The filter to set.
   */
  static setFilter(filter) {
    loggingSettings.filter = filter;
  }
  /**
   * Set the format function for the logger.
   * @param {function} func - The function to set.
   */
  static setFormatFunction(func) {
    loggingSettings.formatFunction = func;
  }
  /**
   * Set the function, that joins multiple messages into one for the logger.
   * @param {function} func - The function to set.
   */
  static setMessagesJoinFunction(func) {
    loggingSettings.messagesJoinFunction = func;
  }
  /**
   * Set the tag visibility for the logger. When true, tags will be printed in the log. Disabled by default.
   * @param visible
   */
  static setTagsOutputVisibility(visible) {
    loggingSettings.outputTags = visible;
  }
  /**
   * Set the JSON formatter for the logger.
   * @param {ColorJSON} formatter - The json formatter to set.
   */
  static setJsonFormatter(formatter) {
    loggingSettings.jsonFormatter = formatter;
  }
  /**
   * Get the output configuration for the logger.
   * @returns {OutputConfig} The output configuration.
   */
  static getOutputConfig() {
    return loggingSettings.outputConfig;
  }
  /**
   * Returns a new Logger.
   *
   * @param {string} name - The name of the Logger.
   * @param {string[]} tags - The tags for the Logger as strings.
   *
   * @returns {Logger} A new Logger.
   */
  static getLogger(name, ...tags) {
    LOGGING: {
      if (!_a4.initialized) {
        _a4.init();
      }
    }
    return new _a4(name, tags);
  }
  /**
   * Log messages with the level set.
   *
   * @param {LogLevel} level - The LogLevel to log the messages at.
   * @param {array} message - An array of the messages to log.
   */
  log(level, ...message) {
    LOGGING: {
      if (level.level < loggingSettings.level.level)
        return;
      if (loggingSettings.filter.length === 0 || this.tags.length === 0) {
        this.logRaw(level, ...message);
        return;
      }
      for (const filter of loggingSettings.filter) {
        if (filter.startsWith("!")) {
          if (starMatch(filter.substring(1), this.name) || this.tags.some((tag) => starMatch(filter.substring(1), tag))) {
            return;
          }
        }
        if (starMatch(filter, this.name) || this.tags.some((tag) => starMatch(filter, tag))) {
          this.logRaw(level, ...message);
          return;
        }
      }
    }
  }
  stringifyError(x) {
    let stack = x.stack ?? "";
    if (sourceMapping) {
      const stackLineRegex = /\(([^)]+\.js):(\d+)(?::(\d+))?\)/;
      stack = stack.split("\n").map((line) => {
        const match = stackLineRegex.exec(line);
        if (match) {
          const filePath = match[1];
          const lineNumber = parseInt(match[2], 10) - sourceMapping.metadata.offset;
          if (filePath.includes(sourceMapping.metadata.filePath)) {
            const mappingEntry = globalSourceMapping[lineNumber];
            if (mappingEntry) {
              const replacement = `(${mappingEntry.source}:${mappingEntry.originalLine})`;
              return line.replace(stackLineRegex, replacement);
            }
          }
        }
        return line;
      }).join("\n");
    }
    return `${ChatColor.DARK_RED}${ChatColor.BOLD}${x.message}
${ChatColor.RESET}${ChatColor.GRAY}${ChatColor.ITALIC}${stack}${ChatColor.RESET}`;
  }
  /**
   * Internal function to log messages with the level set, that bypasses the filters.
   *
   * @param {LogLevel} level - The LogLevel to log the messages at.
   * @param {array} message - An array of the messages to log.
   */
  logRaw(level, ...message) {
    LOGGING: {
      const msgs = message.map((x) => {
        if (x === void 0) {
          return ChatColor.GOLD + "undefined" + ChatColor.RESET;
        }
        if (x === null) {
          return ChatColor.GOLD + "null" + ChatColor.RESET;
        }
        if (x && x instanceof Error) {
          return this.stringifyError(x);
        }
        if (typeof x === "object" || Array.isArray(x)) {
          return loggingSettings.jsonFormatter.stringify(x) + ChatColor.RESET;
        }
        return x.toString() + ChatColor.RESET;
      });
      const formatted = loggingSettings.formatFunction(
        level,
        this,
        loggingSettings.messagesJoinFunction(msgs),
        loggingSettings.outputTags ? this.tags : void 0
      );
      const outputs = loggingSettings.outputConfig[level.level] || [
        0,
        1
        /* ConsoleInfo */
      ];
      if (outputs.includes(
        0
        /* Chat */
      )) {
        try {
          world2.sendMessage(formatted);
        } catch (_) {
          system2.run(() => {
            world2.sendMessage(formatted);
          });
        }
      }
      if (outputs.includes(
        1
        /* ConsoleInfo */
      )) {
        if (console.originalLog) {
          console.originalLog(ChatColor.stripColor(formatted));
        } else {
          console.log(ChatColor.stripColor(formatted));
        }
      }
      if (outputs.includes(
        2
        /* ConsoleWarn */
      )) {
        console.warn(formatted);
      }
      if (outputs.includes(
        3
        /* ConsoleError */
      )) {
        console.error(formatted);
      }
    }
  }
  /**
   * Logs a trace message.
   *
   * @param {...unknown} message - The message(s) to be logged.
   */
  trace(...message) {
    LOGGING:
      this.log(LogLevel.Trace, ...message);
  }
  /**
   * Logs debug message.
   *
   * @param {...unknown[]} message - The message(s) to be logged.
   */
  debug(...message) {
    LOGGING:
      this.log(LogLevel.Debug, ...message);
  }
  /**
   * Logs an informational message.
   *
   * @param {...unknown[]} message - The message(s) to be logged.
   */
  info(...message) {
    LOGGING:
      this.log(LogLevel.Info, ...message);
  }
  /**
   * Logs a warning message.
   *
   * @param {...unknown[]} message - The warning message or messages to be logged.
   */
  warn(...message) {
    LOGGING:
      this.log(LogLevel.Warn, ...message);
  }
  /**
   * Logs an error message.
   *
   * @param {...unknown[]} message - The error message(s) to log.
   */
  error(...message) {
    LOGGING:
      this.log(LogLevel.Error, ...message);
  }
  /**
   * Logs a fatal error.
   *
   * @param {unknown[]} message - The error message to log.
   */
  fatal(...message) {
    LOGGING:
      this.log(LogLevel.Fatal, ...message);
  }
}, __publicField(_a4, "initialized", false), _a4);
var _a5;
var Vec3 = (_a5 = class {
  constructor(x, y, z) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    if (x === Direction.Down) {
      this.x = 0;
      this.y = -1;
      this.z = 0;
    } else if (x === Direction.Up) {
      this.x = 0;
      this.y = 1;
      this.z = 0;
    } else if (x === Direction.North) {
      this.x = 0;
      this.y = 0;
      this.z = -1;
    } else if (x === Direction.South) {
      this.x = 0;
      this.y = 0;
      this.z = 1;
    } else if (x === Direction.East) {
      this.x = 1;
      this.y = 0;
      this.z = 0;
    } else if (x === Direction.West) {
      this.x = -1;
      this.y = 0;
      this.z = 0;
    } else if (typeof x === "number") {
      this.x = x;
      this.y = y;
      this.z = z;
    } else if (Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2];
    } else if (x instanceof _a5) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else {
      if (!x || !x.x && x.x !== 0 || !x.y && x.y !== 0 || !x.z && x.z !== 0) {
        _a5.log.error(new Error("Invalid vector"), x);
        throw new Error("Invalid vector");
      }
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    }
  }
  static from(x, y, z) {
    if (x instanceof _a5)
      return x;
    if (typeof x === "number" && y !== void 0 && z !== void 0) {
      return new _a5(x, y, z);
    }
    if (Array.isArray(x)) {
      return new _a5(x);
    }
    if (x === Direction.Down)
      return _a5.Down;
    if (x === Direction.Up)
      return _a5.Up;
    if (x === Direction.North)
      return _a5.North;
    if (x === Direction.South)
      return _a5.South;
    if (x === Direction.East)
      return _a5.East;
    if (x === Direction.West)
      return _a5.West;
    if (!x || !x.x && x.x !== 0 || !x.y && x.y !== 0 || !x.z && x.z !== 0) {
      _a5.log.error(new Error("Invalid arguments"), x, y, z);
      throw new Error("Invalid arguments");
    }
    return new _a5(
      x.x,
      x.y,
      x.z
    );
  }
  static _from(x, y, z) {
    if (x instanceof _a5)
      return x;
    if (typeof x === "number" && y !== void 0 && z !== void 0) {
      return new _a5(x, y, z);
    }
    if (Array.isArray(x)) {
      return new _a5(x);
    }
    if (x === Direction.Down)
      return _a5.Down;
    if (x === Direction.Up)
      return _a5.Up;
    if (x === Direction.North)
      return _a5.North;
    if (x === Direction.South)
      return _a5.South;
    if (x === Direction.East)
      return _a5.East;
    if (x === Direction.West)
      return _a5.West;
    if (!x || !x.x && x.x !== 0 || !x.y && x.y !== 0 || !x.z && x.z !== 0) {
      _a5.log.error(new Error("Invalid arguments"), x, y, z);
      throw new Error("Invalid arguments");
    }
    return new _a5(
      x.x,
      x.y,
      x.z
    );
  }
  /**
   * Creates a copy of the current vector.
   *
   * @returns A new vector with the same values as the current vector.
   */
  copy() {
    return new _a5(this.x, this.y, this.z);
  }
  static fromYawPitch(yawOrRotation, pitch) {
    let yaw;
    if (typeof yawOrRotation === "number") {
      yaw = yawOrRotation;
      pitch = pitch;
    } else {
      yaw = yawOrRotation.y;
      pitch = yawOrRotation.x;
    }
    const psi = yaw * (Math.PI / 180);
    const theta = pitch * (Math.PI / 180);
    const x = Math.cos(theta) * Math.sin(psi);
    const y = Math.sin(theta);
    const z = Math.cos(theta) * Math.cos(psi);
    return new _a5(x, y, z);
  }
  static fromRotation(yawOrRotation, pitch) {
    let yaw;
    if (typeof yawOrRotation === "number") {
      yaw = yawOrRotation;
      pitch = pitch;
    } else {
      yaw = yawOrRotation.y;
      pitch = yawOrRotation.x;
    }
    const psi = yaw * (Math.PI / 180);
    const theta = pitch * (Math.PI / 180);
    const x = -Math.cos(theta) * Math.sin(psi);
    const y = -Math.sin(theta);
    const z = Math.cos(theta) * Math.cos(psi);
    return new _a5(x, y, z);
  }
  /**
   * Converts the normal vector to yaw and pitch values.
   *
   * @returns A Vector2 containing the yaw and pitch values.
   * @deprecated Use toRotation() instead. This method returns inverted values and will be removed in the future.
   */
  toYawPitch() {
    if (this.isZero()) {
      _a5.log.error(
        new Error("Cannot convert zero-length vector to direction")
      );
      throw new Error("Cannot convert zero-length vector to direction");
    }
    const direction = this.normalize();
    const yaw = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
    const pitch = Math.asin(direction.y) * (180 / Math.PI);
    return {
      x: pitch,
      y: yaw
    };
  }
  /**
   * Converts the normal vector to yaw and pitch values.
   *
   * @returns A Vector2 containing the yaw and pitch values.
   */
  toRotation() {
    if (this.isZero()) {
      _a5.log.error(
        new Error("Cannot convert zero-length vector to direction")
      );
      throw new Error("Cannot convert zero-length vector to direction");
    }
    const direction = this.normalize();
    const yaw = -Math.atan2(direction.x, direction.z) * (180 / Math.PI);
    const pitch = Math.asin(-direction.y) * (180 / Math.PI);
    return {
      x: pitch,
      y: yaw
    };
  }
  add(x, y, z) {
    const v = _a5._from(x, y, z);
    return _a5.from(v.x + this.x, v.y + this.y, v.z + this.z);
  }
  subtract(x, y, z) {
    const v = _a5._from(x, y, z);
    return _a5.from(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  multiply(x, y, z) {
    if (typeof x === "number" && y === void 0 && z === void 0) {
      return _a5.from(this.x * x, this.y * x, this.z * x);
    }
    const v = _a5._from(x, y, z);
    return _a5.from(v.x * this.x, v.y * this.y, v.z * this.z);
  }
  /**
   * Scales the current vector by a scalar.
   *
   * @param scalar - The scalar to scale the vector by.
   * @returns The updated vector after scaling.
   */
  scale(scalar) {
    return _a5.from(this.x * scalar, this.y * scalar, this.z * scalar);
  }
  divide(x, y, z) {
    if (typeof x === "number" && y === void 0 && z === void 0) {
      if (x === 0)
        throw new Error("Cannot divide by zero");
      return _a5.from(this.x / x, this.y / x, this.z / x);
    }
    const v = _a5._from(x, y, z);
    if (v.x === 0 || v.y === 0 || v.z === 0)
      throw new Error("Cannot divide by zero");
    return _a5.from(this.x / v.x, this.y / v.y, this.z / v.z);
  }
  /**
   * Normalizes the vector to have a length (magnitude) of 1.
   * Normalized vectors are often used as a direction vectors.
   *
   * @returns The normalized vector.
   */
  normalize() {
    if (this.isZero()) {
      _a5.log.error(new Error("Cannot normalize zero-length vector"));
      throw new Error("Cannot normalize zero-length vector");
    }
    const len = this.length();
    return _a5.from(this.x / len, this.y / len, this.z / len);
  }
  /**
   * Computes the length (magnitude) of the vector.
   *
   * @returns The length of the vector.
   */
  length() {
    return Math.hypot(this.x, this.y, this.z);
  }
  /**
   * Computes the squared length of the vector.
   * This is faster than computing the actual length and can be useful for comparison purposes.
   *
   * @returns The squared length of the vector.
   */
  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  cross(x, y, z) {
    const v = _a5._from(x, y, z);
    return _a5.from(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  distance(x, y, z) {
    const v = _a5._from(x, y, z);
    return this.subtract(v).length();
  }
  distanceSquared(x, y, z) {
    const v = _a5._from(x, y, z);
    return this.subtract(v).lengthSquared();
  }
  /**
   * Computes the linear interpolation between the current vector and another vector, when t is in the range [0, 1].
   * Computes the extrapolation when t is outside this range.
   *
   * @param v - The other vector.
   * @param t - The interpolation factor.
   * @returns A new vector after performing the lerp operation.
   */
  lerp(v, t) {
    if (!v || !t)
      return _a5.from(this);
    if (t === 1)
      return _a5.from(v);
    if (t === 0)
      return _a5.from(this);
    return _a5.from(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }
  /**
   * Computes the spherical linear interpolation between the current vector and another vector, when t is in the range [0, 1].
   * Computes the extrapolation when t is outside this range.
   *
   * @param v - The other vector.
   * @param t - The interpolation factor.
   * @returns A new vector after performing the slerp operation.
   */
  slerp(v, t) {
    if (!v || !t)
      return _a5.from(this);
    if (t === 1)
      return _a5.from(v);
    if (t === 0)
      return _a5.from(this);
    const dot = this.dot(v);
    const theta = Math.acos(dot) * t;
    const relative = _a5.from(v).subtract(this.multiply(dot)).normalize();
    return this.multiply(Math.cos(theta)).add(
      relative.multiply(Math.sin(theta))
    );
  }
  dot(x, y, z) {
    const v = _a5._from(x, y, z);
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  angleBetween(x, y, z) {
    const v = _a5._from(x, y, z);
    const dotProduct = this.dot(v);
    const lenSq1 = this.lengthSquared();
    if (lenSq1 === 0) {
      return 0;
    }
    const lenSq2 = v.lengthSquared();
    if (lenSq2 === 0) {
      return 0;
    }
    const denom = Math.sqrt(lenSq1 * lenSq2);
    const cosAngle = Math.min(1, Math.max(-1, dotProduct / denom));
    return Math.acos(cosAngle);
  }
  projectOnto(x, y, z) {
    const v = _a5._from(x, y, z);
    if (v.isZero()) {
      return _a5.Zero;
    }
    const denom = v.dot(v);
    if (denom === 0) {
      return _a5.Zero;
    }
    const scale = this.dot(v) / denom;
    return _a5.from(v.x * scale, v.y * scale, v.z * scale);
  }
  reflect(x, y, z) {
    const normal = _a5._from(x, y, z);
    const proj = this.projectOnto(normal);
    return this.subtract(proj.multiply(2));
  }
  /**
   * Rotates the current normalized vector by a given angle around a given axis.
   *
   * @param axis - The axis of rotation.
   * @param angle - The angle of rotation in degrees.
   * @returns The rotated vector.
   */
  rotate(axis, angle) {
    const halfAngle = angle * Math.PI / 180 / 2;
    const w = Math.cos(halfAngle);
    const x = axis.x * Math.sin(halfAngle);
    const y = axis.y * Math.sin(halfAngle);
    const z = axis.z * Math.sin(halfAngle);
    const v = this;
    const qv_x = w * w * v.x + 2 * y * w * v.z - 2 * z * w * v.y + x * x * v.x + 2 * y * x * v.y + 2 * z * x * v.z - z * z * v.x - y * y * v.x;
    const qv_y = 2 * x * y * v.x + y * y * v.y + 2 * z * y * v.z + 2 * w * z * v.x - z * z * v.y + w * w * v.y - 2 * x * w * v.z - x * x * v.y;
    const qv_z = 2 * x * z * v.x + 2 * y * z * v.y + z * z * v.z - 2 * w * y * v.x - y * y * v.z + 2 * w * x * v.y - x * x * v.z + w * w * v.z;
    return new _a5(qv_x, qv_y, qv_z);
  }
  /**
   * Updates the X, Y, and Z components of the vector.
   *
   * @param x - The function to use to update the X value.
   * @param y - The function to use to update the Y value.
   * @param z - The function to use to update the Z value.
   * @returns The updated vector with the new values.
   */
  update(x, y, z) {
    if (!x) {
      x = (value) => value;
    }
    if (!y) {
      y = (value) => value;
    }
    if (!z) {
      z = (value) => value;
    }
    return new _a5(x(this.x), y(this.y), z(this.z));
  }
  setX(value) {
    if (typeof value === "number") {
      return new _a5(value, this.y, this.z);
    }
    return new _a5(value(this.x), this.y, this.z);
  }
  setY(value) {
    if (typeof value === "number") {
      return new _a5(this.x, value, this.z);
    }
    return new _a5(this.x, value(this.y), this.z);
  }
  setZ(value) {
    if (typeof value === "number") {
      return new _a5(this.x, this.y, value);
    }
    return new _a5(this.x, this.y, value(this.z));
  }
  /**
   * Calculates the shortest distance between a point (represented by this Vector3 instance) and a line segment.
   *
   * This method finds the perpendicular projection of the point onto the line defined by the segment. If this
   * projection lies outside the line segment, then the method calculates the distance from the point to the
   * nearest segment endpoint.
   *
   * @param start - The starting point of the line segment.
   * @param end - The ending point of the line segment.
   * @returns The shortest distance between the point and the line segment.
   */
  distanceToLineSegment(start, end) {
    const lineDirection = _a5.from(end).subtract(start);
    if (lineDirection.lengthSquared() === 0) {
      return this.subtract(start).length();
    }
    const t = Math.max(
      0,
      Math.min(
        1,
        this.subtract(start).dot(lineDirection) / lineDirection.dot(lineDirection)
      )
    );
    const projection = _a5.from(start).add(lineDirection.multiply(t));
    return this.subtract(projection).length();
  }
  /**
   * Floors the X, Y, and Z components of the vector.
   * @returns A new vector with the floored components.
   */
  floor() {
    return this.update(Math.floor, Math.floor, Math.floor);
  }
  /**
   * Floors the X component of the vector.
   * @returns A new vector with the floored X component.
   */
  floorX() {
    return this.setX(Math.floor);
  }
  /**
   * Floors the Y component of the vector.
   * @returns A new vector with the floored Y component.
   */
  floorY() {
    return this.setY(Math.floor);
  }
  /**
   * Floors the Z component of the vector.
   * @returns A new vector with the floored Z component.
   */
  floorZ() {
    return this.setZ(Math.floor);
  }
  /**
   * Ceils the X, Y, and Z components of the vector.
   * @returns A new vector with the ceiled components.
   */
  ceil() {
    return new _a5(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
  }
  /**
   * Ceils the X component of the vector.
   * @returns A new vector with the ceiled X component.
   */
  ceilX() {
    return this.setX(Math.ceil);
  }
  /**
   * Ceils the Y component of the vector.
   * @returns A new vector with the ceiled Y component.
   */
  ceilY() {
    return this.setY(Math.ceil);
  }
  /**
   * Ceils the Z component of the vector.
   * @returns A new vector with the ceiled Z component.
   */
  ceilZ() {
    return this.setZ(Math.ceil);
  }
  /**
   * Rounds the X, Y, and Z components of the vector.
   * @returns A new vector with the rounded components.
   */
  round() {
    return this.update(Math.round, Math.round, Math.round);
  }
  /**
   * Rounds the X component of the vector.
   * @returns A new vector with the rounded X component.
   */
  roundX() {
    return this.setX(Math.round);
  }
  /**
   * Rounds the Y component of the vector.
   * @returns A new vector with the rounded Y component.
   */
  roundY() {
    return this.setY(Math.round);
  }
  /**
   * Rounds the Z component of the vector.
   * @returns A new vector with the rounded Z component.
   */
  roundZ() {
    return this.setZ(Math.round);
  }
  /**
   * Returns a new vector offset from the current vector up by 1 block.
   * @returns A new vector offset from the current vector up by 1 block.
   */
  up() {
    return this.add(_a5.Up);
  }
  /**
   * Returns a new vector offset from the current vector down by 1 block.
   * @returns A new vector offset from the current vector down by 1 block.
   */
  down() {
    return this.add(_a5.Down);
  }
  /**
   * Returns a new vector offset from the current vector north by 1 block.
   * @returns A new vector offset from the current vector north by 1 block.
   */
  north() {
    return this.add(_a5.North);
  }
  /**
   * Returns a new vector offset from the current vector south by 1 block.
   * @returns A new vector offset from the current vector south by 1 block.
   */
  south() {
    return this.add(_a5.South);
  }
  /**
   * Returns a new vector offset from the current vector east by 1 block.
   * @returns A new vector offset from the current vector east by 1 block.
   */
  east() {
    return this.add(_a5.East);
  }
  /**
   * Returns a new vector offset from the current vector west by 1 block.
   * @returns A new vector offset from the current vector west by 1 block.
   */
  west() {
    return this.add(_a5.West);
  }
  /**
   * Checks if the current vector is equal to the zero vector.
   * @returns true if the vector is equal to the zero vector, else returns false.
   */
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  /**
   * Converts the vector to an array containing the X, Y, and Z components of the vector.
   * @returns An array containing the X, Y, and Z components of the vector.
   */
  toArray() {
    return [this.x, this.y, this.z];
  }
  /**
   * Converts the vector to a direction.
   * If the vector is not a unit vector, then it will be normalized and rounded to the nearest direction.
   */
  toDirection() {
    if (this.isZero()) {
      _a5.log.error(
        new Error("Cannot convert zero-length vector to direction")
      );
      throw new Error("Cannot convert zero-length vector to direction");
    }
    const normalized = this.normalize();
    const maxValue = Math.max(
      Math.abs(normalized.x),
      Math.abs(normalized.y),
      Math.abs(normalized.z)
    );
    if (maxValue === normalized.x)
      return Direction.East;
    if (maxValue === -normalized.x)
      return Direction.West;
    if (maxValue === normalized.y)
      return Direction.Up;
    if (maxValue === -normalized.y)
      return Direction.Down;
    if (maxValue === normalized.z)
      return Direction.South;
    if (maxValue === -normalized.z)
      return Direction.North;
    _a5.log.error(new Error("Cannot convert vector to direction"), this);
    throw new Error("Cannot convert vector to direction");
  }
  /**
   * Returns a new vector with the X, Y, and Z components rounded to the nearest block location.
   */
  toBlockLocation() {
    return _a5.from(
      (this.x << 0) - (this.x < 0 && this.x !== this.x << 0 ? 1 : 0),
      (this.y << 0) - (this.y < 0 && this.y !== this.y << 0 ? 1 : 0),
      (this.z << 0) - (this.z < 0 && this.z !== this.z << 0 ? 1 : 0)
    );
  }
  almostEqual(x, y, z, delta) {
    try {
      let other;
      if (typeof x !== "number" && z === void 0) {
        other = _a5._from(x, void 0, void 0);
        delta = y;
      } else {
        other = _a5._from(x, y, z);
      }
      return Math.abs(this.x - other.x) <= delta && Math.abs(this.y - other.y) <= delta && Math.abs(this.z - other.z) <= delta;
    } catch (e) {
      return false;
    }
  }
  equals(x, y, z) {
    try {
      const other = _a5._from(x, y, z);
      return this.x === other.x && this.y === other.y && this.z === other.z;
    } catch (e) {
      return false;
    }
  }
  /**
   * Converts the vector to a string representation.
   *
   * @param format - The format of the string representation. Defaults to "long".
   * @param separator - The separator to use between components. Defaults to ", ".
   * @returns The string representation of the vector.
   * @remarks
   * The "long" format is "Vec3(x, y, z)".
   * The "short" format is "x, y, z".
   */
  toString(format = "long", separator = ", ") {
    const result = `${this.x + separator + this.y + separator + this.z}`;
    return format === "long" ? `Vec3(${result})` : result;
  }
  /**
   * Parses a string representation of a vector.
   *
   * @param str - The string representation of the vector.
   * @param format - The format of the string representation. Defaults to "long".
   * @param separator - The separator to use between components. Defaults to ", ".
   * @returns The vector parsed from the string.
   * @throws {Error} If the string format is invalid.
   */
  static fromString(str, format = "long", separator = ", ") {
    if (format === "long") {
      const match = str.match(/^Vec3\((.*)\)$/);
      if (!match) {
        throw new Error("Invalid string format");
      }
      const components = match[1].split(separator);
      if (components.length !== 3) {
        throw new Error("Invalid string format");
      }
      return _a5.from(Number(components[0]), Number(components[1]), Number(components[2]));
    } else {
      const components = str.split(separator);
      if (components.length !== 3) {
        throw new Error("Invalid string format");
      }
      return _a5.from(Number(components[0]), Number(components[1]), Number(components[2]));
    }
  }
}, __publicField(_a5, "log", Logger.getLogger(
  "vec3",
  "vec3",
  "bedrock-boost"
)), /**
 * Zero vector
 */
__publicField(_a5, "Zero", new _a5(0, 0, 0)), /**
 * Down vector, negative towards Y
 */
__publicField(_a5, "Down", new _a5(Direction.Down)), /**
 * Up vector, positive towards Y
 */
__publicField(_a5, "Up", new _a5(Direction.Up)), /**
 * North vector, negative towards Z
 */
__publicField(_a5, "North", new _a5(Direction.North)), /**
 * South vector, positive towards Z
 */
__publicField(_a5, "South", new _a5(Direction.South)), /**
 * East vector, positive towards X
 */
__publicField(_a5, "East", new _a5(Direction.East)), /**
 * West vector, negative towards X
 */
__publicField(_a5, "West", new _a5(Direction.West)), _a5);
var _a6;
var Timings = (_a6 = class {
  /**
   * Begin measuring the time it takes to perform an operation.
   * @remarks
   * If another operation is already being measured, the measurement will be ended.
   * 
   * @param operation The name of the operation.
   */
  static begin(operation) {
    this.end();
    this.lastTime = (/* @__PURE__ */ new Date()).getTime();
    this.lastOperation = operation;
  }
  /**
   * End measuring the time it takes to perform an operation and log the result.
   * @remarks
   * If no operation is being measured, this method will do nothing.
   */
  static end() {
    const time = (/* @__PURE__ */ new Date()).getTime();
    if (this.lastTime > 0) {
      _a6.log.debug(`Operation ${this.lastOperation} took ${time - this.lastTime}ms`);
    }
    this.lastTime = -1;
  }
}, __publicField(_a6, "log", Logger.getLogger("Timings", "timings")), __publicField(_a6, "lastTime", -1), __publicField(_a6, "lastOperation", ""), _a6);
function isValid(entity) {
  const f = Object.getPrototypeOf(entity).isValid;
  if (typeof f === "function") {
    return f.call(entity);
  }
  return entity.isValid;
}
var log = Logger.getLogger("jobUtils", "bedrock-boost", "jobUtils");
var _a7;
var PulseScheduler = (_a7 = class {
  /**
   * Creates a new PulseScheduler instance.
   * @param period The period of the scheduler.
   */
  constructor(processor, period) {
    __publicField(this, "items", []);
    __publicField(this, "period");
    __publicField(this, "currentTick", 0);
    __publicField(this, "runId");
    __publicField(this, "nextIndex", 0);
    __publicField(this, "executionSchedule", []);
    __publicField(this, "processor");
    if (period <= 0) {
      throw new Error("Period must be a positive integer.");
    }
    if (!processor || typeof processor !== "function") {
      throw new Error("Processor function must be defined.");
    }
    this.period = period;
    this.processor = processor;
  }
  /**
   * Adds an item to the schedule.
   * @param item The item to be added.
   * @deprecated Use `push` instead.
   */
  add(item) {
    this.push(item);
  }
  /**
    * Adds multiple items to the schedule.
    * 
    * @param items - The items to be added.
    * @deprecated Use `push` instead.
    */
  addAll(items) {
    this.push(...items);
  }
  /**
   * Removes an item from the schedule at the specified index.
   * @param index - The index of the item to remove.
   */
  remove(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      if (index < this.nextIndex) {
        this.nextIndex--;
      }
      this.recalculateExecutionSchedule();
    }
  }
  /**
   * Removes items from the schedule that satisfy the given predicate.
   * 
   * @param predicate - The predicate function used to determine if an item should be removed.
   */
  removeIf(predicate) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (predicate(this.items[i])) {
        this.remove(i);
      }
    }
  }
  /**
   * Returns a list of the items in the schedule.
   */
  getItems() {
    return this.items;
  }
  /**
   * Starts the schedule.
   */
  start() {
    this.stop();
    this.currentTick = 0;
    this.nextIndex = 0;
    this.runId = system4.runInterval(() => this.tick(), 1);
  }
  /**
   * Stops the schedule.
   */
  stop() {
    if (this.runId !== void 0) {
      system4.clearRun(this.runId);
      this.runId = void 0;
    }
  }
  recalculateExecutionSchedule() {
    const totalExecutions = this.items.length;
    this.executionSchedule = new Array(this.period).fill(0);
    if (totalExecutions === 0) {
      return;
    }
    const interval = this.period / totalExecutions;
    for (let i = 0; i < totalExecutions; i++) {
      this.executionSchedule[Math.round(interval * i) % this.period]++;
    }
  }
  tick() {
    if (this.items.length === 0) {
      _a7.log.trace("No items to process.");
      return;
    }
    const scheduledExecutions = this.executionSchedule[this.currentTick];
    if (scheduledExecutions === 0) {
      _a7.log.trace("No items to process this tick.");
      this.currentTick = (this.currentTick + 1) % this.period;
      if (this.currentTick === 0) {
        this.nextIndex = 0;
      }
      return;
    }
    let executed = 0;
    for (; this.nextIndex < this.items.length && executed < scheduledExecutions; this.nextIndex++) {
      try {
        this.processor(this.items[this.nextIndex]);
      } catch (e) {
        _a7.log.error("Error processing item", e);
      }
      executed++;
    }
    this.currentTick = (this.currentTick + 1) % this.period;
    if (this.currentTick === 0) {
      this.nextIndex = 0;
    }
  }
  push(...items) {
    this.items.push(...items);
    this.recalculateExecutionSchedule();
    return this.items.length;
  }
  pop() {
    const item = this.items.pop();
    this.recalculateExecutionSchedule();
    return item;
  }
  shift() {
    const item = this.items.shift();
    this.recalculateExecutionSchedule();
    return item;
  }
  unshift(...items) {
    this.items.unshift(...items);
    this.recalculateExecutionSchedule();
    return this.items.length;
  }
  splice(start, deleteCount = 0, ...items) {
    const removed = this.items.splice(start, deleteCount, ...items);
    this.recalculateExecutionSchedule();
    return removed;
  }
}, __publicField(_a7, "log", Logger.getLogger("PulseScheduler", "bedrock-boost", "pulse-scheduler")), _a7);
var _a8;
var EntityPulseScheduler = (_a8 = class extends PulseScheduler {
  /**
   * Creates a new EntityPulseScheduler instance.
   * @param period The period of the scheduler.
   * @param queryOptions The query options to use when querying for entities.
   */
  constructor(processor, period, queryOptions) {
    super((t) => {
      if (isValid(t)) {
        processor(t);
      } else {
        this.removeIf((entity) => !isValid(entity));
      }
    }, period);
    this.queryOptions = queryOptions;
    this.push(
      ...world4.getDimension("minecraft:overworld").getEntities(this.queryOptions)
    );
    this.push(
      ...world4.getDimension("minecraft:nether").getEntities(this.queryOptions)
    );
    this.push(
      ...world4.getDimension("minecraft:the_end").getEntities(this.queryOptions)
    );
  }
  compareEntities(a, b) {
    return a.id === b.id;
  }
  start() {
    world4.afterEvents.entityLoad.subscribe((event) => {
      this.addIfMatchesWithRetry(event.entity);
    });
    world4.afterEvents.entitySpawn.subscribe((event) => {
      this.addIfMatchesWithRetry(event.entity);
    });
    world4.afterEvents.entityRemove.subscribe((event) => {
      this.removeIf(
        (entity) => !isValid(entity) || entity.id === event.removedEntityId
      );
    });
    super.start();
  }
  /**
   * Adds an entity to the scheduler if it matches the query options. In case the entity is not valid, it will retry a tick later.
   * @param entity The entity to add.
   */
  addIfMatchesWithRetry(entity) {
    try {
      if (!entity) {
        return;
      }
      if (!isValid(entity)) {
        system5.runInterval(() => {
          if (isValid(entity) && entity.matches(this.queryOptions)) {
            this.push(entity);
          }
        }, 1);
      } else if (entity.matches(this.queryOptions)) {
        this.push(entity);
      }
    } catch (e) {
      _a8.logger.debug(
        "Failed to push entity to scheduler.",
        e
      );
    }
  }
  push(...items) {
    const filtered = items.filter(
      (item) => isValid(item) && !this.items.some(
        (existingItem) => this.compareEntities(existingItem, item)
      )
    );
    return super.push(...filtered);
  }
  unshift(...items) {
    const filtered = items.filter(
      (item) => isValid(item) && !this.items.some(
        (existingItem) => this.compareEntities(existingItem, item)
      )
    );
    return super.unshift(...filtered);
  }
  splice(start, deleteCount, ...items) {
    if (deleteCount === void 0) {
      return super.splice(start);
    }
    const filtered = items.filter(
      (item) => !this.items.some(
        (existingItem) => this.compareEntities(existingItem, item)
      )
    );
    return super.splice(start, deleteCount, ...filtered);
  }
}, __publicField(_a8, "logger", Logger.getLogger(
  "EntityPulseScheduler",
  "bedrock-boost",
  "entity-pulse-scheduler"
)), _a8);
var _a9;
var PlayerPulseScheduler = (_a9 = class extends PulseScheduler {
  /**
   * Creates a new PlayerPulseScheduler instance.
   * @param period The period of the scheduler.
   */
  constructor(processor, period) {
    super((t) => {
      if (isValid(t)) {
        processor(t);
      } else {
        this.removeIf((entity) => !isValid(entity));
      }
    }, period);
    this.push(...world5.getAllPlayers());
  }
  compareEntities(a, b) {
    return a.id === b.id;
  }
  start() {
    world5.afterEvents.playerJoin.subscribe((event) => {
      let attempts = 0;
      const pushPlayer = () => {
        attempts++;
        if (attempts > 10) {
          _a9.logger.debug("Failed to push player to scheduler after 10 attempts.");
          return;
        }
        try {
          const player = world5.getEntity(event.playerId);
          if (player === void 0) {
            system6.runTimeout(pushPlayer, 1);
          }
          if (player instanceof Player22) {
            this.push(player);
          }
        } catch (e) {
          _a9.logger.debug("Failed to push player to scheduler.", e);
          system6.runTimeout(pushPlayer, 1);
        }
      };
      pushPlayer();
    });
    world5.afterEvents.playerLeave.subscribe((event) => {
      this.removeIf((entity) => !isValid(entity) || entity.id === event.playerId);
    });
    super.start();
  }
  push(...items) {
    const filtered = items.filter((item) => isValid(item) && !this.items.some((existingItem) => this.compareEntities(existingItem, item)));
    return super.push(...filtered);
  }
  unshift(...items) {
    const filtered = items.filter((item) => isValid(item) && !this.items.some((existingItem) => this.compareEntities(existingItem, item)));
    return super.unshift(...filtered);
  }
  splice(start, deleteCount, ...items) {
    if (deleteCount === void 0) {
      return super.splice(start);
    }
    const filtered = items.filter((item) => !this.items.some((existingItem) => this.compareEntities(existingItem, item)));
    return super.splice(start, deleteCount, ...filtered);
  }
}, __publicField(_a9, "logger", Logger.getLogger("PlayerPulseScheduler", "bedrock-boost", "player-pulse-scheduler")), _a9);
var _a10;
var DirectionUtils = (_a10 = class {
}, /**
 * The opposite directions of the given directions.
 */
__publicField(_a10, "Opposites", {
  [Direction2.Down]: Direction2.Up,
  [Direction2.Up]: Direction2.Down,
  [Direction2.North]: Direction2.South,
  [Direction2.South]: Direction2.North,
  [Direction2.East]: Direction2.West,
  [Direction2.West]: Direction2.East
}), /**
 * The positive perpendicular directions of the given directions.
 */
__publicField(_a10, "PositivePerpendiculars", {
  [Direction2.Down]: [Direction2.East, Direction2.North],
  [Direction2.Up]: [Direction2.East, Direction2.North],
  [Direction2.North]: [Direction2.East, Direction2.Up],
  [Direction2.South]: [Direction2.East, Direction2.Up],
  [Direction2.East]: [Direction2.North, Direction2.Up],
  [Direction2.West]: [Direction2.North, Direction2.Up]
}), /**
 * The negative perpendicular directions of the given directions.
 */
__publicField(_a10, "NegativePerpendiculars", {
  [Direction2.Down]: [Direction2.West, Direction2.South],
  [Direction2.Up]: [Direction2.West, Direction2.South],
  [Direction2.North]: [Direction2.West, Direction2.Down],
  [Direction2.South]: [Direction2.West, Direction2.Down],
  [Direction2.East]: [Direction2.South, Direction2.Down],
  [Direction2.West]: [Direction2.South, Direction2.Down]
}), /**
 * All directions.
 */
__publicField(_a10, "Values", [
  Direction2.Down,
  Direction2.Up,
  Direction2.North,
  Direction2.South,
  Direction2.East,
  Direction2.West
]), _a10);
var log2 = Logger.getLogger("itemUtils", "bedrock-boost", "itemUtils");

// Public API surface of bedrock-boost present in the bundled subset.
export {
  ChatColor,
  ColorJSON,
  DirectionUtils,
  EntityPulseScheduler,
  LogLevel,
  Logger,
  PlayerPulseScheduler,
  PulseScheduler,
  Timings,
  Vec3
};
