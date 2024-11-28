import {GodLevel} from "./GodLevel/GodLevel.ts";

import {BaseLevel} from "./BaseLevel.ts";
import {StartLevel} from "./StartLevel/StartLevel.ts";

import GodChoiceLevel from "./GodChoiceLevel/GodChoiseLevel.ts";
import {CookieLevel} from "./CookieLevel/CookieLevel.ts";
import {WebsiteLevel} from "./WebsiteLevel/WebsiteLevel.ts";
import CookieGame from "./CookieGame/CookieGame.ts";
import {StrawberryLevel} from "./StrawberryLevel/StrawberryLevel.ts";
import AppState from "../../AppState.ts";
import GameModel from "../GameModel.ts";


class LevelHandler {
    public levelKeys: Array<string> = [];
    public levels: Map<string, BaseLevel> = new Map()

    public currentLevel!: BaseLevel | null;


    init() {

        this.addLevel("Start", new StartLevel())
        this.addLevel("God", new GodLevel())
        this.addLevel("GodChoice", new GodChoiceLevel())
        this.addLevel("Cookie", new CookieLevel())
        this.addLevel("CookieGame", new CookieGame())
        this.addLevel("Website", new WebsiteLevel())
        this.addLevel("StrawBerry", new StrawberryLevel())
    }

    setLevel(key: string) {
        GameModel.coinHandeler.hide()
        if (this.currentLevel) this.currentLevel.destroy()
        this.currentLevel = this.levels.get(key) as BaseLevel;
        if (this.currentLevel) {
            AppState.setState("currentLevel", key);
            this.currentLevel.init()
        } else {
            console.log("level doesnt exist ->", key)
        }

    }

    destroyCurrentLevel() {
        if (this.currentLevel) this.currentLevel.destroy()
        this.currentLevel = null;
    }

    onUI() {
        if (this.currentLevel) {
            this.currentLevel.onUI()
        }
    }

    private addLevel(key: string, level: BaseLevel) {

        this.levelKeys.push(key)
        this.levels.set(key, level)
    }
}

export default new LevelHandler()
