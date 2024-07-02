import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {CompareFunction, FilterMode, TextureSampleType} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";


export default class GTAODenoiseMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("noisy",DefaultTextures.getWhite(this.renderer),{sampleType:TextureSampleType.Float });
        uniforms.addTexture("depth_differences",this.renderer.getTexture("GTAODepth"),{sampleType:TextureSampleType.Uint });
        uniforms.addSampler("point_clamp_sampler",GPUShaderStage.FRAGMENT,FilterMode.Nearest)
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
      let edges0 = textureGather(0, depth_differences, point_clamp_sampler, uv);
    let edges1 = textureGather(0, depth_differences, point_clamp_sampler, uv, vec2<i32>(2i, 0i));
    let edges2 = textureGather(0, depth_differences, point_clamp_sampler, uv, vec2<i32>(-1i, 0i));
    let visibility0 = textureGather(0, noisy, point_clamp_sampler, uv);
    let visibility1 = textureGather(0, noisy, point_clamp_sampler, uv, vec2<i32>(0i, -2i));
    let visibility2 = textureGather(0, noisy, point_clamp_sampler, uv, vec2<i32>(-2i, 0i));
    let visibility3 = textureGather(0, noisy, point_clamp_sampler, uv, vec2<i32>(2i, 2i));

    let left_edges = unpack4x8unorm(edges0.x);
    let right_edges = unpack4x8unorm(edges1.x);
    let top_edges = unpack4x8unorm(edges0.z);
    let bottom_edges = unpack4x8unorm(edges2.w);
    var center_edges = unpack4x8unorm(edges0.y);
    center_edges *= vec4<f32>(left_edges.y, right_edges.x, top_edges.w, bottom_edges.z);

    let center_weight = 1.2;
    let left_weight = center_edges.x;
    let right_weight = center_edges.y;
    let top_weight = center_edges.z;
    let bottom_weight = center_edges.w;
    let top_left_weight = 0.425 * (top_weight * top_edges.x + left_weight * left_edges.z);
    let top_right_weight = 0.425 * (top_weight * top_edges.y + right_weight * right_edges.z);
    let bottom_left_weight = 0.425 * (bottom_weight * bottom_edges.x + left_weight * left_edges.w);
    let bottom_right_weight = 0.425 * (bottom_weight * bottom_edges.y + right_weight * right_edges.w);

    let center_visibility = visibility0.y;
    let left_visibility = visibility0.x;
    let right_visibility = visibility0.z;
    let top_visibility = visibility1.x;
    let bottom_visibility = visibility2.z;
    let top_left_visibility = visibility0.w;
    let top_right_visibility = visibility1.w;
    let bottom_left_visibility = visibility2.w;
    let bottom_right_visibility = visibility3.w;

    var sum = center_visibility;
    sum += left_visibility * left_weight;
    sum += right_visibility * right_weight;
    sum += top_visibility * top_weight;
    sum += bottom_visibility * bottom_weight;
    sum += top_left_visibility * top_left_weight;
    sum += top_right_visibility * top_right_weight;
    sum += bottom_left_visibility * bottom_left_weight;
    sum += bottom_right_visibility * bottom_right_weight;

    var sum_weight = center_weight;
    sum_weight += left_weight;
    sum_weight += right_weight;
    sum_weight += top_weight;
    sum_weight += bottom_weight;
    sum_weight += top_left_weight;
    sum_weight += top_right_weight;
    sum_weight += bottom_left_weight;
    sum_weight += bottom_right_weight;

    let denoised_visibility = sum / sum_weight;
    return vec4(denoised_visibility,0.0,0.0,0.0);
     
}
///////////////////////////////////////////////////////////
        `
    }

}
