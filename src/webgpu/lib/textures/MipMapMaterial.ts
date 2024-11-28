
import UniformGroup from "../../lib/material/UniformGroup.ts";


import {Textures} from "../../data/Textures.ts";
import Material from "../material/Material.ts";
import {ShaderType} from "../material/ShaderTypes.ts";
import {CompareFunction} from "../WebGPUConstants.ts";
import DefaultTextures from "./DefaultTextures.ts";

export default class MipMapMaterial extends Material{





    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("inputTexture", DefaultTextures.getWhite(this.renderer));
        uniforms.addSampler("samp")


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
    output.uv0 = aUV0;

    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
       return textureSampleLevel(inputTexture, samp,uv0,0.0);
}
///////////////////////////////////////////////////////////
        `
    }

}
