import Renderer from "../../../lib/Renderer.ts";
import AnimationChannel from "./AnimationChannel.ts";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
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
    label: string ="";
    private playTime: number=0;

    public play:boolean =false;


    constructor(renderer:Renderer, label:string,root:SceneObject3D) {
        this.root =root;
        this.label =label;
        this.root =root;

    }


    setTime(time: number) {
        for(let c of this.channels){
            c.setTime(time);
        }
    }

    getAnimationData(animationData: Array<any>) {
        let data:any ={}
        data.rootID =this.root.UUID;

        data.label =this.label;
        data.numFrames =this.numFrames;
        data.frameTime =this.frameTime;
        data.channels =[]
        for(let c of this.channels){
            c.getChannelData(data.channels);
        }

        animationData.push(data)

    }

    autoPlay(delta: number) {
        this.playTime += Timer.delta / this.frameTime;

        if (this.playTime > this.numFrames) {
            this.playTime -= this.numFrames
        }
        this.setTime(this.playTime)
    }
    setFrame(frame:number){
        this.playTime =frame;
        this.setTime(this.playTime)

    }
    update(delta: number) {

        if(this.play){
            this.playTime += delta / this.frameTime;

            if (this.playTime > this.numFrames) {this.playTime == this.numFrames;  this.play =false;}
            this.setTime(this.playTime)

        }
    }
}
