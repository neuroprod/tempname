import Object3D from "../lib/model/Object3D.ts";
import Renderer from "../lib/Renderer.ts";
import UI from "../lib/UI/UI.ts";
import Model from "../lib/model/Model.ts";
import AnimationEditorGroup from "./timeline/AnimationEditorGroup.ts";
import AnimationEditor from "./timeline/AnimationEditor.ts";
import {TreeSettings} from "../lib/UI/components/Tree.ts";
import {popObjectTree, pushObjectTree} from "../UI/ObjectTree.ts";
import SceneEditor from "./SceneEditor.ts";

export default class SceneObject3D extends Object3D{
    setCurrentModel!: (value: (SceneObject3D | null)) => void;
    public  isSceneObject3D =true
    model:Model|null =null;
    private static emptyTreeSettings: TreeSettings;
    constructor(renderer:Renderer, label :string) {
        super(renderer,label);
        if(!SceneObject3D.emptyTreeSettings) {
            SceneObject3D.emptyTreeSettings = new TreeSettings();
            SceneObject3D.emptyTreeSettings.btnColor.setHex("#6e4e4e", 1)
        }
    }

    onUINice(depth:number){
        if(pushObjectTree(this.label,this.children.length<=1,depth,this ==  SceneEditor.currentModel)){
            SceneEditor.setCurrentModel(this);
        }
       // if(pushObjectTree(this.label,this.children.length<=1).clicked){

        //}
        depth++;

        for (let child of this.children){
            let co = child as SceneObject3D;
            if(co.onUINice) co.onUINice(depth)
        }
        popObjectTree();
    }
    onDataUI() {
        UI.pushID(this.UUID)
        UI.LTextInput("name",this,"label")
        UI.LFloat(this,"x","Position X")
        UI.LFloat(this,"y","Y")
        UI.LFloat(this,"z","Z")

        UI.LFloat(this,"rx","Rotation X")
        UI.LFloat(this,"ry","Y")
        UI.LFloat(this,"rz","Z")
        if(this.model){

            UI.LFloat(this.model,"sx","Scale X")
            UI.LFloat(this.model,"sy","Y")
            UI.LFloat(this.model,"sz","Z")
        }

        UI.popID()
    }

    getSceneData(dataArr:Array<any>) {
       let obj:any ={}
        obj.id =this.UUID;
        obj.label =this.label;
        obj.position =this.getPosition()
        obj.rotation=this.getRotation()
        if(this.model) {
            obj.model = this.model.label
            obj.scale=this.model.getScale();
        }
        if(this.parent)obj.parentID = this.parent.UUID
        dataArr.push(obj);

        for (let child of this.children)
        {
            let co = child as SceneObject3D;
            if (co.getSceneData) co.getSceneData(dataArr );
        }
    }


    makeAnimationGroups(root: AnimationEditorGroup) {
        let group =new AnimationEditorGroup(this.label,this)
        root.addGroup(group)

        AnimationEditor.models.push(this);

        for (let child of this.children)
        {
            let childSceneObject = child as SceneObject3D;

            if(childSceneObject.isSceneObject3D){


                childSceneObject.makeAnimationGroups(group)
            }

        }

    }


}
