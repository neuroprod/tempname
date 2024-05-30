import Material from "../material/Material.ts";
import {ShaderType} from "../material/ShaderTypes.ts";
import DefaultUniformGroups from "../material/DefaultUniformGroups.ts";
import {PrimitiveTopology} from "../WebGPUConstants.ts";


export default class DebugLineMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aColor", ShaderType.vec4);


        this.addVertexOutput("color", ShaderType.vec4 );



        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.topology =PrimitiveTopology.LineList;
      //  this.logShader =true;
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
    output.color = aColor;

    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return color;
}
///////////////////////////////////////////////////////////
        `
    }


}
