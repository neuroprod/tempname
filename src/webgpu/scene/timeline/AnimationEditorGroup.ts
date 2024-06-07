export default class AnimationEditorGroup{

    public parent:AnimationEditorGroup|null =null;
    public children:Array<AnimationEditorGroup>=[];
    constructor(label:string) {
    }
}
