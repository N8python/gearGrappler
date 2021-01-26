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
        collect() {
            rope += floor(random(50, 200));
        }
    }
}