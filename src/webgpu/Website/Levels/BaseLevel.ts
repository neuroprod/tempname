import LevelData from "./LevelData.ts";

import {Vector2} from "@math.gl/core";
import Model from "../../lib/model/Model.ts";
import Ray from "../../lib/Ray.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import MouseInteractionWrapper from "../MouseInteractionWrapper.ts";

export class BaseLevel {

    levelObjects!: LevelData;
    mouseHitObjects!: Array<Model>;
    prevMousePos = new Vector2(-1, -1);
    ray = new Ray()
    mouseInteractionMap: Map<string, MouseInteractionWrapper> = new Map()


    mouseOverObject: MouseInteractionWrapper | null = null
    mouseDownObject: MouseInteractionWrapper | null = null

    constructor() {
    }

    initObjects(levelObjects: LevelData) {


        this.levelObjects = levelObjects;
    }

    init() {

    }

    update() {

    }

    destroy() {
        this.levelObjects.textBalloonHandler.hideText()
    }
    onUI(){

    }
    setMouseHitObjects(mouseHitObjects: Array<Model>) {
        this.mouseOverObject = null;
        this.mouseDownObject = null;
        this.mouseHitObjects = mouseHitObjects;
        for (let mhModel of this.mouseHitObjects) {
            let mhObject = mhModel.parent as SceneObject3D;
            let id = mhObject.mouseHitID;
            if (!this.mouseInteractionMap.has(id)) {
                let mi = new MouseInteractionWrapper(id)
                this.mouseInteractionMap.set(id, mi);
            }

        }

    }

    updateMouse() {
        if (!this.mouseHitObjects) return;
        if (this.levelObjects.mouseListener.mousePos.equals(this.prevMousePos)) {
            return;
        }
        this.ray.setFromCamera(this.levelObjects.gameCamera.camera, this.levelObjects.mouseListener.getMouseNorm())
        let intersections = this.ray.intersectModels(this.mouseHitObjects);

        if (intersections.length) {
            let overObject = intersections[0].model.parent as SceneObject3D;
            let overID = overObject.mouseHitID
            if(this.mouseOverObject==null){
                this.mouseOverObject = this.mouseInteractionMap.get(overID) as MouseInteractionWrapper
                this.mouseOverObject.onRollOver()

            }else if( this.mouseOverObject.id ==overID){

                //nothing

            }else {
                this.mouseOverObject.onRollOut()
                this.mouseOverObject = this.mouseInteractionMap.get(overID) as MouseInteractionWrapper
                this.mouseOverObject.onRollOver()
            }

        }else{
            //no intersection
            if(this.mouseOverObject){
                this.mouseOverObject.onRollOut()
                this.mouseOverObject =null;
            }else{
                //nothing
            }

        }
        if(this.levelObjects.mouseListener.isDownThisFrame){

            if( this.mouseOverObject){
                this.mouseOverObject.onDown()
                this.mouseDownObject =this.mouseOverObject;
            }
        }
        if(this.levelObjects.mouseListener.isUpThisFrame){

            if(  this.mouseDownObject){
                this.mouseDownObject.onUp()
                if(  this.mouseDownObject ==this.mouseOverObject){
                    this.mouseDownObject.onClick()

                }else{
                    this.mouseDownObject.onUpOutside()
                }
                this.mouseDownObject =null
            }


        }

    }


}
