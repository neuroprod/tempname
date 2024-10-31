import LevelObjects from "./LevelObjects.ts";

export class BaseLevel {

    levelObjects!: LevelObjects;

    constructor() {
    }
    initObjects(levelObjects:LevelObjects){


        this.levelObjects =levelObjects;
    }
    init(){

    }
    update(){

    }
    destroy(){

    }

}
