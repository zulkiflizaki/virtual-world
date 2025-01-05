class World {
  constructor(
    graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinLength = 150,
    spacing = 50,
    treeSize = 160
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.envelopes = [];
    this.roadBorders = [];
    this.buildings = [];
    this.trees = [];

    this.generate();
  }

  generate() {
    this.envelopes.length = 0;
    for (const segment of this.graph.segments) {
      this.envelopes.push(
        new Envelope(segment, this.roadWidth, this.roadRoundness)
      );
    }
    this.roadBorders = Polygon.union(this.envelopes.map((e) => e.polygon));
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders.map((segment) => [segment.p1, segment.p2]).flat(),
      ...this.buildings.map((building) => building.points).flat(),
    ];
    const left = Math.min(...points.map((point) => point.x));
    const right = Math.max(...points.map((point) => point.x));
    const bottom = Math.min(...points.map((point) => point.y));
    const top = Math.max(...points.map((point) => point.y));

    const illegalPolygons = [
      ...this.buildings,
      ...this.envelopes.map((e) => e.polygon),
    ];

    const trees = [];
    let tryCount = 0;

    while (tryCount < 100) {
      const point = new Point(
        linearInterpolation(left, right, Math.random()),
        linearInterpolation(top, bottom, Math.random())
      );

      // check if tree is inside or nearby a building or too close to a road
      let keep = true;
      for (const polygon of illegalPolygons) {
        if (
          polygon.containsPoint(point) ||
          polygon.distanceToPoint(point) < this.treeSize / 2
        ) {
          keep = false;
          break;
        }
      }

      // check if tree is too close to another tree
      if (keep) {
        for (const tree of trees) {
          if (distance(tree, point) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }

      // avoid trees to be generated in the middle of nowhere
      if (keep) {
        let closeToSomething = false;
        for (const polygon of illegalPolygons) {
          if (polygon.distanceToPoint(point) < this.treeSize * 2) {
            closeToSomething = true;
            break;
          }
        }
        keep = closeToSomething;
      }

      if (keep) {
        trees.push(point);
        tryCount = 0;
      }
      tryCount++;
    }
    return trees;
  }

  #generateBuildings() {
    const temporaryEnvelopes = [];
    for (const segment of this.graph.segments) {
      temporaryEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness
        )
      );
    }

    const guides = Polygon.union(temporaryEnvelopes.map((e) => e.polygon));
    for (let i = 0; i < guides.length; i++) {
      const segment = guides[i];
      if (segment.length() < this.buildingMinLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports = [];
    for (let segment of guides) {
      const len = segment.length() + this.spacing;
      const buildingCount = Math.floor(
        len / (this.buildingMinLength + this.spacing)
      );
      const buildingLength = len / buildingCount - this.spacing;

      const direction = segment.directionVector();

      let q1 = segment.p1;
      let q2 = add(q1, scale(direction, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i < buildingCount; i++) {
        q1 = add(q2, scale(direction, this.spacing));
        q2 = add(q1, scale(direction, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = [];
    for (const segment of supports) {
      bases.push(new Envelope(segment, this.buildingWidth).polygon);
    }

    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPolygon(bases[j]) ||
          bases[i].distanceToPolygon(bases[j]) < this.spacing
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases;
  }

  draw(ctx) {
    for (const envelope of this.envelopes) {
      envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
    }
    for (const segment of this.graph.segments) {
      segment.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
    }
    for (const segment of this.roadBorders) {
      segment.draw(ctx, { color: "white", width: 4 });
    }
    for (const tree of this.trees) {
      tree.draw(ctx, { size: this.treeSize, color: "#rgba(0,0,0,0.5)" });
    }
    for (const building of this.buildings) {
      building.draw(ctx);
    }
  }
}
