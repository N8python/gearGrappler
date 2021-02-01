p5.disableFriendlyErrors = true;
const { Engine, Events, Composite, Render, World, Bodies, Body, Detector, Constraint, Sleeping, Query, Composites } = Matter;
let engine;
let player;
let ground;
let platforms = [];
let gears = [];
let collectibles = [];
let emitters = [];
let blackHoles = [];
let coinList = [];
let sounds = {};
let images = {};
let squareColors = {
    "Gus": [255, 255, 255],
    "Gabby": [255, 0, 0],
    "Gabriel": [255, 0, 255],
    "Gina": [0, 255, 255]
};
let squareInfo = {
    "Gus": `
    He grew up on the streets of Cityville. He went from rags to riches through plot devices. 
    Then he spent all his money betting on high-stakes grappling competitions. 
    Now he plays in them himself.
    `,
    "Gabby": `
    Lucrative entrepreneur who launched a rope-based startup. 
    Attempted to artificially inflate demand and decrease supply by buying all the rope herself.
    Now uses her abundance of rope to perform in obscure gear grappling web games.
    `,
    "Gabriel": `
    Raised on the moon. Now lives on Earth.
    (Ignores implication of moon society).
    Being on the moon made him resistant to gravity. Somehow. Yes.
    Now grapples in order to get money to go to Mars.
    (Ignores implication of martian society).
    `,
    "Gina": `
    After trampolines were outlawed due to child safety concerns, Gina
    quickly became a prominent dealer in the up-and-coming trampoline 
    black market*. Unfortunately, due to a series of tragic vague and convenient events,
    Gina was driven to ruin and now grapples from gear to gear in hope of getting her life back.
    *She knows how to jump very high because of her trampoline-themed backstory.
    `

}
let backgroundMusic;
let upperBound = -350;
let gameState = "start";
let gameChangeTick = 0;
let paused = false;
Matter.use(MatterWrap);

function reset() {
    Engine.clear(engine);
    engine = undefined;
    player = undefined;
    ground = undefined;
    platforms = [];
    gears = [];
    collectibles = [];
    emitters = [];
    playerColor = [255, 255, 255];
    backgroundMusic;
    upperBound = -350;
    gameState = "start";
    gameChangeTick = 0;
    grapple = undefined;
    grappleBody = undefined;
    grappleOffset = undefined;
    grappleTick = 0;
    grappleInterval = 0;
    grappleMax = 15;
    grappleRedFrames = 0;
    oldGrapplePos;
    playerScore = 0;
    finalScore = undefined;
    rope = localProxy.selectedSquare === "Gabby" ? 500 : 250;
    oldPlayerY;
    oldCollisions;
    engine = Engine.create({
        //enableSleeping: true
    });
    player = Composites.softBody(width / 2, 660, 4, 4, 1, 1, true, 5, {
        friction: 0.05,
        frictionStatic: 0.1
    });
    /*player.bodies.forEach(body => {
        body.ignoreGravity = true;
    })*/
    ground = Bodies.rectangle(width / 2, height + 200, 10000, 400, {
        isStatic: true
    });
    gears.push(Gear({
        x: width / 2,
        y: height / 2,
        size: 75,
        speed: 0.01
    }))
    for (let i = 0; i < 10; i++) {
        const g = Gear({
            x: random(0, width),
            y: random(-height / 2, height / 2),
            size: random(25, 75),
            speed: random(0.005, 0.02)
        })
        let toAdd = true;
        gears.forEach(gear => {
            if (dist(g.x, g.y, gear.x, gear.y) < (g.size + gear.size) * 1.5) {
                toAdd = false;
            }
        })
        if (toAdd) {
            gears.push(g);
        }
    }
    for (let i = 0; i < 3; i++) {
        let r = ropeBoost({
            x: random(0, width),
            y: random(-height / 2, height / 2)
        });
        gears.forEach(gear => {
            if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                r = ropeBoost({
                    x: random(0, width),
                    y: random(-height / 2, height / 2)
                });
            }
        });
        collectibles.push(r);
    }
    World.add(engine.world, [player, ground, ...platforms]);
    gears.forEach(gear => {
        gear.add();
    })
    Engine.run(engine);
}

function preload() {
    backgroundMusic = loadSound("theme.mp3");
    sounds.squish = loadSound("squish.mp3");
    sounds.grappleFire = loadSound("grappleFire.wav");
    sounds.grappleLine = loadSound("grappleLine.wav");
    sounds.powerup = loadSound("powerup.wav");
    images.coin = loadImage("coin.png");
}

