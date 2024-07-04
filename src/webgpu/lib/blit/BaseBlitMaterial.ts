import Material from "../material/Material.ts";
import {ShaderType} from "../material/ShaderTypes.ts";
import UniformGroup from "../material/UniformGroup.ts";
import DefaultTextures from "../textures/DefaultTextures.ts";
import {CompareFunction, FilterMode} from "../WebGPUConstants.ts";

export default class BaseBlitMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer));
        uniforms.addSampler("mySampler",GPUShaderStage.FRAGMENT,FilterMode.Nearest)

        this.depthWrite = false
        this.depthCompare = CompareFunction.Always

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
    output.position =vec4( aPos,1.0);
    output.uv = aUV0;

    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return textureSample(colorTexture, mySampler,  uv) ;
}
///////////////////////////////////////////////////////////
        `
    }

}
