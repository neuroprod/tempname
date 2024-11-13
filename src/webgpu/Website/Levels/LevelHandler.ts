import {GodLevel} from "./GodLevel/GodLevel.ts";

import {BaseLevel} from "./BaseLevel.ts";
import {StartLevel} from "./StartLevel/StartLevel.ts";
import LevelData from "./LevelData.ts";
import GodChoiceLevel from "./GodChoiceLevel/GodChoiseLevel.ts";
import {CookieLevel} from "./CookieLevel/CookieLevel.ts";
import {WebsiteLevel} from "./WebsiteLevel/WebsiteLevel.ts";


class LevelHandler {
    public levelKeys: Array<string> = [];
    public levels: Map<string, BaseLevel> = new Map()

    public currentLevel!: BaseLevel;
    private levelObjects!: LevelData;

    init(levelObjects: LevelData) {
        this.levelObjects = levelObjects;
        this.addLevel("Start", new StartLevel())
        this.addLevel("God", new GodLevel())
        this.addLevel("GodChoice", new GodChoiceLevel())
        this.addLevel("Cookie", new CookieLevel())
        this.addLevel("Website", new WebsiteLevel())
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


    onUI() {
        if(this.currentLevel){
            this.currentLevel.onUI()
        }
    }
}

export default new LevelHandler()
