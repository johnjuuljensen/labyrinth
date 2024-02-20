//% weight=100 color=#0fbc11 icon=""
namespace maze {
    /**
     * Generates a maz using the Binary Tree algorithm
     * @param mazeWidth width of maze
     * @param mazeHeight height of maze
     * @param wall tile to use for walls
     * @param floor tile to use for floors
     */
    //% block="Create Binary Tree maze tilemap, width $mazeWidth height $mazeHeight wall $wall floor $floor || corridorSize $corridorSize"
    //% wall.shadow=tileset_tile_picker
    //% floor.shadow=tileset_tile_picker
    //% corridorSize.defl=2
    //% inlineInputMode=inline
    export function generateBinaryTreeTilemap(mazeWidth: number, mazeHeight: number, wall: Image, floor: Image, corridorSize?: number): tiles.TileMapData {
        corridorSize = corridorSize || 2;
        let blockSize = corridorSize+1;
        let tmWidth = mazeWidth * blockSize + 1;
        let tmHeight = mazeHeight * blockSize + 1;
        let tmSize = tmWidth * tmHeight
        let tmBuf = control.createBuffer(tmSize + 4);
        tmBuf.setNumber(NumberFormat.UInt16LE, 0, tmWidth);
        tmBuf.setNumber(NumberFormat.UInt16LE, 2, tmHeight);
        let tmData = tiles.createTilemap(tmBuf, image.create(tmWidth, tmHeight), [floor, wall], TileScale.Sixteen);

        // Fill everything with walls
        for (let y = 0; y < tmData.height; ++y)
            for (let x = 0; x < tmData.width; ++x) {
                tmData.setTile(x, y, 1);
                tmData.setWall(x, y, true);

            }
        let yMax = mazeHeight - 1;
        let xMax = mazeWidth - 1;
        for (let y = 0; y < mazeHeight; y++) {
            for (let x = 0; x < mazeWidth; x++) {
                let tx = x * blockSize + 1;
                let ty = y * blockSize + 1;
                let [cx,cy] =
                    // If bottom right, do nothing
                    y === yMax && x === xMax ? [0,0] :
                    // If bottom, carve right 
                    y === yMax ? [1,0] :
                    // If right edge, carve down
                    x === xMax ? [0,1] :
                    // Pick random
                    Math.randomRange(0,1) ? [1,0]: [0,1];
                // Set floor
                for (let by = 0; by < corridorSize + cy; ++by)
                    for (let bx = 0; bx < corridorSize + cx; ++bx) {
                        tmData.setTile(tx+bx, ty+by, 0);
                        tmData.setWall(tx +bx, ty+by, false);
                    }
            }
        }
        return tmData;
    }
}