function setup() {
    createCanvas(1000, 700);
    engine = Engine.create({
        //enableSleeping: true
    });
    player = Composites.softBody(width / 2, 660, 4, 4, 1, 1, true, 5, {
        friction: 0.05,
        frictionStatic: 0.1,
    });
    /*player.bodies.forEach(body => {
        body.ignoreGravity = true;
    })*/
    ground = Bodies.rectangle(width / 2, height + 200, 10000, 400, {
        isStatic: true
    });
    gears.push(Gear({
        x: width / 2,
        y: height / 2,
        size: 75,
        speed: 0.01
    }))
    for (let i = 0; i < 10; i++) {
        const g = Gear({
            x: random(0, width),
            y: random(-height / 2, height / 2),
            size: random(25, 75),
            speed: random(0.005, 0.02)
        })
        let toAdd = true;
        gears.forEach(gear => {
            if (dist(g.x, g.y, gear.x, gear.y) < (g.size + gear.size) * 1.5) {
                toAdd = false;
            }
        })
        if (toAdd) {
            gears.push(g);
        }
    }
    for (let i = 0; i < 3; i++) {
        let r = ropeBoost({
            x: random(0, width),
            y: random(-height / 2, height / 2)
        });
        gears.forEach(gear => {
            if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                r = ropeBoost({
                    x: random(0, width),
                    y: random(-height / 2, height / 2)
                });
            }
        });
        collectibles.push(r);
    }
    World.add(engine.world, [player, ground, ...platforms]);
    gears.forEach(gear => {
        gear.add();
    })
    Engine.run(engine);
}
let grapple;
let grappleBody;
let grappleOffset;
let grappleTick = 0;
let grappleInterval = 0;
let grappleMax = 15;
let grappleRedFrames = 0;
let oldGrapplePos;
let playerScore = 0;
let finalScore;
let rope = localProxy.selectedSquare === "Gabby" ? 500 : 250;
let coins = 0;
if (localProxy.coins) {
    coins = localProxy.coins;
} else {
    localProxy.coins = coins;
}
if (!localProxy.musicVolume) {
    localProxy.musicVolume = 1;
}
if (!localProxy.sfxVolume) {
    localProxy.sfxVolume = 1;
}
if (!localProxy.squares) {
    localProxy.squares = {
        "Gus": {
            level: 1,
            cost: 100
        },
        "Gabby": {
            level: 0,
            cost: 200
        },
        "Gabriel": {
            level: 0,
            cost: 350
        },
        "Gina": {
            level: 0,
            cost: 500
        }
    };
}
if (!localProxy.selectedSquare) {
    localProxy.selectedSquare = "Gus";
}
if (!localProxy.graphics) {
    localProxy.graphics = "good";
}
let oldPlayerY;
let oldCollisions;
const computeDiscount = () => {
    return (0.65 / (1 + Math.exp(-player.bodies[6].position.y / 2000))) * 1.7 + 0.35;
}
const addBoost = (boostFunc, magnitude) => {
    if (random() < magnitude * computeDiscount()) {
        let r = boostFunc({
            x: random(0, width),
            y: random(upperBound, upperBound - height / 2)
        });
        gears.forEach(gear => {
            if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                r = boostFunc({
                    x: random(0, width),
                    y: random(upperBound, upperBound - height / 2)
                });
            }
        });
        collectibles.push(r);
    }
}

function hardReset() {
    coins = 0;
    localStorage.clear();
    location.reload();
}

