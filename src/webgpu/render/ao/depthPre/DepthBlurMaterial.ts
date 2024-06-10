import Material from "../../../lib/material/Material.ts";
import {ShaderType} from "../../../lib/material/ShaderTypes.ts";
import UniformGroup from "../../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../../lib/textures/DefaultTextures.ts";
import {CompareFunction, FilterMode, TextureSampleType} from "../../../lib/WebGPUConstants.ts";


export default class DepthBlurMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("srcTexture",DefaultTextures.getWhite(this.renderer),{sampleType:TextureSampleType.Float });
        uniforms.addSampler("mySampler",GPUShaderStage.FRAGMENT,FilterMode.Nearest)

        this.depthWrite = false
        this.depthCompare = CompareFunction.Always

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   

${this.getShaderUniforms()}

fn weighted_average(depth0: f32, depth1: f32, depth2: f32, depth3: f32) -> f32 {
    let depth_range_scale_factor = 0.75;
    let effect_radius = depth_range_scale_factor * 0.5 * 1.457;
    let falloff_range = 0.615 * effect_radius;
    let falloff_from = effect_radius * (1.0 - 0.615);
    let falloff_mul = -1.0 / falloff_range;
    let falloff_add = falloff_from / falloff_range + 1.0;

    let min_depth = min(min(depth0, depth1), min(depth2, depth3));
    let weight0 = saturate((depth0 - min_depth) * falloff_mul + falloff_add);
    let weight1 = saturate((depth1 - min_depth) * falloff_mul + falloff_add);
    let weight2 = saturate((depth2 - min_depth) * falloff_mul + falloff_add);
    let weight3 = saturate((depth3 - min_depth) * falloff_mul + falloff_add);
    let weight_total = weight0 + weight1 + weight2 + weight3;

    return ((weight0 * depth0) + (weight1 * depth1) + (weight2 * depth2) + (weight3 * depth3)) / weight_total;
}


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
 
      let result = textureGather(0, srcTexture, mySampler, uv0);
   
   
      return vec4f(weighted_average(result.x,result.y,result.z,result.w),0,0,0); 
     
}
///////////////////////////////////////////////////////////
        `
    }

}
