class Polygon {
  constructor(points) {
    this.points = points;
    this.segments = [];
    for (let i = 1; i <= points.length; i++) {
      this.segments.push(new Segment(points[i - 1], points[i % points.length]));
    }
  }

  static union(polygons) {
    Polygon.multiBreak(polygons);
    const keepSegments = [];
    for (let i = 0; i < polygons.length; i++) {
      for (const segment of polygons[i].segments) {
        let keep = true;
        for (let j = 0; j < polygons.length; j++) {
          if (i != j) {
            if (polygons[j].containsSegment(segment)) {
              keep = false;
              break;
            }
          }
        }
        if (keep) {
          keepSegments.push(segment);
        }
      }
    }
    return keepSegments;
  }

  static multiBreak(polygons) {
    for (let i = 0; i < polygons.length; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  static break(polygon1, polygon2) {
    const segment1 = polygon1.segments;
    const segment2 = polygon2.segments;
    for (let i = 0; i < segment1.length; i++) {
      for (let j = 0; j < segment2.length; j++) {
        const intersection = getIntersection(
          segment1[i].p1,
          segment1[i].p2,
          segment2[j].p1,
          segment2[j].p2
        );
        if (
          intersection &&
          intersection.offset != 1 &&
          intersection.offset != 0
        ) {
          const point = new Point(intersection.x, intersection.y);
          let reference = segment1[i].p2;
          segment1[i].p2 = point;
          segment1.splice(i + 1, 0, new Segment(point, reference));
          reference = segment2[j].p2;
          segment2[j].p2 = point;
          segment2.splice(j + 1, 0, new Segment(point, reference));
        }
      }
    }
  }

  distanceToPoint(point) {
    return Math.min(
      ...this.segments.map((segment) => segment.distanceToPoint(point))
    );
  }

  distanceToPolygon(polygon) {
    return Math.min(
      ...this.points.map((point) => polygon.distanceToPoint(point))
    );
  }

  intersectsPolygon(polygons) {
    for (let s1 of this.segments) {
      for (let s2 of polygons.segments) {
        if (getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)) {
          return true;
        }
      }
    }
    return false;
  }

  containsSegment(segment) {
    const midpoint = average(segment.p1, segment.p2);
    return this.containsPoint(midpoint);
  }

  containsPoint(point) {
    const outerPoint = new Point(-1000, -1000);
    let intersectionCount = 0;
    for (const segment of this.segments) {
      const intersection = getIntersection(
        outerPoint,
        point,
        segment.p1,
        segment.p2
      );
      if (intersection) {
        intersectionCount++;
      }
    }
    return intersectionCount % 2 == 1;
  }

  drawSegments(ctx) {
    for (const segment of this.segments) {
      segment.draw(ctx, { color: getRandomColor(), width: 5 });
    }
  }

  draw(
    ctx,
    { stroke = "blue", lineWidth = 2, fill = "rgba(0, 0, 255, 0.3)" } = {}
  ) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