function draw() {
    if (localProxy.graphics === "good") {
        pixelDensity(2);
    } else if (localProxy.graphics === "fast") {
        pixelDensity(1);
    }
    localProxy.coins = coins;
    background(75 / 2, 68 / 2, 68 / 2);
    gameChangeTick++;
    const numSize = coins.toString().length - 1;
    imageMode(CENTER);
    image(images.coin, 935 - 22.5 * numSize, 33, 50, 50);
    fill(255, 215, 0);
    textAlign(CENTER);
    textSize(50);
    text(coins, 975 - 10 * numSize, 50);
    if (playerScore < 0) {
        playerScore = 0;
    }
    backgroundMusic.setVolume(0.2 * localProxy.musicVolume);
    if (gameState === "play") {
        if (localProxy.selectedSquare === "Gabriel") {
            player.bodies.forEach(body => {
                body.gravResistance = 0.45 + 0.05 * localProxy.squares["Gabriel"].level;
            })
        } else {
            player.bodies.forEach(body => {
                body.gravResistance = 0;
            });
        }
        stroke(255);
        textAlign(CENTER);
        textSize(50);
        translate(0, height - 200 - player.bodies[6].position.y);
        let color = [...squareColors[localProxy.selectedSquare]];
        if (player.ignoreGravity) {
            color = [255, 0, 255];
            if (localProxy.selectedSquare === "Gabriel") {
                color = [255, 127, 255];
            }
        }
        //console.log(color);
        fill(...color);
        stroke(...color.map(x => x * 0.6));
        strokeWeight(5)
        drawPlayer(player);
        stroke(150);
        const collisions = Detector.collisions(
            [
                ground, ...platforms, ...gears.flatMap(gear => gear.bodies())
            ].flatMap(x => {
                return player.bodies.map(y => [x, y]);
            }), engine);
        if (oldCollisions && collisions.length !== oldCollisions.length) {
            let changes = 0;
            collisions
                .filter(collision => !oldCollisions.find(c => c.bodyA === collision.bodyA && c.bodyB === collision.bodyB))
                .forEach(collision => {
                    changes++;
                    emitters.push(Emitter({
                        x: collision.bodyA.position.x,
                        y: collision.bodyA.position.y,
                        minSize: 1,
                        maxSize: 1,
                        distributionSize: 0,
                        colors: [
                            [255, 255, 255]
                        ],
                        rate: Infinity,
                        startingParticles: 7,
                        magnitude: 0.5,
                        duration: 30,
                        particleDuration: 30,
                        display: "line",
                        lineSize: 8
                    }));
                });
            if (!sounds.squish.isPlaying() && changes > 1) {
                sounds.squish.setVolume(random(1.5, 3) * localProxy.sfxVolume);
                sounds.squish.rate(random(0.75, 1.25))
                sounds.squish.play();
            }

        }
        oldCollisions = collisions;
        if (oldPlayerY) {
            playerScore += (oldPlayerY - player.bodies[6].position.y) / 10;
        }
        oldPlayerY = player.bodies[6].position.y;
        player.bodies.forEach(body => {
            player.bodies.forEach(body2 => {
                if (body !== body2) {
                    if (dist(body.position.x, body.position.y, body2.position.x, body2.position.y) < 8) {
                        Body.setVelocity(body, {
                            x: body.velocity.x - (body2.position.x - body.position.x),
                            y: body.velocity.y - (body2.position.y - body.position.y)
                        })
                    }
                }
            })
        });
        //drawVertices(player);
        fill(200);
        stroke(150, 150, 150);
        drawVertices(ground);
        collectibles.forEach((collectible, i) => {
            if (abs(collectible.y - player.bodies[6].position.y) > height * 1.5) {
                return;
            }
            noStroke();
            fill(collectible.color.concat(65));
            circle(collectible.x, collectible.y, collectible.size * 1.75);
            fill(collectible.color.concat(125));
            circle(collectible.x, collectible.y, collectible.size * 1.5);
            fill(collectible.color.concat(200));
            circle(collectible.x, collectible.y, collectible.size * 1.25);
            collectible.draw();
            stroke(255);
            player.bodies.some(body => {
                if (dist(collectible.x, collectible.y, body.position.x, body.position.y) < (body.circleRadius + collectible.size) / 1.5) {
                    collectible.collect();
                    emitters.push(Emitter({
                        x: collectible.x,
                        y: collectible.y,
                        minSize: 1,
                        maxSize: 1,
                        distributionSize: 0,
                        colors: [
                            collectible.color
                        ],
                        rate: Infinity,
                        startingParticles: 15,
                        magnitude: 1.5,
                        duration: 30,
                        particleDuration: 30,
                        display: "line",
                        lineSize: 8
                    }));
                    collectibles.splice(i, true);
                    sounds.powerup.setVolume(0.75 * localProxy.sfxVolume);
                    sounds.powerup.play();
                    return true;
                }
            })
        });
        blackHoles.forEach(hole => {
            if (abs(hole.y - player.bodies[6].position.y) < height * 1.5) {
                hole.draw();
            }
        });
        platforms.forEach(platform => {
            fill(200);
            stroke(255);
            strokeWeight(5);
            drawVertices(platform);
        });
        gears.forEach(gear => {
            if (abs(gear.y - player.bodies[6].position.y) < height * 1.5) {
                gear.draw();
                if (!paused) {
                    gear.turn();
                }
            }
        });
        emitters.forEach(emitter => {
            emitter.draw();
        });
        coinList.forEach(coin => {
            coin.draw();
        })
        if (rope <= 0 && !finalScore) {
            finalScore = playerScore;
            let scoreCounter = finalScore;
            let coinInterval = setInterval(() => {
                const fraction = scoreCounter * 0.1;
                scoreCounter -= fraction;
                coins += round(fraction / 10);
                if (scoreCounter < 5) {
                    clearInterval(coinInterval);
                }
            }, 100);
            gameOverScreen();
        }
        if (grapple) {
            /*if (oldGrapplePos) {
                const delta = { x: (grappleBody.position.x + grapple.pointB.x) - oldGrapplePos.x, y: (grappleBody.position.y + grapple.pointB.y) - oldGrapplePos.y };
                //grapple.pointB.x += delta.x;
                //grapple.pointB.y += delta.y;
            }*/
            grapple.pointB = {
                x: Math.cos(grappleOffset.angle) * grappleOffset.magnitude,
                y: Math.sin(grappleOffset.angle) * grappleOffset.magnitude
            }
            if (grappleBody.rotationSpeed && !paused) {
                grappleOffset.angle += grappleBody.rotationSpeed;
            }
            oldGrapplePos = { x: grappleBody.position.x + grapple.pointB.x, y: grappleBody.position.y + grapple.pointB.y };
            if (rope > 0 && !paused) {
                grappleTick++;
            } else if (grappleTick > 0 && !paused) {
                grappleTick--;
            } else if (rope < 0 && grappleTick <= 0 && !paused) {
                grappleTick = 0;
                rope = 0;
                setTimeout(() => {
                    World.remove(engine.world, grapple);
                    grapple = undefined;
                    grappleBody = undefined;
                    grappleOffset = undefined;
                    grappleTick = undefined;
                    grappleInterval = 0;
                })
            }
            if (grappleTick > 0 && grappleTick % grappleInterval === 0 && !paused) {
                //stroke(255, 0, 0);
                grappleRedFrames += floor(random(3, 7));
                grappleInterval = floor(grappleInterval / 1.1);
                if (grappleInterval < 5) {
                    setTimeout(() => {
                        World.remove(engine.world, grapple);
                        grapple = undefined;
                        grappleBody = undefined;
                        grappleOffset = undefined;
                        grappleTick = undefined;
                        grappleInterval = 0;
                    });
                }
            }
            if (grappleRedFrames > 0) {
                grappleRedFrames--;
                stroke(255, 0, 0);
            } else {
                stroke(0, 255, 0);
            }
            strokeWeight(5);
            if (grappleTick < grappleMax && rope > 0 && !paused) {
                rope -= floor(random(1, 5));
            }
            if (grappleTick > 0) {
                drawGrapple(grapple, min(grappleTick / grappleMax, 1));
            }
            if (grappleTick >= grappleMax && !paused) {
                grapple.stiffness = 0.01;
                //if (Math.random() < 0.1) {
                //sounds.grappleLine.pause();
                //}
            }
            if (dist(grapple.bodyA.position.x, grapple.bodyA.position.y, grapple.bodyB.position.x, grapple.bodyB.position.y) < 150) {
                sounds.grappleLine.pause();
            }
            stroke(0);
            strokeWeight(1);
            //circle(raycastPoint.x, raycastPoint.y, 15);
        }
        if (player.bodies[0].position.y < upperBound + height) {
            for (let i = 0; i < round(5 * computeDiscount()); i++) {
                const g = Gear({
                    x: random(0, width),
                    y: random(upperBound, upperBound - height / 2),
                    size: random(25, 50),
                    speed: random() > 0.1 ? random(0.005, 0.02) : random(0.075, 0.15)
                })
                let toAdd = true;
                gears.forEach(gear => {
                    if (dist(g.x, g.y, gear.x, gear.y) < (g.size + gear.size) * 1.5) {
                        toAdd = false;
                    }
                })
                if (toAdd) {
                    g.add();
                    gears.push(g);
                }
            }
            if (random() < 0.25) {
                const r = Bodies.rectangle(random(0, width), random(upperBound, upperBound - height / 2), random(150, 250), 50, {
                    isStatic: true
                });
                World.add(engine.world, r);
                platforms.push(r);
            }
            if (localProxy.selectedSquare === "Gus") {
                for (let i = 0; i < random(1, 1 + round(localProxy.squares["Gus"].level / 4)); i++) {
                    addBoost(ropeBoost, 2);
                }
            } else {
                addBoost(ropeBoost, 2);
            }
            if (localProxy.selectedSquare === "Gina") {
                for (let i = 0; i < max(1, round(localProxy.squares["Gina"].level / 3)); i++) {
                    addBoost(jumpBoost, 2);
                }
            } else if (localProxy.selectedSquare === "Gus") {
                for (let i = 0; i < random(1, 1 + round(localProxy.squares["Gus"].level / 4)); i++) {
                    addBoost(jumpBoost, 2);
                }
            } else {
                addBoost(jumpBoost, 2);
            }
            if (localProxy.selectedSquare === "Gus") {
                for (let i = 0; i < random(1, 1 + round(localProxy.squares["Gus"].level / 4)); i++) {
                    addBoost(antigravBoost, 2);
                }
            } else {
                addBoost(antigravBoost, 2);
            }
            if (localProxy.selectedSquare === "Gus") {
                for (let i = 0; i < random(1, 1 + round(localProxy.squares["Gus"].level / 4)); i++) {
                    addBoost(coinBoost, 1);
                }
            } else {
                addBoost(coinBoost, 1);
            }
            if (playerScore > 1000) {
                if (random() < min(playerScore / 20000, 0.2)) {
                    let b = BlackHole({
                        x: random(0, width),
                        y: random(upperBound, upperBound - height / 2)
                    });
                    gears.forEach(gear => {
                        if (dist(b.x, b.y, gear.x, gear.y) < (gear.size + 30) * 1.5) {
                            b = BlackHole({
                                x: random(0, width),
                                y: random(upperBound, upperBound - height / 2)
                            });
                        }
                    });
                    blackHoles.push(b);
                }
            }
            upperBound -= height / 2;
        }
        if (finalScore) {
            /*fill(100);
            text("Final Score: " + round(finalScore), width / 2, height / 2 - (height - 200 - player.bodies[6].position.y));*/
        } else {
            fill(150);
            text(round(playerScore), 500, 50 - (height - 200 - player.bodies[6].position.y));
        }
        fill(255, 0, 0);
        textAlign(LEFT);
        text(Math.round(rope), 10, 50 - (height - 200 - player.bodies[6].position.y));
        const numSize = coins.toString().length - 1;
        imageMode(CENTER);
        image(images.coin, 935 - 22.5 * numSize, 33 - (height - 200 - player.bodies[6].position.y), 50, 50);
        fill(255, 215, 0);
        textAlign(CENTER);
        textSize(50);
        text(coins, 975 - 10 * numSize, 50 - (height - 200 - player.bodies[6].position.y));
    }
    if (gameChangeTick < 70) {
        noStroke();
        fill(0, 0, 0, 255 - gameChangeTick * 4);
        rect(-width, -height, width * 2, height * 2);
    }
    if (paused) {
        engine.world.bodies.forEach(body => Sleeping.set(body, true));
        player.bodies.forEach(body => Sleeping.set(body, true));
    } else {
        engine.world.bodies.forEach(body => Sleeping.set(body, false));
        player.bodies.forEach(body => Sleeping.set(body, false));
    }
}

