//% blockNamespace=scene
namespace tilesExt {
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