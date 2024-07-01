import Renderer from "../Renderer";


import Object3D from "./Object3D.ts";
import Material from "../material/Material.ts";
import Mesh from "../mesh/Mesh.ts";
import ModelTransform from "./ModelTransform.ts";


export default class Model extends Object3D {

    material!: Material;
    mesh!: Mesh

    public modelTransform: ModelTransform;
    public visible: boolean = true;

    private buffers: Array<GPUBuffer> = [];
    private bufferMap: Map<string, GPUBuffer> = new Map<string, GPUBuffer>();
    numInstances: number = 1;

    private materialMap: Map<string, Material> = new Map<string, Material>();
    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer)
        this.renderer.addModel(this);
    }

    setMaterial(name:string,mat:Material){

        this.materialMap.set(name,mat)
    }
    getMaterial(name:string){
        return this.materialMap.get(name);

    }

    public update() {
        if (!this._drawDirty) return;
        if (!this.visible ) return;
        this._drawDirty =false;
        this.modelTransform.setWorldMatrix(this.worldMatrix);

    }
    createBuffer(data: Float32Array, name: string) {
        let bufferOld = this.getBufferByName(name);
        if (bufferOld) {
            let i = this.buffers.indexOf(bufferOld)
            this.buffers.splice(i, 1);
            bufferOld.destroy()
        }

        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "vertexBuffer_" + this.label + "_" + name;

        this.buffers.push(buffer);
        this.bufferMap.set(name, buffer);
    }


    getBufferByName(name: string) {
        return this.bufferMap.get(name);
    }



}
