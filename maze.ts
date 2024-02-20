//% weight=100 color=#0fbc11 icon=""
enum MazeAlgorithm {
    BinaryTree = 0,
    Sidewinder = 1
}

namespace maze {

    /**
     * Generates a maze using the chosen algorithm
     * @param mazeWidth width of maze
     * @param mazeHeight height of maze
     * @param wall tile to use for walls
     * @param floor tile to use for floors
     * @param corridorSize width of corridors
     */
    //% block="Create $algorithm maze tilemap, width $mazeWidth height $mazeHeight wall $wall floor $floor || corridorSize $corridorSize"
    //% wall.shadow=tileset_tile_picker
    //% floor.shadow=tileset_tile_picker
    //% corridorSize.defl=2
    //% inlineInputMode=inline
    export function generateTilemap(algorithm: MazeAlgorithm, mazeWidth: number, mazeHeight: number, wall: Image, floor: Image, corridorSize?: number): tiles.TileMapData {
        corridorSize = corridorSize || 2;
        return algorithm === MazeAlgorithm.BinaryTree ?
            generateBinaryTreeTilemap(mazeWidth, mazeHeight, wall, floor, corridorSize) :
            generateSidewinderTilemap(mazeWidth, mazeHeight, wall, floor, corridorSize);
    }

    function createTilemap(mazeWidth: number, mazeHeight: number, corridorSize: number, tmTiles: Image[]): tiles.TileMapData {
        let tmWidth = mazeWidth * (corridorSize + 1) + 1;
        let tmHeight = mazeHeight * (corridorSize + 1) + 1;
        let tmSize = tmWidth * tmHeight
        let tmBuf = control.createBuffer(tmSize + 4);
        tmBuf.setNumber(NumberFormat.UInt16LE, 0, tmWidth);
        tmBuf.setNumber(NumberFormat.UInt16LE, 2, tmHeight);
        return tiles.createTilemap(tmBuf, image.create(tmWidth, tmHeight), tmTiles, TileScale.Sixteen);
    }

    function fillWalls(tmData: tiles.TileMapData) {
        // Fill everything with walls
        for (let y = 0; y < tmData.height; ++y)
            for (let x = 0; x < tmData.width; ++x) {
                tmData.setTile(x, y, 1);
                tmData.setWall(x, y, true);
            }
    }

    function generateBinaryTreeTilemap(mazeWidth: number, mazeHeight: number, wall: Image, floor: Image, corridorSize: number): tiles.TileMapData {
        let tmData = createTilemap(mazeWidth,mazeHeight,corridorSize,[floor,wall]);
        fillWalls(tmData);

        let yMax = mazeHeight - 1;
        let xMax = mazeWidth - 1;
        for (let y = 0; y < mazeHeight; y++) {
            for (let x = 0; x < mazeWidth; x++) {
                let tx = x * (corridorSize + 1) + 1;
                let ty = y * (corridorSize + 1) + 1;
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
                        tmData.setTile(tx + bx, ty + by, 0);
                        tmData.setWall(tx + bx, ty + by, false);
                    }
            }
        }
        return tmData;
    }

    function generateSidewinderTilemap(mazeWidth: number, mazeHeight: number, wall: Image, floor: Image, corridorSize: number): tiles.TileMapData {
        // https://weblog.jamisbuck.org/2011/2/3/maze-generation-sidewinder-algorithm.html
        let tmData = createTilemap(mazeWidth, mazeHeight, corridorSize, [floor, wall]);
        fillWalls(tmData);

        let yMax = mazeHeight - 1;
        let xMax = mazeWidth - 1;
        for (let y = 0; y < mazeHeight; y++) {
            let [start, end] = [0,0];
            for (let x = 0; x < mazeWidth; x++) {
                let ty = y * (corridorSize + 1) + 1;
                let tx = x * (corridorSize + 1) + 1;
                for (let by = 0; by < corridorSize; ++by)
                    for (let bx = 0; bx < corridorSize; ++bx) {
                        tmData.setTile(tx + bx, ty + by, 0);
                        tmData.setWall(tx + bx, ty + by, false);
                    }
                let [cx,cy] =
                    // If bottom right, do nothing
                    y === yMax && x === xMax ? [0,0] :
                    // If bottom, carve right 
                    y === yMax ? [1,0] :
                    // If right edge, carve down
                    x === xMax ? [0,1] :
                    // Pick random
                    Math.randomRange(0,1) ? [1,0]: [0,1];
                
                if(cx === 1) {
                    tx += corridorSize;
                    for (let i = 0; i < corridorSize; ++i) {
                        tmData.setTile(tx, ty + i, 0);
                        tmData.setWall(tx, ty + i, false);
                    }
                    end = x;
                } 
                if(cy === 1){
                    ty += corridorSize;
                    tx = Math.randomRange(start,end) * (corridorSize + 1) + 1;
                    for (let i = 0; i < corridorSize; ++i) {
                        tmData.setTile(tx+i, ty, 0);
                        tmData.setWall(tx+i, ty, false);
                    }
                    start = end = x+1;
                }
            }
        }
        return tmData;
    }
}

