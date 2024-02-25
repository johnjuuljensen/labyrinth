enum LineType {
    Diagonal = 0,
    Covering = 1
}

//% blockNamespace=scene
namespace tilesExt {
    import TL = tiles.Location;

    /**
     * Calculates the locations between two given locations.
     * @param lineType width of maze
     * @param l1 start
     * @param l2 end
     * @param exclusive exclude the endpoints
     * @returns The locations intersected by the line
     */
    //% blickId="tilesExt_line"
    //% block="array of locations on $lineType line from $l1 to $l2 || exclusive $exclusive"
    //% exclusive.defl=false
    //% inlineInputMode=inline
    //% l1.shadow=mapgettile
    //% l2.shadow=mapgettile
    export function line(lineType: LineType, l1: TL, l2: TL, exclusive?: boolean): TL[] {
        return lineType === LineType.Diagonal ? diagonalLine(l1,l2,exclusive) :
            lineType === LineType.Covering ? coveringLine(l1,l2,exclusive) :
            undefined;
    }


    function lerp(start: number, end: number, t: number) {
        return start * (1.0 - t) + t * end;
    }

    function diagonalLine(l1: TL, l2: TL, exclusive: boolean): TL[] {
        const dx = l2.col-l1.col, dy = l2.row-l1.row;
        const N = Math.max(Math.abs(dx), Math.abs(dy));
        if (N <= 0) {
            return exclusive ? [] : [l1];
        }

        const res = [];
        const lastN = N  - (exclusive ? 1 : 0);
        for (let step = (exclusive ? 1 : 0); step <= lastN; step++) {
            let t = step / N;
            res.push(
                new TL(
                    Math.round(lerp(l1.col, l2.col, t)),
                    Math.round(lerp(l1.row, l2.row, t)),
                    l1.tileMap
                ));
        }

        return res;
    }
  

    export function coveringLine(l1: TL, l2: TL, exclusive: boolean): TL[] {
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

        const res = [];
        for (; ix < absx || iy < absy;) {
            res.push(new TL(x, y, l1.tileMap));
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
            res.push(new TL(x, y, l1.tileMap));
        }

        return res;
    }


    //% block="is $loc wall"
    //% blockId=tilesExt_isWall
    //% inlineInputMode=inline
    //% loc.shadow=mapgettile
    export function isWall(loc: TL, tileMap?: tiles.TileMap): boolean {
        tileMap = tileMap || game.currentScene().tileMap;
        return tileMap.isObstacle(loc.col, loc.row);
    }


    /**
     * Get a random tile of the given type
     * @param tile the type of tile to get a random selection of
     */
    //% blockId=tilesExt_getRandomTilesByType
    //% group=Locations
    //% block="array of max $maxCount $tile locations"
    //% tile.shadow=tileset_tile_picker
    export function getRandomTilesByType(tile: Image, maxCount: number): TL[] {
        const scene = game.currentScene();
        if (!tile || !scene.tileMap)
            return undefined;
        const index = scene.tileMap.getImageType(tile);
        return scene.tileMap.sampleTilesByType(index, maxCount);
    }
}