// 위치와 힘을 사용하는 기존 Particle 구조를 자동차 움직임으로 확장합니다.
class Car {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.angle = -HALF_PI;
    this.speed = 0;
    this.acc = 0;
    this.w = 34;
    this.length = 60;
  }

  addForce(force) {
    this.acc += force;
  }

  corners() {
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
      const forward = x * this.length / 2;
      const sideways = y * this.w / 2;
      return createVector(
        this.pos.x + cos(this.angle) * forward - sin(this.angle) * sideways,
        this.pos.y + sin(this.angle) * forward + cos(this.angle) * sideways
      );
    });
  }

  update(step, steering, braking) {
    this.speed += this.acc * step;
    this.speed *= Math.pow(braking ? 0.78 : 0.985, step);
    this.speed = constrain(this.speed, -2, 3.4);
    if (abs(this.speed) < 0.025) this.speed = 0;
    // 후진할 때 조향 방향도 실제 자동차처럼 반대로 바뀝니다.
    this.angle += steering * this.speed * 0.018 * step;
    this.pos.add(p5.Vector.fromAngle(this.angle).mult(this.speed * step));
    this.acc = 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rectMode(CENTER);
    noStroke();
    fill('#10202b');
    for (const x of [-19, 19]) {
      for (const y of [-18, 18]) rect(x, y, 14, 6, 2);
    }
    fill('#50c6ef');
    rect(0, 0, this.length, this.w, 8);
    fill('#163b53');
    rect(5, 0, 24, 26, 4);
    fill('#a4e7fa');
    rect(11, 0, 7, 23, 2);
    fill('#fff3bd');
    rect(27, -10, 4, 7, 1);
    rect(27, 10, 4, 7, 1);
    fill('#ff6b78');
    rect(-28, -11, 3, 6, 1);
    rect(-28, 11, 3, 6, 1);
    pop();
  }
}
