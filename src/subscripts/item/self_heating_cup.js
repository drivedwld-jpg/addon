import {
  world as world46,
  Player as Player26,
  EntityComponentTypes as EntityComponentTypes11,
  EquipmentSlot as EquipmentSlot6,
  ItemStack as ItemStack5
} from "@minecraft/server";
var ID_FULL = "shapescape_bewe:self_heating_cup_6";
world46.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (player instanceof Player26) {
    const ITEM_TAGS = itemStack.getTags();
    if (!ITEM_TAGS.includes("shapescape_bewe:self_heating_cup"))
      return;
    if (itemStack.typeId === ID_FULL)
      return;
    let raycastHit = player.getBlockFromViewDirection({
      includeLiquidBlocks: true,
      maxDistance: 32
    });
    if (raycastHit) {
      let block = raycastHit.block;
      if (block.typeId !== "minecraft:water")
        return;
      let distance = getDistance(player.location, raycastHit.block.location);
      if (distance > 5)
        return;
      const inventory = player.getComponent(EntityComponentTypes11.Equippable);
      if (!inventory)
        return;
      let item = new ItemStack5(ID_FULL, 1);
      inventory.setEquipment(EquipmentSlot6.Mainhand, item);
      player.playSound("bucket.fill_water", { pitch: 1.6 });
    }
  }
});
world46.afterEvents.itemStartUseOn.subscribe(({ source: player, itemStack, block }) => {
  if (player instanceof Player26 && itemStack) {
    const ITEM_TAGS = itemStack.getTags();
    if (!ITEM_TAGS.includes("shapescape_bewe:self_heating_cup"))
      return;
    if (itemStack.typeId === ID_FULL)
      return;
    if (block.typeId === "minecraft:cauldron") {
      let liquid = block.permutation.getState("cauldron_liquid");
      let fill_level = block.permutation.getState("fill_level");
      if (liquid !== "water" || fill_level === 0)
        return;
    }
    const inventory = player.getComponent(EntityComponentTypes11.Equippable);
    if (!inventory)
      return;
    let item = new ItemStack5(ID_FULL, 1);
    inventory.setEquipment(EquipmentSlot6.Mainhand, item);
    player.playSound("bucket.fill_water", { pitch: 1.6 });
  }
});
function getDistance(vector1, vector2) {
  const dx = vector2.x - vector1.x;
  const dy = vector2.y - vector1.y;
  const dz = vector2.z - vector1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
