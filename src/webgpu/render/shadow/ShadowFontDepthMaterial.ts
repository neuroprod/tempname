import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";
import {Textures} from "../../data/Textures.ts";
import {CullMode} from "../../lib/WebGPUConstants.ts";

export default class ShadowFontDepthMaterial extends Material{

    setup() {
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("world",ShaderType.vec3);
        this.addVertexOutput("uv",ShaderType.vec2);

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);

        uniforms.addTexture("colorTexture",this.renderer.getTexture(Textures.MAINFONT))
        uniforms.addSampler("mySampler")

        this.cullMode =CullMode.None
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
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( aPos,1.0);
    output.world = (camera.viewMatrix*model.modelMatrix* vec4( aPos,1.0)).xyz;
 output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()})  -> @location(0) vec4f
{
 let text =textureSample(colorTexture, mySampler,  uv);
   let sigDist = max(min(text.r, text.g), min(max(text.r, text.g), text.b))- 0.5;
    if(sigDist<0  )
    {
        discard;
    }
  //viewPosition
    return vec4f(world.z,0.0,0.0,0.0);

}
///////////////////////////////////////////////////////////
        `
    }





}
