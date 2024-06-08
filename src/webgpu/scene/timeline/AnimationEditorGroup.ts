import SceneObject3D from "../SceneObject3D.ts";

export default class AnimationEditorGroup{

    public parent:AnimationEditorGroup|null =null;
    public children:Array<AnimationEditorGroup>=[];
    private label: string;
    private obj: SceneObject3D | null;
    constructor(label:string,obj:SceneObject3D|null=null) {
        this.label =label;
        this.obj =obj;
    }

    destroy() {
        console.log("implement destroy")
    }

    addGroup(group: AnimationEditorGroup) {
        this.children.push(group)
    }
}
