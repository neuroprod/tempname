import AnimationChannel from "./animation/AnimationChannel.ts";

export default class AnimationChannelEditor{
    private channel: AnimationChannel;
    private id: string;

    constructor(channel:AnimationChannel,id:string) {
        this.channel =channel;
        this.id =id;
    }

    addKey(frame: number,time:number) {
        this.channel.addKey(frame,time);
    }

    
}
