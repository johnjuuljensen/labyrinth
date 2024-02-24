enum LineType {
    Diagonal = 0,
    Covering = 1
}

//% blockNamespace=scene
namespace tilesExt {

    //% l1.shadow=mapgettile
    //% l2.shadow=mapgettile
    export function coveringLineBetweenTiles<T>(l1: tiles.Location, l2: tiles.Location, exclusive: boolean, handler: (col: number, row: number) => T): T {
        // https://www.redblobgames.com/grids/line-drawing/#stepping
        const dx = l2.col-l1.col, dy = l2.row-l1.row;
        const absx = Math.abs(dx), absy = Math.abs(dy);
        const stepx = Math.sign(dx), stepy = Math.sign(dy);
    
        let x = l1.col, y = l1.row;
        let ix = 0, iy = 0;
        if (exclusive) {
            if ((1+ix<<1)*absy < (1+iy<<1)*absx) {
                x += stepx;
                ix++;
            } else {
                y += stepy;
                iy++;
            }
        }

        for (; ix < absx || iy < absy;) {
            const res = handler(x,y);
            if (res) return res;
            if ((1+ix<<1)*absy < (1+iy<<1)*absx) {
                x += stepx;
                ix++;
            } else {
                y += stepy;
                iy++;
            }
        }
        if (!exclusive) {
            const res = handler(x,y);
            if (res) return res;
        }

        return undefined;
    }

    export function isWallBetweenLocations(l1: tiles.Location, l2: tiles.Location, tileMap?: tiles.TileMap): tiles.Location | undefined {
        tileMap = tileMap || game.currentScene().tileMap;
        return coveringLineBetweenTiles(l1, l2, true, (x,y) => tileMap.isObstacle(x,y) ? new tiles.Location(x,y,l1.tileMap) : undefined);
    }


    export function setTileBetweenLocations(l1: tiles.Location, l2: tiles.Location, im: Image, tileMap?: tiles.TileMap): void {
        tileMap = tileMap || game.currentScene().tileMap;
        const index = tileMap.getImageType(im);
        coveringLineBetweenTiles(l1, l2, false, (x,y) => tileMap.setTileAt(x,y,index));
    }


    /**
     * Get a random tile of the given type
     * @param tile the type of tile to get a random selection of
     */
    //% blockId=tilesExt_getRandomTilesByType
    //% group=Locations
    //% block="array of max $maxCount $tile locations"
    //% tile.shadow=tileset_tile_picker
    export function getRandomTilesByType(tile: Image, maxCount: number): tiles.Location[] {
        const scene = game.currentScene();
        if (!tile || !scene.tileMap)
            return undefined;
        const index = scene.tileMap.getImageType(tile);
        return scene.tileMap.sampleTilesByType(index, maxCount);
    }
}