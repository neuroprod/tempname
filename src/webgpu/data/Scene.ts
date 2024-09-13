import SceneObject3D from "./SceneObject3D.ts";
import Renderer from "../lib/Renderer.ts";

export default class Scene extends SceneObject3D{
    constructor( renderer: Renderer, label: string)  {
        super(renderer,label);

    }

    setSceneData(obj: any) {
     console.log(obj)
    }


}
