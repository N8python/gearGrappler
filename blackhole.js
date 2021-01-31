function BlackHole({ x, y }) {
    let tick = 0;
    let power = 1;
    let powerMax = 1;
    return {
        draw() {
            tick += 1;
            fill(0, 0, 0, 255 * powerMax ** 2);
            noStroke();
            circle(x, y, 30);
            for (let i = 0; i < 10; i++) {
                strokeWeight(5 - (i / 2));
                stroke(255 - (10 - i) * (255 / 10), 255 - (10 - i) * (255 / 10), 255 - (10 - i) * (255 / 10), (255 - i * 25) * powerMax ** 2);
                noFill();
                circle(x, y, 30 + i * 7.5 + 5 * Math.sin((tick + i ** 2) / (10)));
            }
            if (paused) {
                return;
            }
            player.bodies.forEach(body => {
                //const gconstant = 6.67430 * 10 ** -11;
                const r = dist(x, y, body.position.x, body.position.y);
                //const force = (body.mass * gconstant * 10 ** 12) / (r ** 2);
                const angle = createVector(body.position.x - x, body.position.y - y).heading();
                //Body.setVelocity(body, { x: body.velocity.x, y: body.velocity.y });
                //body.velocity.x += force * cos(angle);
                //body.velocity.y += force * sin(angle);
                const force = 1 / r ** 1.5;
                if (r > 30 && r < 1000) {
                    power += 0.001;
                    power = min(power, powerMax);
                    Body.applyForce(body, { x: body.position.x, y: body.position.y }, {
                        x: force * 0.75 * power ** 2 * -cos(angle),
                        y: force * 0.75 * power ** 2 * -sin(angle)
                    });
                } else if (r < 30) {
                    power -= 0.001;
                    powerMax -= 0.00025;
                    rope -= 0.1 * powerMax;
                    rope = max(rope, 0);
                    power = max(power, 0.25);
                }
            })
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        }
    }
}