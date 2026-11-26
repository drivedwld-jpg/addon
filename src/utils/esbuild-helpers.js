// esbuild runtime helpers emitted for class-field down-leveling.
// Kept as a shared module because both the vendored library and
// subscripts/guide_book_coordinates.js rely on them at runtime.
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

export { __defProp, __defNormalProp, __publicField };
