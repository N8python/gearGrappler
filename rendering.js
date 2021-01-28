function drawCircle(body, x, y) {
    circle(x ? x : body.position.x, y ? y : body.position.y, body.circleRadius * 2);
}

function drawVertices({ vertices }, xOffset = 0, yOffset = 0) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x + xOffset, vertices[i].y + yOffset);
    }
    endShape(CLOSE);
}

function drawPlayer({ bodies }, xOffset = 0, yOffset = 0) {
    /*body.bodies.forEach((b, i) => {
        if (i < body.bodies.length - 4) {
            line(b.position.x, b.position.y, body.bodies[i + 4].position.x, body.bodies[i + 4].position.y);
        }
    })*/
    beginShape();
    vertex(bodies[0].position.x + xOffset, bodies[0].position.y + yOffset);
    vertex(bodies[4].position.x + xOffset, bodies[4].position.y + yOffset);
    vertex(bodies[8].position.x + xOffset, bodies[8].position.y + yOffset);
    vertex(bodies[12].position.x + xOffset, bodies[12].position.y + yOffset);
    vertex(bodies[13].position.x + xOffset, bodies[13].position.y + yOffset);
    vertex(bodies[14].position.x + xOffset, bodies[14].position.y + yOffset);
    vertex(bodies[15].position.x + xOffset, bodies[15].position.y + yOffset);
    vertex(bodies[11].position.x + xOffset, bodies[11].position.y + yOffset);
    vertex(bodies[7].position.x + xOffset, bodies[7].position.y + yOffset);
    vertex(bodies[3].position.x + xOffset, bodies[3].position.y + yOffset);
    vertex(bodies[2].position.x + xOffset, bodies[2].position.y + yOffset);
    vertex(bodies[1].position.x + xOffset, bodies[1].position.y + yOffset);

    //vertex(bodies[0].position.x, bodies[0].position.y, bodies[4].position.x, bodies[4].position.y);
    endShape(CLOSE);

}

function drawConstraint(c, amount = 1) {
    const startX = c.bodyA.position.x + c.pointA.x;
    const startY = c.bodyA.position.y + c.pointA.y
    const endX = c.bodyB.position.x + c.pointB.x;
    const endY = c.bodyB.position.y + c.pointB.y;
    line(startX, startY, startX + (endX - startX) * amount, startY + (endY - startY) * amount);
}

function drawGrapple(c, amount = 1) {
    let x1 = c.bodyA.position.x + c.pointA.x;
    let y1 = c.bodyA.position.y + c.pointA.y
    let x2 = c.bodyB.position.x + c.pointB.x;
    let y2 = c.bodyB.position.y + c.pointB.y;
    if (abs(x2 - x1) < 2) {
        x2 += 2;
    }
    if (abs(y2 - y1) < 2) {
        y2 += 2;
    }
    let angle;
    let magnitude = (50) * 0.9 ** grappleTick;
    if (grappleMax < 10) {
        magnitude /= 2;
    }
    if (grappleMax < 5) {
        magnitude /= 2;
    }
    let frequency = 10;
    let percent = amount;
    let xSlope;
    let ySlope;
    angle = createVector(x2 - x1, y2 - y1).heading();
    xSlope = (y2 - y1) / (x2 - x1);
    ySlope = (x2 - x1) / (y2 - y1);
    let total = xSlope + ySlope;
    xSlope = xSlope / total;
    ySlope = ySlope / total;
    if (abs(ySlope - xSlope) < 0.25) {
        ySlope = 0;
        xSlope *= 1.25;
    }
    let interX = x1;
    let interY = y1;
    let endX = Math.floor(x1 + (x2 - x1) * percent);
    let endY = Math.floor(y1 + (y2 - y1) * percent);
    let prevInterX = interX;
    let prevInterY = interY;
    let tick = 0;
    while (Math.floor(interX) !== endX && Math.floor(interY) !== endY) {
        interX += cos(angle);
        interY += sin(angle);
        let sinOffset = magnitude * sin(tick / frequency)
        line(prevInterX, prevInterY, interX + sinOffset * xSlope, interY + sinOffset * ySlope);
        prevInterX = interX + sinOffset * xSlope;
        prevInterY = interY + sinOffset * ySlope;
        tick += 1;
    }
    //line(startX, startY, startX + (endX - startX) * amount, startY + (endY - startY) * amount);
}