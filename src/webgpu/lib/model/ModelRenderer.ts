import Model from "./Model";

import Renderer from "../Renderer";
import RenderPass from "../RenderPass.ts";
import Camera from "../Camera.ts";
import UniformGroup from "../material/UniformGroup.ts";
import Material from "../material/Material.ts";


export default class ModelRenderer {

    public models: Array<Model> = [];
    private renderer: Renderer;
    private label: string;
    private camera!: Camera;
    private singleMaterial = false;
    private material!: Material;
    private materialType!: string;


    constructor(renderer: Renderer, label = "", camera: Camera) {
        this.label = label;
        this.renderer = renderer;
        this.camera = camera;

    }

    setMaterialType(name: string) {
        this.materialType = name;
    }

    setMaterial(material: Material) {
        this.singleMaterial = true;
        this.material = material;
    }

    draw(pass: RenderPass) {

        const passEncoder = pass.passEncoder;

        let currentMaterialID = ""
        let uniformGroupsIDS: Array<string> = ["", "", "", ""];
        let material: Material|undefined

        if (this.singleMaterial) {
            material = this.material;
            material.makePipeLine(pass);
            passEncoder.setPipeline(material.pipeLine);
        }

        // passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.models) {

            if(model.markedDelete){

                console.warn("deletedModel",model.mesh.label,this)
                let i = this.models.indexOf(model);
                this.models.splice(i,1)
                return;
            }
            if (!model.visible) continue
            if (!model.mesh) continue;
            if (!model.mesh.positions) continue;

            if (!this.singleMaterial) {

                if (this.materialType) {
                    material = model.getMaterial(this.materialType);
                } else {

                    material = model.material;
                }

                if (!material) {

                    continue;
                }

                if (material.UUID != currentMaterialID) {
                    material.makePipeLine(pass);
                    passEncoder.setPipeline(material.pipeLine);
                    currentMaterialID = material.UUID;
                }
            }


            // @ts-ignore
            for (let i = 0; i < material.uniformGroups.length; i++) {
                // @ts-ignore
                let label = material.uniformGroups[i].label;
                let uniformGroup: UniformGroup;

                if (label == "camera") {

                    uniformGroup = this.camera;
                } else if (label == "model") {
                    uniformGroup = model.modelTransform;
                } else {
                    // @ts-ignore
                    uniformGroup = material.uniformGroups[i];
                }
//console.log( uniformGroup)
                if (uniformGroupsIDS[i] != uniformGroup.UUID) {
                    uniformGroupsIDS[i] = uniformGroup.UUID
                    passEncoder.setBindGroup(i, uniformGroup.bindGroup);
                }

            }


            // @ts-ignore
            for (let attribute of material.attributes) {
                let buffer = model.mesh.getBufferByName(attribute.name);
                if (!buffer) buffer = model.getBufferByName(attribute.name);
                if (buffer ) {
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

    public setModels(models: Array<Model>) {

        this.models = models;
    }

    public addModel(model: Model) {

        this.models.push(model);
    }

    public removeModel(model: Model) {
        const index = this.models.indexOf(model, 0);
        if (index > -1) {
            this.models.splice(index, 1);
        }
    }
}
