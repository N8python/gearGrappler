function drawCircle(body, x, y) {
    circle(x ? x : body.position.x, y ? y : body.position.y, body.circleRadius * 2);
}

function drawVertices({ vertices }) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

function drawPlayer({ bodies }) {
    /*body.bodies.forEach((b, i) => {
        if (i < body.bodies.length - 4) {
            line(b.position.x, b.position.y, body.bodies[i + 4].position.x, body.bodies[i + 4].position.y);
        }
    })*/
    beginShape();
    vertex(bodies[0].position.x, bodies[0].position.y);
    vertex(bodies[4].position.x, bodies[4].position.y);
    vertex(bodies[8].position.x, bodies[8].position.y);
    vertex(bodies[12].position.x, bodies[12].position.y);
    vertex(bodies[13].position.x, bodies[13].position.y);
    vertex(bodies[14].position.x, bodies[14].position.y);
    vertex(bodies[15].position.x, bodies[15].position.y);
    vertex(bodies[11].position.x, bodies[11].position.y);
    vertex(bodies[7].position.x, bodies[7].position.y);
    vertex(bodies[3].position.x, bodies[3].position.y);
    vertex(bodies[2].position.x, bodies[2].position.y);
    vertex(bodies[1].position.x, bodies[1].position.y);

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