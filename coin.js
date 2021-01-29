function Coin({
    x,
    y,
    value
}) {
    //y -= (height - 200 - player.bodies[6].position.y);
    return {
        draw() {
            const offset = (height - 200 - player.bodies[6].position.y);
            const numSize = coins.toString().length - 1;
            const targetX = 935 - 22.5 * numSize;
            const targetY = 33 - offset;
            x += (targetX - x) / 10;
            y += (targetY - y) / 10;
            image(images.coin, x, y, 50, 50);
            if (dist(x, y, targetX, targetY) < 5) {
                coins += value;
                coinList.splice(coinList.indexOf(this), 1);
            }
        }
    }
}