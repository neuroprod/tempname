import Renderer from "../../../lib/Renderer.ts";
import AnimationChannel from "./AnimationChannel.ts";
import SceneObject3D from "../../SceneObject3D.ts";
export enum AnimationType{
    TRANSLATE,
    ROTATE,
    SCALE,
    VISIBILITY
}
export default class Animation{

    numFrames =60;
    frameTime =1/30;

    channels: Array<AnimationChannel>=[];
    root: SceneObject3D;
    constructor(renderer:Renderer, label:string,root:SceneObject3D) {
        this.root =root;

    }


    setTime(time: number) {
        for(let c of this.channels){
            c.setTime(time);
        }


    }
}
