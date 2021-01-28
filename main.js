const { Engine, Events, Composite, Render, World, Bodies, Body, Detector, Constraint, Sleeping, Query, Composites } = Matter;
let engine;
let player;
let ground;
let platforms = [];
let gears = [];
let collectibles = [];
let emitters = [];
let sounds = {};
let playerColor = [255, 255, 255];
let backgroundMusic;
let upperBound = -350;
let gameState = "start";
let gameChangeTick = 0;
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
    rope = 250;
    oldPlayerY;
    oldCollisions;
    engine = Engine.create({
        enableSleeping: true
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

function preload() {
    backgroundMusic = loadSound("theme.mp3");
    sounds.squish = loadSound("squish.mp3");
    sounds.grappleFire = loadSound("grappleFire.wav");
    sounds.grappleLine = loadSound("grappleLine.wav");
    sounds.powerup = loadSound("powerup.wav");
}

function setup() {
    createCanvas(1000, 700);
    engine = Engine.create({
        enableSleeping: true
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
let rope = 250;
let oldPlayerY;
let oldCollisions;
const computeDiscount = () => {
    return (0.65 / (1 + Math.exp(-player.bodies[6].position.y / 2000))) * 1.7 + 0.35;
}

function draw() {
    background(75 / 2, 68 / 2, 68 / 2);
    gameChangeTick++;
    if (gameState === "play") {
        stroke(255);
        textAlign(CENTER);
        textSize(50);
        translate(0, height - 200 - player.bodies[6].position.y);
        fill(...playerColor);
        stroke(150);
        strokeWeight(5)
        drawPlayer(player);
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
                sounds.squish.setVolume(random(1.5, 3));
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
        drawVertices(ground);
        collectibles.forEach((collectible, i) => {
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
                    sounds.squish.setVolume(random(0.25, 0.75));
                    sounds.squish.rate(random(0.75, 1.25))
                    sounds.powerup.play();
                    return true;
                }
            })
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
                gear.turn();
            }
        });
        emitters.forEach(emitter => {
            emitter.draw();
        });
        if (rope <= 0 && !finalScore) {
            finalScore = playerScore;
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
            if (grappleBody.rotationSpeed) {
                grappleOffset.angle += grappleBody.rotationSpeed;
            }
            oldGrapplePos = { x: grappleBody.position.x + grapple.pointB.x, y: grappleBody.position.y + grapple.pointB.y };
            if (rope > 0) {
                grappleTick++;
            } else if (grappleTick > 0) {
                grappleTick--;
            } else if (rope < 0 && grappleTick <= 0) {
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
            if (grappleTick > 0 && grappleTick % grappleInterval === 0) {
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
            if (grappleTick < grappleMax && rope > 0) {
                rope -= floor(random(1, 5));
            }
            if (grappleTick > 0) {
                drawGrapple(grapple, min(grappleTick / grappleMax, 1));
            }
            if (grappleTick >= grappleMax) {
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
            if (random() < 2 * computeDiscount()) {
                let r = ropeBoost({
                    x: random(0, width),
                    y: random(upperBound, upperBound - height / 2)
                });
                gears.forEach(gear => {
                    if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                        r = ropeBoost({
                            x: random(0, width),
                            y: random(upperBound, upperBound - height / 2)
                        });
                    }
                });
                collectibles.push(r);
            }
            if (random() < 2 * computeDiscount()) {
                let r = jumpBoost({
                    x: random(0, width),
                    y: random(upperBound, upperBound - height / 2)
                });
                gears.forEach(gear => {
                    if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                        r = jumpBoost({
                            x: random(0, width),
                            y: random(upperBound, upperBound - height / 2)
                        });
                    }
                });
                collectibles.push(r);
            }
            if (random() < 2 * computeDiscount()) {
                let r = antigravBoost({
                    x: random(0, width),
                    y: random(upperBound, upperBound - height / 2)
                });
                gears.forEach(gear => {
                    if (dist(r.x, r.y, gear.x, gear.y) < (gear.size + r.size) * 1.5) {
                        r = antigravBoost({
                            x: random(0, width),
                            y: random(upperBound, upperBound - height / 2)
                        });
                    }
                });
                collectibles.push(r);
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
    }
    if (gameChangeTick < 70) {
        noStroke();
        fill(0, 0, 0, 255 - gameChangeTick * 4);
        rect(-width, -height, width * 2, height * 2);
    }
}

function mousePressed() {
    if (gameState !== "play") {
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
        grappleMax = dist(chosenBody.position.x, chosenBody.position.y, raycast[0].point.x, raycast[0].point.y) / 30;
        sounds.grappleFire.setVolume(0.17);
        sounds.grappleFire.rate(random(0.5, 1.5))
        sounds.grappleFire.play();
        sounds.grappleLine.rate(random(0.75, 1.25))
        sounds.grappleLine.play();
    }
    if (dist(mx, my, player.bodies[6].position.x, player.bodies[6].position.y) < 30) {
        World.remove(engine.world, grapple);
        grapple = undefined;
        grappleInterval = floor(random(30, 90));
        grappleBody = undefined;
        grappleOffset = undefined;
        grappleTick = undefined;
    }
}
const main = document.getElementById("main");
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
        reset();
        mainMenu();
    }
    main.append(backButton);
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
    main.append(playButton);
}
let startedTrack = false;
window.addEventListener("click", event => {
    if (gameState === "play" && !startedTrack && backgroundMusic && backgroundMusic.isLoaded && backgroundMusic.isLoaded()) {
        backgroundMusic.loop();
        backgroundMusic.setVolume(0.2);
        startedTrack = true;
    }
});
document.getElementById("play").onclick = () => {
    gameState = "play";
    gameChangeTick = 0;
    document.getElementById("main").innerHTML = "";
}