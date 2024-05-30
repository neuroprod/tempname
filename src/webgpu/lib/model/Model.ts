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

    public buffersByName: { [name: string]: GPUBuffer } = {};
    numInstances: number = 1;


    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer)
        this.renderer.addModel(this);
    }

    public update() {
        if (!this._drawDirty) return;
        if (!this.visible ) return;
        this._drawDirty =false;
        this.modelTransform.setWorldMatrix(this.worldMatrix);

    }

    addBuffer(name:string,buffer: GPUBuffer) {
       this.buffersByName[name] = buffer;
    }

    getBufferByName(name: string) {
        return this.buffersByName[name];
    }













}
