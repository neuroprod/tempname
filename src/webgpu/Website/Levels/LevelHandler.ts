import {GodLevel} from "./GodLevel.ts";

import {BaseLevel} from "./BaseLevel.ts";
import {StartLevel} from "./StartLevel.ts";
import LevelObjects from "./LevelObjects.ts";


class LevelHandler {
    public levelKeys: Array<string> = [];
    public levels: Map<string, BaseLevel> = new Map()

    public currentLevel!: BaseLevel;
    private levelObjects!: LevelObjects;

    constructor() {
        this.addLevel("God", new GodLevel())
        this.addLevel("Start", new StartLevel())


    }

    setLevel(key: string) {

        if (this.currentLevel) this.currentLevel.destroy()
        this.currentLevel = this.levels.get(key) as BaseLevel;
        this.currentLevel.initObjects(this.levelObjects)
        this.currentLevel.init()
    }


    private addLevel(key: string, level: BaseLevel) {
        this.levelKeys.push(key)
        this.levels.set(key, level)
    }

    init(levelObjects: LevelObjects) {
        this.levelObjects = levelObjects;
    }
}

export default new LevelHandler()
