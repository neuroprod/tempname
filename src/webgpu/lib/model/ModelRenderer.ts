import Model from "./Model";

import Renderer from "../Renderer";
import RenderPass from "../RenderPass.ts";
import Camera from "../Camera.ts";
import UniformGroup from "../material/UniformGroup.ts";


export default class ModelRenderer {

    public models: Array<Model> = [];
    private renderer: Renderer;
    private label: string;
    private camera: Camera;


    constructor(renderer: Renderer, label = "",camera:Camera) {
        this.label = label;
        this.renderer = renderer;
        this.camera =camera;

    }

    draw(pass: RenderPass) {

        const passEncoder = pass.passEncoder;

        let currentMaterialID =""
        let uniformGroupsIDS:Array<string>=["","","",""];
       // passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.models) {
            if (!model.visible) continue

            if(model.material.UUID!=currentMaterialID){
                model.material.makePipeLine(pass);
                passEncoder.setPipeline(model.material.pipeLine);
            }

            for(let i=0;i< model.material.uniformGroups.length;i++){
                let label =model.material.uniformGroups[i].label;
                let uniformGroup:UniformGroup ;

                if(label=="camera"){
                    uniformGroup = this.camera;
                }
                else if(label=="model"){
                    uniformGroup = model.modelTransform;
                }
                else{
                    uniformGroup =model.material.uniformGroups[i];
                }

                if(uniformGroupsIDS[i]!=uniformGroup.UUID){
                    uniformGroupsIDS[i]=uniformGroup.UUID
                    passEncoder.setBindGroup(i,uniformGroup.bindGroup);
                }

            }








            for (let attribute of model.material.attributes) {
                let buffer = model.mesh.getBufferByName(attribute.name);
                if (!buffer) buffer = model.getBufferByName(attribute.name);
                if (buffer) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        buffer,
                    )
                } else {

                    console.log("buffer not found", attribute.name)
                }
            }

            if (model.mesh.hasIndices) {

                passEncoder.setIndexBuffer(model.mesh.indexBuffer, model.mesh.indexFormat);
                passEncoder.drawIndexed(
                    model.mesh.numIndices,
                    model.numInstances,
                    0,
                    0
                );
            } else {
                passEncoder.draw(
                    model.mesh.numVertices,
                    model.numInstances,
                    0,
                    0
                );
            }

        }
    }

    public addModel(model: Model) {

        this.models.push(model);
    }

    removeModel(model: Model) {
        const index = this.models.indexOf(model, 0);
        if (index > -1) {
            this.models.splice(index, 1);
        }
    }
}
