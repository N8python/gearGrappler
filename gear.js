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
    //const color = [0, 0, 0];
    /*let cpool = random(255, 255 * 3);
    let idxs = [0, 1, 2].sort(() => Math.random() - 0.5);
    idxs.forEach(i => {
        let c = random(0.3, 0.7);
        color[i] = cpool * c;
        cpool *= (1 - c);
    });*/
    let colors = [
        [221, 46, 68],
        [193, 105, 79],
        [244, 144, 12],
        [253, 203, 88],
        [120, 177, 89],
        [85, 172, 238],
        [170, 142, 214],
        [230, 231, 232]
    ]
    colors = colors.map(color => color.map(x => x * 0.75));
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
        add() {
            World.add(engine.world, [compoundGear]);
        },
        draw() {
            var gravity = engine.world.gravity;
            //Body.applyForce(center, center.position, { x: center.mass * gravity.x, y: center.mass * gravity.y })
            for (let i = 0; i < 5; i++) {
                stroke(...color.concat(125 - 12.5 * 2 * i));
                strokeWeight(10);
                noFill();
                //fill(0, 0, 0, 0)
                push();
                translate(center.position.x, center.position.y);
                scale(1 + (0.15 / 5) * i);
                //noStroke();
                drawVertices(center, -center.position.x, -center.position.y);
                spokes.forEach(spoke => {
                    drawVertices(spoke, -center.position.x, -center.position.y);
                });
                pop();
            }
            fill(...color);
            stroke(...color.map(x => x * 1.5));
            strokeWeight(5);
            drawVertices(center);
            spokes.forEach(spoke => {
                drawVertices(spoke);
            });
            noStroke();
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