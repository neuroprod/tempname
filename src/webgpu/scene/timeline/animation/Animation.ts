import Renderer from "../../../lib/Renderer.ts";
import AnimationChannel from "./AnimationChannel.ts";
export enum AnimationType{
    TRANSLATE,
    ROTATE,
    SCALE,
    VISIBILITY
}
export default class Animation{

    numFrames =30;
    frameTime =1/30;

    channels: Array<AnimationChannel>=[];
    constructor(renderer:Renderer, label:string) {

    }


    setTime(time: number) {
        for(let c of this.channels){
            c.setTime(time);
        }


    }
}
