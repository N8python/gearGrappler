function Gear({ x, y, spokeCount = 4, size, speed = 0.01 }) {
    const center = Bodies.polygon(x, y, spokeCount * 2, size, {
        //isStatic: true
    });
    center.rotationSpeed = speed;
    center.ignoreGravity = true;
    const spokes = [];
    const spokeConstraints = [];
    const sideLength = dist(center.vertices[0].x, center.vertices[0].y, center.vertices[1].x, center.vertices[1].y);
    //for (let i = 0; i < spokeCount; i++) {
    spokes.push(Bodies.rectangle(x, y - size * 1.45, sideLength * 0.9, size, {
        //isStatic: true
    }));
    spokeConstraints.push(Constraint.create({
        bodyA: spokes[spokes.length - 1],
        bodyB: center,
        pointA: {
            x: 0,
            y: size / 2
        },
        pointB: {
            x: 0,
            y: -(size * 1.45) / 2
        },
        length: 0,
        angleAStiffness: 1,
        angleAMin: 0,
        angleAMax: 0
    }))
    spokes.push(Bodies.rectangle(x, y + size * 1.45, sideLength * 0.9, size, {
        //isStatic: true
    }));
    spokeConstraints.push(Constraint.create({
            bodyA: spokes[spokes.length - 1],
            bodyB: center,
            pointA: {
                x: 0,
                y: -size / 2
            },
            pointB: {
                x: 0,
                y: (size * 1.45) / 2
            },
            length: 0,
            angleAStiffness: 1,
            angleAMin: 0,
            angleAMax: 0
        }))
        //}
    spokes.push(Bodies.rectangle(x - size * 1.45, y, size, sideLength * 0.9, {
        //isStatic: true
    }));
    spokeConstraints.push(Constraint.create({
        bodyA: spokes[spokes.length - 1],
        bodyB: center,
        pointA: {
            x: size / 2,
            y: 0
        },
        pointB: {
            x: -(size * 1.45) / 2,
            y: 0
        },
        length: 0,
        angleAStiffness: 1,
        angleAMin: 0,
        angleAMax: 0
    }))
    spokes.push(Bodies.rectangle(x + size * 1.45, y, size, sideLength * 0.9, {
        //isStatic: true
    }));
    spokeConstraints.push(Constraint.create({
        bodyA: spokes[spokes.length - 1],
        bodyB: center,
        pointA: {
            x: -size / 2,
            y: 0
        },
        pointB: {
            x: (size * 1.45) / 2,
            y: 0
        },
        length: 0,
        angleAStiffness: 1,
        angleAMin: 0,
        angleAMax: 0,
    }));
    spokes.forEach(spoke => {
        spoke.ignoreGravity = true;
        spoke.rotationSpeed = speed;
    })
    const compoundGear = Body.create({
        parts: [center, ...spokes],
        isStatic: true
    })
    compoundGear.rotationSpeed = speed;
    return {
        add() {
            World.add(engine.world, [compoundGear]);
        },
        draw() {
            var gravity = engine.world.gravity;
            //Body.applyForce(center, center.position, { x: center.mass * gravity.x, y: center.mass * gravity.y })
            fill(200);
            noStroke();
            drawVertices(center);
            spokes.forEach(spoke => {
                    drawVertices(spoke);
                })
                /*spokeConstraints.forEach(constraint => {
                    drawConstraint(constraint);
                })*/
        },
        turn() {
            //center.angle += 0.01;
            /*Body.setAngle(center, center.angle + 0.01);
            spokes.forEach(spoke => {
                Body.setAngle(spoke, spoke.angle + 0.01);
            })*/
            Body.setAngle(compoundGear, compoundGear.angle + speed);
        },
        bodies() {
            return compoundGear;
        },
        spokes() {
            return spokes;
        },
        constraints() {
            return [...spokeConstraints];
        },
        remove() {
            World.remove(engine.world, [compoundGear]);
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get size() {
            return size;
        }
    }
}