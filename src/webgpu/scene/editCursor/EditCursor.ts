import Renderer from "../../lib/Renderer.ts";
import Model from "../../lib/model/Model.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import Object3D from "../../lib/model/Object3D.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import Box from "../../lib/mesh/geometry/Box.ts";
import SolidMaterial from "../../lib/material/SolidMaterial.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import Camera from "../../lib/Camera.ts";
import RevolveMesh from "../../lib/mesh/geometry/RevolveMesh.ts";


export default class EditCursor{
    private renderer: Renderer;
    private currentModel: Model | null =null;
    private root: Object3D;
    private arrowMesh:Mesh

    private arrowY : Model;
    private modelRenderer: ModelRenderer;
    private arrowX: Model;
    private arrowZ: Model;
    private camera: Camera;
    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.camera =camera;
        this.root =new Object3D(renderer,"rootCursor");
        this.root.setScaler(0.2)

        this.arrowMesh=new RevolveMesh(this.renderer,"arrow",8,[0,0.01,0.01,0.05,0],[0,0,0.8,0.8,1])


        this.arrowY = new Model(this.renderer,"testModel")
        this.arrowY.mesh =this.arrowMesh
        this.arrowY.material =new SolidMaterial(renderer,"up")

        this.arrowY.material.setUniform("color",[0,1,0,1])
        this.arrowY.material.depthCompare ="always"
        this.root.addChild(this.arrowY)


        this.arrowX = new Model(this.renderer,"testModel")
        this.arrowX.mesh =this.arrowMesh

        this.arrowX.setEuler(0,0,-Math.PI/2)
        this.arrowX.material =new SolidMaterial(renderer,"up")
        this.arrowX.material.setUniform("color",[1,0,0,1])
        this.arrowX.material.depthCompare ="always"
        this.root.addChild(this.arrowX)


        this.arrowZ = new Model(this.renderer,"testModel")
        this.arrowZ.mesh =this.arrowMesh
        this.arrowZ.setEuler(Math.PI/2,0,0)

        this.arrowZ.material =new SolidMaterial(renderer,"up")
        this.arrowZ.material.depthCompare ="always"
        this.arrowZ.material.setUniform("color",[0,0,1,1])
        this.root.addChild(this.arrowZ)


        this.modelRenderer =new ModelRenderer(this.renderer,"render",camera)

        this.modelRenderer.addModel( this.arrowY)
        this.modelRenderer.addModel( this.arrowX)
        this.modelRenderer.addModel( this.arrowZ)

    }
    public update(){

        if(!this.currentModel)return;


        let p = this.currentModel.getWorldPos();
        this.root.setPositionV(p);

        let pUp = p.clone().add(this.camera.cameraUp)
        p.transformAsPoint(this.camera.viewProjection)
        pUp.transformAsPoint(this.camera.viewProjection)
        let scale = 1/p.distance(pUp);
        this.root.setScaler(scale*0.2)


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
