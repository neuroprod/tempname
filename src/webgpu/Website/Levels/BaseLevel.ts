import LevelData from "./LevelData.ts";

export class BaseLevel {

    levelObjects!: LevelData;

    constructor() {
    }
    initObjects(levelObjects:LevelData){
console.log("initObjects")

        this.levelObjects =levelObjects;
    }
    init(){

    }
    update(){

    }
    destroy(){

    }

}
