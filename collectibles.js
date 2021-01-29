function ropeBoost({ x, y }) {
    return {
        draw() {
            fill(255, 0, 0);
            circle(x, y, 25);
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get size() {
            return 25;
        },
        get color() {
            return [255, 0, 0];
        },
        collect() {
            rope += floor(random(100, 250));
        }
    }
}

function coinBoost({ x, y }) {
    return {
        draw() {
            fill(255, 215, 0);
            circle(x, y, 25);
            fill(150);
            textAlign(CENTER);
            textSize(25);
            text("$", x, y + 8);
            textSize(50);
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get size() {
            return 25;
        },
        get color() {
            return [255, 215, 0];
        },
        collect() {
            coinList.push(Coin({
                    x,
                    y,
                    value: floor(random(5, 20))
                }))
                //coins += floor(random(5, 10));
                //rope += floor(random(100, 250));
        }
    }
}

function antigravBoost({ x, y }) {
    return {
        draw() {
            fill(255, 0, 255);
            circle(x, y, 25);
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get color() {
            return [255, 0, 255];
        },
        get size() {
            return 25;
        },
        collect() {
            player.bodies.forEach(body => {
                body.ignoreGravity = true;
            })
            playerColor = [255, 0, 255];
            setTimeout(() => {
                player.bodies.forEach(body => {
                    body.ignoreGravity = false;
                })
                playerColor = [255, 255, 255];
            }, round(random(3, 10)) * 1000)
        }
    }
}

function jumpBoost({ x, y }) {
    return {
        draw() {
            fill(0, 255, 255);
            circle(x, y, 25);
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get size() {
            return 25;
        },
        get color() {
            return [0, 255, 255];
        },
        collect() {
            if (grapple) {
                World.remove(engine.world, grapple);
                grapple = undefined;
                grappleInterval = floor(random(30, 90));
                grappleBody = undefined;
                grappleOffset = undefined;
                grappleTick = undefined;
            }
            player.bodies.forEach(body => {
                Body.setVelocity(body, { x: body.velocity.x * 0.1, y: body.velocity.y - 20 });
            })
        }
    }
}