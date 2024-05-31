import Renderer from "../../lib/Renderer.ts";
import Model from "../../lib/model/Model.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import Object3D from "../../lib/model/Object3D.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import Box from "../../lib/mesh/geometry/Box.ts";
import SolidMaterial from "../../lib/material/SolidMaterial.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import Camera from "../../lib/Camera.ts";


export default class EditCursor{
    private renderer: Renderer;
    private currentModel: Model | null =null;
    private root: Object3D;
    private testMesh:Mesh
    private red: SolidMaterial;
    private testModel: Model;
    private modelRenderer: ModelRenderer;
    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.root =new Object3D(renderer,"rootCursor");

        this.testMesh =new Box(this.renderer)
        this.red = new SolidMaterial(this.renderer,"red")
        this.testModel = new Model(this.renderer,"testModel")
        this.testModel.mesh =this.testMesh
        this.testModel.material =this.red;
        this.testModel.setScale(0.1,0.1,0.1)

        this.modelRenderer =new ModelRenderer(this.renderer,"render",camera)

        this.modelRenderer.addModel(this.testModel)

    }
    setCurrentModel(model: Model | null) {
        this.currentModel = model;
        if(!this.currentModel)return


    }
    drawFinal(pass: CanvasRenderPass) {
        if(!this.currentModel)return
        this.modelRenderer.draw(pass);

    }

    draw() {

    }
}
