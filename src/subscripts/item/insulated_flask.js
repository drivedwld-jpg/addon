import {
  world as world47,
  Player as Player27,
  EntityComponentTypes as EntityComponentTypes12,
  EquipmentSlot as EquipmentSlot7,
  ItemStack as ItemStack6
} from "@minecraft/server";
var ID_FULL2 = "shapescape_bewe:insulated_flask_6";
world47.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (player instanceof Player27) {
    const ITEM_TAGS = itemStack.getTags();
    if (!ITEM_TAGS.includes("shapescape_bewe:insulated_flask"))
      return;
    if (itemStack.typeId === ID_FULL2)
      return;
    let raycastHit = player.getBlockFromViewDirection({
      includeLiquidBlocks: true,
      maxDistance: 32
    });
    if (raycastHit) {
      let block = raycastHit.block;
      if (block.typeId !== "minecraft:water")
        return;
      let distance = getDistance2(player.location, raycastHit.block.location);
      if (distance > 5)
        return;
      const inventory = player.getComponent(EntityComponentTypes12.Equippable);
      if (!inventory)
        return;
      let item = new ItemStack6(ID_FULL2, 1);
      inventory.setEquipment(EquipmentSlot7.Mainhand, item);
      player.playSound("bucket.fill_water", { pitch: 1.6 });
    }
  }
});
world47.afterEvents.itemStartUseOn.subscribe((event) => {
  const { source: player, itemStack, block } = event;
  if (player instanceof Player27 && itemStack) {
    const ITEM_TAGS = itemStack.getTags();
    if (!ITEM_TAGS.includes("shapescape_bewe:insulated_flask"))
      return;
    if (itemStack.typeId === ID_FULL2)
      return;
    if (block.typeId === "minecraft:cauldron") {
      let liquid = block.permutation.getState("cauldron_liquid");
      let fill_level = block.permutation.getState("fill_level");
      if (liquid !== "water" || fill_level === 0)
        return;
    }
    const inventory = player.getComponent(EntityComponentTypes12.Equippable);
    if (!inventory)
      return;
    let item = new ItemStack6(ID_FULL2, 1);
    inventory.setEquipment(EquipmentSlot7.Mainhand, item);
    player.playSound("bucket.fill_water", { pitch: 1.6 });
  }
});
function getDistance2(vector1, vector2) {
  const dx = vector2.x - vector1.x;
  const dy = vector2.y - vector1.y;
  const dz = vector2.z - vector1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
