import Mesh from "../Mesh.ts";
import Renderer from "../../Renderer.ts";

export default class RevolveMesh extends Mesh
{

    constructor(renderer: Renderer,label:string,steps:number, radii:Array<number>[], positionsY:Array<number>[])
    {
        super(renderer,label);
    }


}
