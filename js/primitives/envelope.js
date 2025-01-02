class Envelope {
  constructor(skeleton, width, roundness = 1) {
    this.skeleton = skeleton;
    this.polygon = this.#generatePolygon(width, roundness);
  }

  #generatePolygon(width, roundness) {
    const { p1, p2 } = this.skeleton;

    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alpha_clockwise = alpha + Math.PI / 2;
    const alpha_counter_clockwise = alpha - Math.PI / 2;

    const points = [];
    const step = Math.PI / Math.max(1, roundness);
    const epsilon = step / 2;
    for (
      let i = alpha_counter_clockwise;
      i <= alpha_clockwise + epsilon;
      i += step
    ) {
      points.push(translate(p1, i, radius));
    }
    for (
      let i = alpha_counter_clockwise;
      i <= alpha_clockwise + epsilon;
      i += step
    ) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  draw(ctx, option) {
    this.polygon.draw(ctx, option);
  }
}
