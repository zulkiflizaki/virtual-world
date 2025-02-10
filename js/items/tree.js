class Tree {
  constructor(center, size, heightCoefficient = 0.3) {
    this.center = center;
    this.size = size; // size of the base
    this.heightCoefficient = heightCoefficient;
    this.base = this.#generateTreeLevel(center, size);
  }

  #generateTreeLevel(point, size) {
    const points = [];
    const radius = size / 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
      const fixedRandomSitting =
        Math.cos(((a + this.center.x) * size) % 17) ** 2;
      const noisyRadius =
        radius * linearInterpolation(0.5, 1, fixedRandomSitting);
      points.push(translate(point, a, noisyRadius));
    }
    return new Polygon(points);
  }

  draw(ctx, viewPoint) {
    const difference = subtract(this.center, viewPoint);

    const top = add(this.center, scale(difference, this.heightCoefficient));

    const treeLevelCount = 7;
    for (let level = 0; level < treeLevelCount; level++) {
      const t = level / (treeLevelCount - 1);
      const point = linearInterpolation2D(this.center, top, t);
      const color = "rgb(30, " + linearInterpolation(50, 200, t) + ", 70)";
      const size = linearInterpolation(this.size, 40, t);

      const polygon = this.#generateTreeLevel(point, size);
      polygon.draw(ctx, { fill: color, stroke: "rgba(0, 0, 0, 0)" });
    }
  }
}
