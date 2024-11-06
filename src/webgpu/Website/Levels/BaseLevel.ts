import LevelData from "./LevelData.ts";

export class BaseLevel {

    levelObjects!: LevelData;

    constructor() {
    }
    initObjects(levelObjects:LevelData){


        this.levelObjects =levelObjects;
    }
    init(){

    }
    update(){

    }
    destroy(){

    }

}
