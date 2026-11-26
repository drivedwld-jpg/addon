import { Vec3 } from "../vendor/bedrock-boost.js";
import { __publicField } from "../utils/esbuild-helpers.js";
var Cartesian3D = class {
  /**
   * Creates a new Cartesian3D coordinate system
   * @param origin the origin point of the coordinate system
   * @param x the x-axis of the coordinate system
   * @param y the y-axis of the coordinate system (must be perpendicular to x)
   */
  constructor(origin, x, y) {
    __publicField(this, "origin");
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    x = x.normalize();
    y = y.normalize();
    if (Math.abs(x.dot(y)) > 1e-5) {
      throw new Error("X and Y are not perpendicular");
    }
    this.origin = origin;
    this.x = x.normalize();
    this.y = y.normalize();
    this.z = x.cross(y).normalize();
  }
  /**
   * Converts a point from the coordinate system of this object to another
   * coordinate system
   * @param point a point expressed in the coordinate system of this object
   * @param otherCoordinates a target coordinate system to convert the
   * point to.
   * @returns coordinates of the point in the target coordinate system
   */
  convertToOtherCoordinates(point, otherCoordinates) {
    let originTranslation = point.subtract(otherCoordinates.origin);
    let xLocal = originTranslation.dot(otherCoordinates.x);
    let yLocal = originTranslation.dot(otherCoordinates.y);
    let zLocal = originTranslation.dot(otherCoordinates.z);
    let newPointX = this.x.multiply(xLocal);
    let newPointY = this.y.multiply(yLocal);
    let newPointZ = this.z.multiply(zLocal);
    let newPoint = newPointX.add(newPointY).add(newPointZ);
    return newPoint.add(this.origin);
  }
};
var globalCartesianSpace = new Cartesian3D(
  Vec3.from(0, 0, 0),
  Vec3.from(1, 0, 0),
  Vec3.from(0, 1, 0)
);
function linePlaneCollisionCoords(lineOrigin, lineDirection, planeOrigin, planeNormal) {
  const pointA = lineOrigin;
  const pointB = lineOrigin.add(lineDirection);
  const pointP = planeOrigin;
  const normal = planeNormal;
  const x1 = pointA.x;
  const y1 = pointA.y;
  const z1 = pointA.z;
  const x2 = pointB.x;
  const y2 = pointB.y;
  const z2 = pointB.z;
  const x0 = pointP.x;
  const y0 = pointP.y;
  const z0 = pointP.z;
  const a = normal.x;
  const b = normal.y;
  const c = normal.z;
  const d = a * x0 + b * y0 + c * z0;
  const denominator = a * (x2 - x1) + b * (y2 - y1) + c * (z2 - z1);
  if (denominator == 0) {
    return void 0;
  }
  const t = (d - a * x1 - b * y1 - c * z1) / denominator;
  const intersection = Vec3.from({
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
    z: z1 + t * (z2 - z1)
  });
  return intersection;
}

// Exports consumed by subscripts/guide_book_interaction.js
export { Cartesian3D, globalCartesianSpace, linePlaneCollisionCoords };
