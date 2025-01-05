class Segment {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  length() {
    return distance(this.p1, this.p2);
  }

  directionVector() {
    return normalize(subtract(this.p2, this.p1));
  }

  equals(segment) {
    return this.includes(segment.p1) && this.includes(segment.p2);
  }

  includes(point) {
    return this.p1.equals(point) || this.p2.equals(point);
  }

  distanceToPoint(point) {
    const projection = this.projectPoint(point);
    if (projection.offset > 0 && projection.offset < 1) {
      return distance(point, projection.point);
    }
    const distanceToPoint1 = distance(point, this.p1);
    const distanceToPoint2 = distance(point, this.p2);
    return Math.min(distanceToPoint1, distanceToPoint2);
  }

  projectPoint(point) {
    const a = subtract(point, this.p1);
    const b = subtract(this.p2, this.p1);
    const normalized = normalize(b);
    const scaler = dot(a, normalized);
    const projection = {
      point: add(this.p1, scale(normalized, scaler)),
      offset: scaler / magnitude(b),
    };
    return projection;
  }

  draw(ctx, { width = 2, color = "black", dash = [] } = {}) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
