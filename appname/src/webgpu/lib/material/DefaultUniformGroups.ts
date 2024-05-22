
import UniformGroup from "./UniformGroup.ts";
import Camera from "../Camera.ts";
import Renderer from "../Renderer.ts";
import ModelTransform from "../model/ModelTransform.ts";

export default class DefaultUniformGroups {


    private static camera: UniformGroup;
    private static modelTransform: UniformGroup;
    static getCamera(renderer:Renderer){
        if(!this.camera) this.camera =new Camera(renderer)
        return this.camera;
    }

    static getModelTransform(renderer: Renderer) {
        if(!this.modelTransform) this.modelTransform =new ModelTransform(renderer)
        return this.modelTransform;
    }
}
