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
            if (localProxy.selectedSquare === "Gabby") {
                rope += floor(random(100 + localProxy.squares["Gabby"].level * 10, 250 + localProxy.squares["Gabby"].level * 10));
            } else {
                rope += floor(random(100, 250));
            }
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
            let boost = 0;
            if (localProxy.selectedSquare === "Gabriel") {
                boost = localProxy.squares["Gabriel"].level;
            }
            player.bodies.forEach(body => {
                body.ignoreGravity = true;
            })
            player.ignoreGravity = true;
            setTimeout(() => {
                player.bodies.forEach(body => {
                    body.ignoreGravity = false;
                })
                player.ignoreGravity = false;
            }, round(random(3 + boost, 10 + boost)) * 1000)
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
                if (localProxy.selectedSquare === "Gina") {
                    Body.setVelocity(body, { x: body.velocity.x * 0.05, y: min(body.velocity.y, 0) - 25 - 2 * localProxy.squares["Gina"].level });
                } else {
                    Body.setVelocity(body, { x: body.velocity.x * 0.1, y: body.velocity.y - 20 });
                }
            })
        }
    }
}