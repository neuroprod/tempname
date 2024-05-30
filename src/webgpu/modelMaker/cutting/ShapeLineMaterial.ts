import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {CompareFunction, PrimitiveTopology} from "../../lib/WebGPUConstants.ts";


export default class ShapeLineMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.topology =PrimitiveTopology.LineList;
        this.depthCompare = CompareFunction.Always;
        this.depthWrite =false;

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*vec4( aPos,1.0);


    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return vec4f(1.0,0.0,0.0,1.0);
}
///////////////////////////////////////////////////////////
        `
    }


}
