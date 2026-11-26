import { Vec3 } from "../vendor/bedrock-boost.js";
import { bookName, runPageInteraction } from "./guide_book_page_access.js";
import { Cartesian3D, globalCartesianSpace, linePlaneCollisionCoords } from "./guide_book_coordinates.js";
function getBookInteractionCoordinates(book, player) {
  const bookOrigin = Vec3.from(book.location).add(0, 1.5, 0);
  let sourceEntityDirection = Vec3.from(book.location).subtract(player.location).setY(0).normalize();
  let sourceEntityYaw = Math.atan2(sourceEntityDirection.z, sourceEntityDirection.x) * (180 / Math.PI);
  const bookX = sourceEntityDirection.rotate(Vec3.from(0, 1, 0), -90);
  const bookY = Vec3.from(0, 1, 0).rotate(Vec3.from(0, 0, 1), -22.5).rotate(Vec3.from(0, 1, 0), -sourceEntityYaw);
  const bookZ = bookX.cross(bookY);
  const interactionPoint = linePlaneCollisionCoords(
    Vec3.from(player.getHeadLocation()),
    Vec3.from(player.getViewDirection()),
    bookOrigin,
    bookZ
  );
  if (interactionPoint == void 0) {
    return void 0;
  }
  let bookCartesianSpace;
  try {
    bookCartesianSpace = new Cartesian3D(bookOrigin, bookX, bookY);
  } catch (e) {
    return void 0;
  }
  const bookInteractionPoint = globalCartesianSpace.convertToOtherCoordinates(
    interactionPoint,
    bookCartesianSpace
  );
  if (bookInteractionPoint == void 0) {
    return void 0;
  }
  return { local: bookInteractionPoint, global: interactionPoint };
}
system35.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id != `shapescape_bewe:${bookName}_interaction`) {
    return;
  }
  const sourceEntity = event.sourceEntity;
  if (sourceEntity == void 0) {
    return;
  }
  const player = sourceEntity.dimension.getPlayers({
    location: sourceEntity.location,
    closest: 1
  })[0];
  const bookInteractionPoint = getBookInteractionCoordinates(
    sourceEntity,
    player
  );
  if (bookInteractionPoint == void 0) {
    return;
  }
  const { local, global } = bookInteractionPoint;
  runPageInteraction(sourceEntity, player, local.x, local.y, global);
});
