let car;
let collisions = 0;
let parkedTime = 0;
let won = false;
let collisionNotice = 0;
const parking = { x: 350, y: 66, w: 100, h: 130 };
const obstacles = [
  { x: 242, y: 83, w: 50, h: 96 },
  { x: 508, y: 83, w: 50, h: 96 },
  { x: 100, y: 260, w: 110, h: 48 },
  { x: 590, y: 260, w: 110, h: 48 }
];

function setup() {
  const canvas = createCanvas(800, 540);
  canvas.parent('game');
  textFont('sans-serif');
  document.getElementById('restart').addEventListener('click', resetGame);
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  });
  window.addEventListener('blur', () => {
    // 브라우저 밖으로 이동했을 때 입력이 남아 자동차가 움직이지 않도록 합니다.
    car.speed = 0;
    resetInput = true;
  });
  resetGame();
}

let resetInput = false;

function resetGame() {
  car = new Car(400, 440);
  collisions = 0;
  parkedTime = 0;
  won = false;
  collisionNotice = 0;
  resetInput = false;
  setStatus('초록색 주차 구역으로 이동하세요.');
}

function setStatus(message) {
  const status = document.getElementById('status');
  if (status.textContent !== message) status.textContent = message;
}

function draw() {
  const step = min(deltaTime / (1000 / 60), 2);
  drawLot();
  if (!won) {
    const oldPos = car.pos.copy();
    const oldAngle = car.angle;
    if (focused && !resetInput) {
      if (keyIsDown(UP_ARROW)) car.addForce(0.065);
      if (keyIsDown(DOWN_ARROW)) car.addForce(-0.065);
    }
    const steering = focused && !resetInput
      ? Number(keyIsDown(RIGHT_ARROW)) - Number(keyIsDown(LEFT_ARROW)) : 0;
    car.update(step, steering, keyIsDown(32) || !focused || resetInput);

    const corners = car.corners();
    if (corners.some(p => p.x < 22 || p.x > width - 22 || p.y < 22 || p.y > height - 22)
        || obstacles.some(obstacle => overlaps(corners, obstacle))) {
      car.pos = oldPos;
      car.angle = oldAngle;
      car.speed = 0;
      if (collisionNotice <= 0) collisions++;
      collisionNotice = 60;
    }

    const inside = car.corners().every(p => p.x > parking.x && p.x < parking.x + parking.w
      && p.y > parking.y && p.y < parking.y + parking.h);
    const aligned = abs(cos(car.angle)) < sin(PI / 15);
    if (inside && aligned && abs(car.speed) < 0.1) parkedTime += step;
    else parkedTime = 0;
    if (parkedTime >= 60) {
      won = true;
      car.speed = 0;
    }

    if (won) setStatus('주차 성공! 정확하게 정차했어요. 다시 시작해서 연습해 보세요.');
    else if (collisionNotice > 0) setStatus('충돌했어요! 반대 방향으로 천천히 빠져나오세요.');
    else if (inside && !aligned) setStatus('차체를 주차선과 나란하게 맞춰주세요.');
    else if (inside) setStatus('Space로 멈추고 1초 동안 정차하세요.');
    else setStatus('초록색 주차 구역으로 이동하세요.');
    collisionNotice = max(0, collisionNotice - step);
  }
  car.show();
  document.getElementById('speed').textContent = `속도 ${Math.round(abs(car.speed) * 12)} km/h`;
  document.getElementById('gear').textContent = won ? '주차 완료' : car.speed > 0 ? 'D · 전진' : car.speed < 0 ? 'R · 후진' : '정차';
  document.getElementById('hits').textContent = `충돌 ${collisions}회`;
}

// 분리축 정리: 회전한 자동차와 사각형 장애물의 실제 겹침을 검사합니다.
function overlaps(points, box) {
  const other = [createVector(box.x, box.y), createVector(box.x + box.w, box.y),
    createVector(box.x + box.w, box.y + box.h), createVector(box.x, box.y + box.h)];
  const axes = [createVector(1, 0), createVector(0, 1)];
  for (let i = 0; i < 2; i++) {
    const edge = p5.Vector.sub(points[i + 1], points[i]);
    axes.push(createVector(-edge.y, edge.x));
  }
  return axes.every(axis => {
    const a = points.map(p => p.dot(axis));
    const b = other.map(p => p.dot(axis));
    return Math.max(...a) > Math.min(...b) && Math.max(...b) > Math.min(...a);
  });
}

function drawLot() {
  background('#202e3b');
  noFill();
  stroke('#526170');
  strokeWeight(3);
  rect(21, 21, width - 42, height - 42, 16);
  for (let x = 250; x <= 550; x += 100) line(x, 65, x, 200);
  line(250, 65, 550, 65);
  fill(won ? '#245f50' : '#24483f');
  stroke('#70e1ae');
  rect(parking.x, parking.y, parking.w, parking.h, 5);
  noStroke();
  fill('#9df5cc');
  textAlign(CENTER, CENTER);
  textSize(36);
  text('P', 400, 115);
  textSize(12);
  text(won ? 'COMPLETE' : 'PARK HERE', 400, 159);
  for (const box of obstacles) {
    fill('#101d29');
    rect(box.x + 4, box.y + 5, box.w, box.h, 9);
    fill('#788796');
    rect(box.x, box.y, box.w, box.h, 9);
    fill('#354b60');
    rect(box.x + 9, box.y + 12, box.w - 18, box.h - 24, 5);
  }
  fill('#8194a5');
  textSize(13);
  text('S T A R T', 400, 490);
}

function keyPressed() {
  resetInput = false;
  if (key === 'r' || key === 'R') resetGame();
}
