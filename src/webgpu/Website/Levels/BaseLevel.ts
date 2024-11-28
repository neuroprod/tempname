import GameModel from "./GameModel.ts";

import {Vector2} from "@math.gl/core";
import Model from "../../lib/model/Model.ts";
import Ray from "../../lib/Ray.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";
import MouseInteractionWrapper from "../MouseInteractionWrapper.ts";

export class BaseLevel {


    mouseHitObjects!: Array<Model>;
    prevMousePos = new Vector2(-1, -1);
    ray = new Ray()
    mouseInteractionMap: Map<string, MouseInteractionWrapper> = new Map()


    mouseOverObject: MouseInteractionWrapper | null = null
    mouseDownObject: MouseInteractionWrapper | null = null

    constructor() {
    }

    initObjects() {



    }

    init() {

    }

    update() {

    }

    destroy() {
      GameModel.gameCamera.destroyTweens()
       GameModel.textBalloonHandler.hideText()
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
        if (GameModel.mouseListener.mousePos.equals(this.prevMousePos)) {
            return;
        }
        this.ray.setFromCamera(GameModel.gameCamera.camera, GameModel.mouseListener.getMouseNorm())
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
        if(GameModel.mouseListener.isDownThisFrame){

            if( this.mouseOverObject){
                this.mouseOverObject.onDown()
                this.mouseDownObject =this.mouseOverObject;
            }
        }
        if(GameModel.mouseListener.isUpThisFrame){

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
