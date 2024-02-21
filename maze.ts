enum MazeAlgorithm {
    BinaryTree = 0,
    Sidewinder = 1,
    Ellers = 2
}

//% weight=100 color=#0fbc11 icon="╬"
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
        return algorithm === MazeAlgorithm.BinaryTree ? generateBinaryTreeTilemap(mazeWidth, mazeHeight, wall, floor, corridorSize || 2) :
            algorithm === MazeAlgorithm.Sidewinder ? generateSidewinderTilemap(mazeWidth, mazeHeight, wall, floor, corridorSize || 2) :
            generateEllersTilemap(mazeWidth, mazeHeight, wall, floor, corridorSize || 2);
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

    function range(min: number, max: number): number[] { 
        const arr = [];
        for(let i = min; i <= max; ++i) arr.push(i);
        return arr 
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

    function generateEllersTilemap(mazeWidth: number, mazeHeight: number, wall: Image, floor: Image, corridorSize: number): tiles.TileMapData {
        // https://weblog.jamisbuck.org/2010/12/29/maze-generation-eller-s-algorithm#
        let tmData = createTilemap(mazeWidth, mazeHeight, corridorSize, [floor, wall]);
        fillWalls(tmData);

        let yMax = mazeHeight - 1;
        let xMax = mazeWidth - 1;
        let currentRow = range(0, xMax);
        for (let y = 0; y < mazeHeight; ++y) {

            let ty = y * (corridorSize + 1) + 1;
            for (let x = 0; x < mazeWidth; x++) {
                let tx = x * (corridorSize + 1) + 1;
                
                const shouldMergeRight = x < xMax && currentRow[x] !== currentRow[x+1] && (y == yMax || Math.randomRange(0, 1));

                if (shouldMergeRight ) {
                    const setToAbsorb = currentRow[x + 1];
                    for (let i = 0; i <= xMax; ++i) 
                        if (currentRow[i] === setToAbsorb)
                            currentRow[i] = currentRow[x];
                }

                for (let by = 0; by < corridorSize; ++by)
                    for (let bx = 0; bx < corridorSize + (shouldMergeRight?1:0); ++bx) {
                        tmData.setTile(tx + bx, ty + by, 0);
                        tmData.setWall(tx + bx, ty + by, false);
                    }
            }

            if (y == yMax) break;
            ty+=corridorSize;
            const nextRow = range((y + 1) * xMax + 1, (y + 2) * xMax + 1);

            const sets = currentRow.map((v,i) => [v,i]).reduce((acc, a) => {
                const [v,i] = a;
                const s = `${v}`;
                acc[s] = (acc[s] || []);
                acc[s].push(i);
                return acc;
            }, <{[key: string]: number[]}>{})

            for (const s of Object.keys(sets)) {
                let xs = sets[s];
                for (let i = xs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * i);
                    const k = xs[i];
                    xs[i] = xs[j];
                    xs[j] = k;
                }

                xs = xs.slice(0, Math.randomRange(1,xs.length));

                for (const x of xs) {
                    let tx = x * (corridorSize + 1) + 1;
                    for (let bx = 0; bx < corridorSize; ++bx) {
                        tmData.setTile(tx + bx, ty, 0);
                        tmData.setWall(tx + bx, ty, false);
                    }
                    nextRow[x] = currentRow[x];
                }
            }

            currentRow = nextRow;
        }
        return tmData;
    }
}

