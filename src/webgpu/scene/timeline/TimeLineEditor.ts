import ObjectGPU from "../../lib/ObjectGPU.ts";
import Renderer from "../../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";

export default class TimeLineEditor extends ObjectGPU{
    isDrawDirty: boolean =true
    numFrames =5;
    constructor(renderer:Renderer, label:string) {
        super(renderer,label)

    }
    onMouseDown(pos:Vector2){
        console.log(pos);

    }


}
