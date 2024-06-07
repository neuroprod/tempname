import Object3D from "../lib/model/Object3D.ts";
import Renderer from "../lib/Renderer.ts";
import UI from "../lib/UI/UI.ts";
import Model from "../lib/model/Model.ts";

export default class SceneObject3D extends Object3D{
    setCurrentModel!: (value: (SceneObject3D | null)) => void;
    public  isSceneObject3D =true
    model:Model|null =null;
    constructor(renderer:Renderer, label :string) {
        super(renderer,label);
    }

    onUI(){
        if(UI.pushTree(this.label)){
            this.setCurrentModel(this);
        }
        for (let child of this.children){
            let co = child as SceneObject3D;
            if(co.onUI) co.onUI()
        }
        UI.popTree()
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


}
