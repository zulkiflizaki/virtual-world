class Building {
  constructor(polygon, heightCoefficient = 0.4) {
    this.base = polygon;
    this.heightCoefficient = heightCoefficient;
  }

  draw(ctx, viewPoint) {
    const buildingTopPoints = this.base.points.map((point) =>
      add(point, scale(subtract(point, viewPoint), this.heightCoefficient))
    );

    const buildingCeiling = new Polygon(buildingTopPoints);

    const sides = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const nextI = (i + 1) % this.base.points.length; // next index
      const polygon = new Polygon([
        this.base.points[i],
        this.base.points[nextI],
        buildingTopPoints[nextI],
        buildingTopPoints[i],
      ]);
      sides.push(polygon);
    }
    sides.sort(
      (a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint)
    );

    this.base.draw(ctx, { fill: "white", stroke: "#AAA" });

    for (const side of sides) {
      side.draw(ctx, { fill: "white", stroke: "#AAA" });
    }
    buildingCeiling.draw(ctx, { fill: "white", stroke: "#AAA" });
  }
}
