enum LineType {
    Diagonal = 0,
    Covering = 1
}

//% blockNamespace=scene
namespace tilesExt {
    import TL = tiles.Location;

    /**
     * Iterates over a line between two locations. If the handler returns truthy, then the iteration is stopped,
     * and the handlers return value is returned, otherwise the iteration runs to completion and returns undefined.
     * @param lineType width of maze
     * @param l1 start
     * @param l2 end
     * @param handler a handler which is invoked for each location
     * @param exclusive exclude the endpoints
     * @returns undefined if the whole line was iterated
     */
    //% blickId="tilesExt_line"
    //% block="for each $loc on $lineType line from $l1 to $l2 exclusive $exclusive"
    //% exclusive.defl=false
    //% inlineInputMode=inline
    //% l1.shadow=mapgettile
    //% l2.shadow=mapgettile
    //% loc.shadow=loc
    //% draggableParameters="reporter"
    export function line<T>(lineType: LineType, l1: TL, l2: TL, exclusive: boolean, handler: (loc: TL) => T): T {
        return lineType === LineType.Diagonal ? diagonalLine(l1,l2,exclusive,handler) :
            lineType === LineType.Covering ? coveringLine(l1,l2,exclusive,handler) :
            undefined;
    }

    /**
     * Iterates over a line between two locations. If the handler returns truthy, then the iteration is stopped,
     * and the handlers return value is returned, otherwise the iteration runs to completion and returns undefined.
     * @param lineType width of maze
     * @param l1 start
     * @param l2 end
     * @param handler a handler which is invoked for each location
     * @param exclusive exclude the endpoints
     * @returns undefined if the whole line was iterated
     */
    //% block="for each $loc on $lineType line from $l1 to $l2 exclusive $exclusive"
    //% blockId="tilesExt_line_statement"
    //% blockAliasFor="tilesExt.line"
    //% exclusive.defl=false
    //% inlineInputMode=inline
    //% l1.shadow=mapgettile
    //% l2.shadow=mapgettile
    //% draggableParameters="reporter"
    //% topblock=false
    //% handlerStatement=true
    export function _line(lineType: LineType, l1: TL, l2: TL, exclusive: boolean, handler: (loc: TL) => boolean | void): void {
        line(lineType, l1, l2, exclusive, handler);
    }

    function lerp(start: number, end: number, t: number) {
        return start * (1.0 - t) + t * end;
    }

    function diagonalLine<T>(l1: TL, l2: TL, exclusive: boolean, handler: (loc: TL) => T): T {
        const dx = l2.col-l1.col, dy = l2.row-l1.row;
        const N = Math.max(Math.abs(dx), Math.abs(dy));
        if (N <= 0) {
            return exclusive ? undefined : handler(l1);
        } else {
            const lastN = N  - (exclusive ? 1 : 0);
            for (let step = (exclusive ? 1 : 0); step <= lastN; step++) {
                let t = step / N;
                const res = handler(
                    new TL(
                        Math.round(lerp(l1.col, l2.col, t)),
                        Math.round(lerp(l1.row, l2.row, t)),
                        l1.tileMap
                    ));
                if (res) return res;
            }
        }

        return undefined;
    }
  
  
    

    export function coveringLine<T>(l1: TL, l2: TL, exclusive: boolean, handler: (loc: TL) => T): T {
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
            const res = handler(new TL(x, y, l1.tileMap));
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
            const res = handler(new TL(x, y, l1.tileMap));
            if (res) return res;
        }

        return undefined;
    }

    export function isWallBetweenLocations(l1: TL, l2: TL, tileMap?: tiles.TileMap): TL | void {
        tileMap = tileMap || game.currentScene().tileMap;
        return coveringLine(l1, l2, true, loc => tileMap.isObstacle(loc.col, loc.row) ? loc : undefined);
    }


    export function setTileBetweenLocations(l1: TL, l2: TL, im: Image, tileMap?: tiles.TileMap): void {
        tileMap = tileMap || game.currentScene().tileMap;
        const index = tileMap.getImageType(im);
        coveringLine(l1, l2, false, loc => tileMap.setTileAt(loc.col, loc.row, index));
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