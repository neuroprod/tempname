import AnimationChannel from "./animation/AnimationChannel.ts";
import AnimationEditorGroup from "./AnimationEditorGroup.ts";

export default class AnimationChannelEditor extends AnimationEditorGroup{
    private channel: AnimationChannel;
    private id: string;

    constructor(label:string,channel:AnimationChannel,id:string) {
        super(label)
        this.channel =channel;
        this.id =id;
    }

    addKey(frame: number,time:number) {
        this.channel.addKey(frame,time);
    }


}