function mousePressed() {
    if (gameState !== "play") {
        return;
    }
    if (paused) {
        return;
    }
    if (mouseX > 937 && mouseY > 64 && mouseX < 937 + 52 && mouseY < 64 + 48) {
        return;
    }
    const mx = mouseX;
    const my = mouseY - (height - 200 - player.bodies[6].position.y);
    let chosenBody;
    player.bodies.forEach(body => {
        if (!chosenBody) {
            chosenBody = body;
        } else if (dist(body.position.x, body.position.y, mx, my) < dist(chosenBody.position.x, chosenBody.position.y, mx, my)) {
            chosenBody = body;
        }
    })
    const raycast = matterRaycast([ground, ...platforms, ...gears.flatMap(gear => gear.bodies())], { x: chosenBody.position.x, y: chosenBody.position.y }, { x: mx, y: my })
    if (raycast.length > 0) {
        //raycastPoint = raycast[0].point;
        if (grapple) {
            World.remove(engine.world, grapple);
        }
        //console.log(gears[0].spokes().includes(raycast[0].body))
        grappleBody = raycast[0].body;
        grapple = Constraint.create({
            bodyA: chosenBody,
            bodyB: raycast[0].body,
            /*pointB: {
                x: raycast[0].point.x - raycast[0].body.position.x,
                y: raycast[0].point.y - raycast[0].body.position.y
            },*/
            stiffness: 0.00001,
            damping: 0.01,
            length: 0,
            type: "spring"
        });
        grappleOffset = {
            angle: createVector(raycast[0].point.x - raycast[0].body.position.x, raycast[0].point.y - raycast[0].body.position.y).heading(),
            magnitude: dist(raycast[0].body.position.x, raycast[0].body.position.y, raycast[0].point.x, raycast[0].point.y)
        }
        World.add(engine.world, grapple);
        grappleTick = 0;
        grappleInterval = floor(random(30, 90));
        if (localProxy.selectedSquare === "Gabby") {
            grappleInterval += 30 + 6 * localProxy.squares["Gabby"].level;
            grappleInterval *= 1.1 ** localProxy.squares["Gabby"].level;
            grappleInterval = round(grappleInterval);
        }
        grappleMax = dist(chosenBody.position.x, chosenBody.position.y, raycast[0].point.x, raycast[0].point.y) / (30 + ((localProxy.selectedSquare === "Gabby") ? localProxy.squares["Gabby"].level : 0));
        sounds.grappleFire.setVolume(0.17 * localProxy.sfxVolume);
        sounds.grappleFire.rate(random(0.5, 1.5))
        sounds.grappleFire.play();
        sounds.grappleLine.setVolume(localProxy.sfxVolume);
        sounds.grappleLine.rate(random(0.75, 1.25))
        sounds.grappleLine.play();
    }
    if (dist(mx, my, player.bodies[6].position.x, player.bodies[6].position.y) < 30) {
        World.remove(engine.world, grapple);
        grapple = undefined;
        grappleInterval = floor(random(30, 90));
        if (localProxy.selectedSquare === "Gabby") {
            grappleInterval += 30 + 6 * localProxy.squares["Gabby"].level;
            grappleInterval *= 1.1 ** localProxy.squares["Gabby"].level;
            grappleInterval = round(grappleInterval);
        }
        grappleBody = undefined;
        grappleOffset = undefined;
        grappleTick = undefined;
    }
}
const main = document.getElementById("main");
const modal = document.getElementById("modal");
const getModalTyper = () => modalTyper;
const getNameTyper = () => nameTyper;
let modalTyper = new Typewriter(document.getElementById("typeContent"), {
    delay: 50
});
let nameTyper = new Typewriter(document.getElementById("nameContent"), {
    delay: 50
})
document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
    document.getElementById("typeContent").innerHTML = "";
    document.getElementById("nameContent").innerHTML = "";
    modalTyper = new Typewriter(document.getElementById("typeContent"), {
        delay: 50
    });
    nameTyper = new Typewriter(document.getElementById("nameContent"), {
        delay: 50
    })
};
const settingsIngame = document.getElementById("settings");
setInterval(() => {
    if (gameState === "play") {
        settingsIngame.style.display = "inline-block";
    } else {
        settingsIngame.style.display = "none";
    }
});
settingsIngame.onclick = () => {
    if (!paused) {
        paused = true;
        main.innerHTML = `<h1 class="rainbow-text" style="margin-left:385px; margin-top: 150px;font-size:75px;">Menu</h1>`;
        const backButton = document.createElement("button");
        backButton.classList.add("btn");
        backButton.style.marginLeft = "350px";
        backButton.style.width = "300px";
        backButton.innerHTML = "Exit";
        backButton.onclick = () => {
            main.classList.remove("w3-animate-opacity");
            gameState = "start";
            gameChangeTick = 0;
            paused = false;
            reset();
            mainMenu();
        }
        const resumeButton = document.createElement("button");
        resumeButton.classList.add("btn");
        resumeButton.style.marginLeft = "350px";
        resumeButton.style.width = "300px";
        resumeButton.innerHTML = "Resume";
        resumeButton.onclick = () => {
            paused = false;
            main.innerHTML = ``;
        }
        main.appendChild(backButton);
        main.appendChild(document.createElement("br"));
        main.appendChild(document.createElement("br"));
        main.appendChild(resumeButton);
    } else {
        paused = false;
        main.innerHTML = ``;
    }
}
const gameOverScreen = () => {
    main.classList.add("w3-animate-opacity");
    main.innerHTML = `<h1 class="rainbow-text" style="margin-left:265px; margin-top: 150px;font-size:75px;">Game Over</h1>
    <h1 class="rainbow-text" style="margin-left:175px;font-size:75px;">Final Score: ${Math.round(finalScore)}</h1>`;
    const backButton = document.createElement("button");
    backButton.classList.add("btn");
    backButton.style.marginLeft = "350px";
    backButton.style.width = "300px";
    backButton.innerHTML = "Back To Menu";
    backButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameState = "start";
        gameChangeTick = 0;
        paused = false;
        reset();
        mainMenu();
    }
    main.appendChild(backButton);
}
const mainMenu = () => {
    main.classList.add("w3-animate-opacity");
    main.innerHTML = `<h1 class="rainbow-text" style="margin-left:203px;font-size:75px;">Gear Grappler</h1>`;
    const playButton = document.createElement("button");
    playButton.classList.add("btn");
    playButton.style.marginLeft = "400px";
    playButton.innerHTML = "Play";
    playButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameState = "play";
        gameChangeTick = 0;
        document.getElementById("main").innerHTML = "";
    }
    const settingsButton = document.createElement("button");
    settingsButton.classList.add("btn");
    settingsButton.style.marginLeft = "400px";
    settingsButton.innerHTML = "Settings";
    settingsButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameChangeTick = 0;
        settings();
    }
    const shopButton = document.createElement("button");
    shopButton.classList.add("btn");
    shopButton.style.marginLeft = "400px";
    shopButton.innerHTML = "Shop";
    shopButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameChangeTick = 0;
        shop();
    }
    main.appendChild(playButton);
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(shopButton);
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(settingsButton);
}
const shop = () => {
    main.classList.add("w3-animate-opacity");
    main.innerHTML = `<h1 class="rainbow-text" style="margin-left:394px;font-size:75px;">Shop</h1>`;
    const backButton = document.createElement("button");
    backButton.classList.add("btn");
    backButton.style.marginLeft = "350px";
    backButton.style.width = "300px";
    backButton.innerHTML = "Back To Menu";
    backButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameState = "start";
        gameChangeTick = 0;
        paused = false;
        reset();
        mainMenu();
    };
    const shopBoxes = [];
    const colors = [
        [255, 255, 255],
        [255, 0, 0],
        [255, 0, 255],
        [0, 255, 255]
    ];
    const names = ["Gus", "Gabby", "Gabriel", "Gina"];
    const joes = ["Joe Normie", "Joe Adventure™", "Joe LITE", "Joe Spring"]
    for (let i = 0; i < 4; i++) {
        const box = document.createElement("div");
        box.style.width = "200px";
        box.style.height = "200px";
        box.style.border = "5px solid white";
        box.style.display = "inline-block";
        box.style.textAlign = "center";
        box.style.marginRight = "16px";
        box.style.position = "relative";
        const square = document.createElement("div");
        square.style.width = "50px";
        square.style.height = "50px";
        square.style.border = `5px solid rgb(${colors[i].map(x => x * 0.6).join(", ")})`;
        square.style.backgroundColor = `rgb(${colors[i].join(", ")})`;
        square.style.marginLeft = "calc(50% - 25px)";
        square.style.marginTop = "calc(25% - 25px)";
        const infoButton = document.createElement("button");
        infoButton.classList.add("btn");
        infoButton.innerHTML = "Info";
        infoButton.style.minWidth = "50px";
        infoButton.style.fontSize = "16px";
        infoButton.style.position = "absolute";
        infoButton.style.top = "45%";
        infoButton.style.left = "0px";
        infoButton.onclick = () => {
                document.getElementById("modal").style.display = "block";
                getNameTyper().deleteAll(10).typeString(names[i]).start();
                getModalTyper().deleteAll(5).typeString(squareInfo[names[i]]).start();
            }
            //infoButton.style.position = "absolute";
            //infoButton.style.left = box.style.left + "px";
        const nameLabel = document.createElement("h3");
        const info = localProxy.squares[names[i]];
        nameLabel.innerHTML = names[i];
        if (info.level > 0) {
            nameLabel.innerHTML += ` (Lv. ${info.level})`;
        }
        nameLabel.style.color = "white";
        nameLabel.style.display = "inline-block";
        const joeLabel = document.createElement("span");
        joeLabel.innerHTML = "<em>" + joes[i] + "</em>";
        joeLabel.style.color = "white";
        joeLabel.style.display = "inline-block";
        joeLabel.style.marginTop = "12%";
        //nameLabel.style.marginLeft = `calc(50% - ${nameLabel.clientWidth}px)`;
        //nameLabel.style.textAlign = "center";
        /*nameLabel.style.margin = "auto";
        nameLabel.style.width = Math.floor(8 * names[i].length) + "px";
        nameLabel.style.display = "block";*/
        nameLabel.classList.add("w3-center");
        box.nameLabel = nameLabel;
        box.joeLabel = joeLabel;
        box.appendChild(infoButton);
        box.appendChild(nameLabel);
        box.appendChild(square);
        box.appendChild(joeLabel);
        shopBoxes.push(box);
    }
    shopBoxes[0].style.marginLeft = "68px";
    shopBoxes.forEach(box => {
        main.appendChild(box)
    });
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    const shopButtons = [];
    const squares = localProxy.squares;
    for (let i = 0; i < 4; i++) {
        const name = names[i];
        const info = localProxy.squares[name];
        const selectButton = document.createElement("button");
        selectButton.classList.add("btn");
        selectButton.style.marginLeft = "16px";
        selectButton.innerHTML = names[i] === localProxy.selectedSquare ? "Selected" : "Select";
        if (info.level === 0) {
            selectButton.disabled = true;
        }
        if (names[i] === localProxy.selectedSquare) {
            selectButton.disabled = true;
        }
        selectButton.onclick = () => {
            localProxy.selectedSquare = names[i];
            selectButton.innerHTML = "Selected";
            selectButton.disabled = true;
            shopButtons.filter((_, i) => i % 3 === 0).forEach((button, i) => {
                if (button !== selectButton && localProxy.squares[names[i]].level > 0) {
                    button.disabled = false;
                    button.innerHTML = "Select";
                }
            });
        }
        const shopButton = document.createElement("button");
        shopButton.classList.add("btn");
        shopButton.style.marginLeft = "16px";
        shopButton.onclick = () => {
            if (coins > info.cost) {
                info.level += 1;
                coins -= info.cost;
                info.cost *= 1.1;
                info.cost = Math.round(info.cost);
                squares[name] = info;
                localProxy.squares = squares;
                if (info.level === 1) {
                    selectButton.disabled = false;
                    levelUpButton.disabled = false;
                    shopButton.disabled = true;
                    shopBoxes[i].nameLabel.innerHTML += " (Lv. 1)";
                }
                shopButton.innerHTML = `${info.cost} Coins`;
            }
        }
        shopButton.innerHTML = `${info.cost} Coins`;
        const levelUpButton = document.createElement("button");
        levelUpButton.classList.add("btn");
        levelUpButton.style.marginLeft = "16px";
        levelUpButton.onclick = () => {
            if (coins > info.cost) {
                info.level += 1;
                coins -= info.cost;
                info.cost *= 1.1;
                info.cost = Math.round(info.cost);
                squares[name] = info;
                localProxy.squares = squares;
                shopBoxes[i].nameLabel.innerHTML = names[i] + ` (Lv. ${info.level})`;
                shopButton.innerHTML = `${info.cost} Coins`;
                if (info.level === 9) {
                    levelUpButton.disabled = true;
                }
            }
        }
        levelUpButton.innerHTML = "Level Up";
        if (info.level == 0 || info.level >= 9) {
            levelUpButton.disabled = true;
        }
        if (info.level > 0) {
            shopButton.disabled = true;
        }
        shopButtons.push(selectButton);
        shopButtons.push(shopButton);
        shopButtons.push(levelUpButton);
    }
    shopButtons[0].style.marginLeft = "68px";
    shopButtons[1].style.marginLeft = "68px";
    shopButtons[2].style.marginLeft = "68px";
    shopButtons.filter((_, i) => i % 3 === 0).forEach(button => {
        main.appendChild(button)
    });
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    shopButtons.filter((_, i) => i % 3 === 1).forEach(button => {
        main.appendChild(button)
    });
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    shopButtons.filter((_, i) => i % 3 === 2).forEach(button => {
        main.appendChild(button)
    });
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(backButton);
}
const settings = () => {
    main.classList.add("w3-animate-opacity");
    main.innerHTML = `<h1 class="rainbow-text" style="margin-left:327px;font-size:75px;">Settings</h1>`;
    const backButton = document.createElement("button");
    backButton.classList.add("btn");
    backButton.style.marginLeft = "350px";
    backButton.style.width = "300px";
    backButton.innerHTML = "Back To Menu";
    backButton.onclick = () => {
        main.classList.remove("w3-animate-opacity");
        gameState = "start";
        gameChangeTick = 0;
        paused = false;
        reset();
        mainMenu();
    };
    const musicSlider = document.createElement("input");
    musicSlider.type = "range";
    musicSlider.classList.add("goodSlider");
    musicSlider.style.width = "200px";
    musicSlider.style.marginLeft = "12px";
    musicSlider.value = map(localProxy.musicVolume, 0, 1, 1, 100);
    const sfxSlider = document.createElement("input");
    sfxSlider.type = "range";
    sfxSlider.classList.add("goodSlider");
    sfxSlider.style.width = "200px";
    sfxSlider.style.marginLeft = "24px";
    sfxSlider.value = map(localProxy.sfxVolume, 0, 1, 1, 100);
    musicSlider.onchange = () => {
        localProxy.musicVolume = map(+musicSlider.value, 1, 100, 0, 1);
    }
    sfxSlider.onchange = () => {
        localProxy.sfxVolume = map(+sfxSlider.value, 1, 100, 0, 1);
    }
    const graphicsButton = document.createElement("button");
    graphicsButton.classList.add("btn");
    graphicsButton.style.marginLeft = "350px";
    graphicsButton.style.width = "300px";
    graphicsButton.innerHTML = `Graphics: ${localProxy.graphics === "good" ? "Good" : "Fast"}`;
    graphicsButton.onclick = () => {
            if (graphicsButton.innerHTML === "Graphics: Good") {
                graphicsButton.innerHTML = "Graphics: Fast";
                localProxy.graphics = "fast";
            } else {
                graphicsButton.innerHTML = "Graphics: Good";
                localProxy.graphics = "good";
            }
        }
        //main.innerHTML += `<label style="margin-left:332px">Music Volume:</label>`;
    const musicLabel = document.createElement("label");
    musicLabel.style.marginLeft = "332px";
    musicLabel.innerHTML = "Music Volume:";
    main.appendChild(musicLabel);
    main.appendChild(musicSlider);
    main.appendChild(document.createElement("br"));
    //main.innerHTML += `<label style="margin-left:332px">SFX Volume:</label>`;
    const sfxLabel = document.createElement("label");
    sfxLabel.style.marginLeft = "332px";
    sfxLabel.innerHTML = "SFX Volume:";
    main.appendChild(sfxLabel);
    main.appendChild(sfxSlider);
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(graphicsButton);
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(document.createElement("br"));
    main.appendChild(backButton);
}
mainMenu();
let startedTrack = false;
window.addEventListener("click", event => {
    if (!startedTrack && backgroundMusic && backgroundMusic.isLoaded && backgroundMusic.isLoaded()) {
        backgroundMusic.loop();
        backgroundMusic.setVolume(0.2);
        startedTrack = true;
    }
});