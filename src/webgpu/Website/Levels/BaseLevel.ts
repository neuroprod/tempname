import LevelData from "./LevelData.ts";
import MouseListener from "../../lib/MouseListener.ts";
import {Vector2} from "@math.gl/core";
import Model from "../../lib/model/Model.ts";
import Ray from "../../lib/Ray.ts";
import SceneObject3D from "../../data/SceneObject3D.ts";

export class BaseLevel {

    levelObjects!: LevelData;
    mouseHitObjects!: Array<Model>;
    prevMousePos = new Vector2(-1,-1);
    ray =new Ray()
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

    updateMouse() {
        if(!this.mouseHitObjects)return;
        if(this.levelObjects.mouseListener.mousePos.equals(this.prevMousePos) ){
            return;
        }
        this.ray.setFromCamera(this.levelObjects.gameCamera.camera, this.levelObjects.mouseListener.getMouseNorm())
        let intersections = this.ray.intersectModels(this.mouseHitObjects);

        if(intersections.length){
            let overObject = intersections[0].model.parent as SceneObject3D;
            let overID =overObject.mouseHitID
            this.levelObjects.mouseListener.isDownThisFrame
            this.levelObjects.mouseListener.isUpThisFrame
            console.log(overID)
        }

    }


}
