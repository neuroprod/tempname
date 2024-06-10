import {Textures} from "../../../data/Textures.ts";



import Material from "../../../lib/material/Material.ts";
import {ShaderType} from "../../../lib/material/ShaderTypes.ts";
import UniformGroup from "../../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../../lib/textures/DefaultTextures.ts";
import {CompareFunction, FilterMode, TextureSampleType} from "../../../lib/WebGPUConstants.ts";
import DefaultUniformGroups from "../../../lib/material/DefaultUniformGroups.ts";


export default class GTAOMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv", ShaderType.vec2 );
        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));



        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("noise", this.renderer.getTexture("./BlueNoise.png"));
        uniforms.addTexture("preprocessed_depth", this.renderer.getTexture(Textures.DEPTH_BLUR))
        uniforms.addTexture("normals", this.renderer.getTexture(Textures.GNORMAL))
        uniforms.addSampler("point_clamp_sampler",GPUShaderStage.FRAGMENT,FilterMode.Nearest)

        this.depthWrite = false
        this.depthCompare = CompareFunction.Always
        this.logShader =true

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   
struct AOOutput {
  @location(0) ao : vec4f,
  @location(1) depthDif : vec4<u32>,
   
}

    ${this.getVertexOutputStruct()}   

    ${this.getShaderUniforms()}

struct d {
  @location(0) a : f32,
  @location(1) b : u32,
   
}
const PI=3.1415927;
const HALF_PI=1.5707964;

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =vec4( aPos,1.0);
    output.uv = aUV0;
    return output;
}




fn load_noise(pixel_coordinates: vec2<i32>) -> vec2<f32> {
    var index = textureLoad(noise, pixel_coordinates%64 , 0).r;//g*2.0)-vec2(1.0);
   return fract(0.5 + f32(index) * vec2<f32>(0.75487766624669276005, 0.5698402909980532659114));
 // return index;

   /* var index = textureLoad(hilbert_index_lut, pixel_coordinates % 64, 0).r;



    // R2 sequence - http://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences
    //return fract(0.5 + f32(index) * vec2<f32>(0.75487766624669276005, 0.5698402909980532659114));*/
}

// Calculate differences in depth between neighbor pixels (later used by the spatial denoiser pass to preserve object edges)
fn calculate_neighboring_depth_differences(uv:vec2f) -> d {
    // Sample the pixel's depth and 4 depths around it
   var dd:d;
    let depths_upper_left = textureGather(0, preprocessed_depth, point_clamp_sampler, uv);
    let depths_bottom_right = textureGather(0, preprocessed_depth, point_clamp_sampler, uv, vec2<i32>(1i, 1i));
    let depth_center = depths_upper_left.y;
    let depth_left = depths_upper_left.x;
    let depth_top = depths_upper_left.z;
    let depth_bottom = depths_bottom_right.x;
    let depth_right = depths_bottom_right.z;

    // Calculate the depth differences (large differences represent object edges)
    var edge_info = vec4<f32>(depth_left, depth_right, depth_top, depth_bottom) - depth_center;
    let slope_left_right = (edge_info.y - edge_info.x) * 0.5;
    let slope_top_bottom = (edge_info.w - edge_info.z) * 0.5;
    let edge_info_slope_adjusted = edge_info + vec4<f32>(slope_left_right, -slope_left_right, slope_top_bottom, -slope_top_bottom);
    edge_info = min(abs(edge_info), abs(edge_info_slope_adjusted));
    let bias = 0.25; // Using the bias and then saturating nudges the values a bit
    let scale = depth_center * 0.011; // Weight the edges by their distance from the camera
    edge_info = saturate((1.0 + bias) - edge_info / scale); // Apply the bias and scale, and invert edge_info so that small values become large, and vice versa

    // Pack the edge info into the texture
  let edge_info_packed = vec4<u32>(pack4x8unorm(edge_info), 0u, 0u, 0u);
   // textureStore(depth_differences, pixel_coordinates, edge_info_packed);
dd.a =depth_center;
dd.b = pack4x8unorm(edge_info);
    return dd;
}

fn load_normal_view_space(uv: vec2<f32>) -> vec3<f32> {
    var world_normal = textureSampleLevel(normals, point_clamp_sampler, uv, 0.0).xyz;
    world_normal = (world_normal * 2.0) - 1.0;
    let view_from_world = mat3x3<f32>(
        camera.viewMatrix[0].xyz,
       camera.viewMatrix[1].xyz,
        camera.viewMatrix[2].xyz,
  
    );
    return  view_from_world *world_normal;
}

fn reconstruct_view_space_position(depth: f32, uv: vec2<f32>) -> vec3<f32> {
   let clip_xy = vec2<f32>(uv.x * 2.0 - 1.0, 1.0 - 2.0 * uv.y);
    let t = camera.inverseProjectionMatrix * vec4<f32>(clip_xy, depth, 1.0);
    let view_xyz = t.xyz / t.w;
    return view_xyz;
}

fn load_and_reconstruct_view_space_position(uv: vec2<f32>,uv2: vec2<f32>, sample_mip_level: f32) -> vec3<f32> {
    let depth = textureSampleLevel(preprocessed_depth, point_clamp_sampler, uv, sample_mip_level).r;
    return reconstruct_view_space_position(depth, uv2);
}

fn fast_sqrt(x: f32) -> f32 {
    return bitcast<f32>(0x1fbd1df5 + (bitcast<i32>(x) >> 1u));
}

fn fast_acos(in_x: f32) -> f32 {
    let x = abs(in_x);
    var res = -0.156583 * x + HALF_PI;
    res *= fast_sqrt(1.0 - x);
    return select(PI - res, res, in_x >= 0.0);
}

@fragment
fn mainFragment(${this.getFragmentInput()}) ->  AOOutput
{
   var output : AOOutput;
   
    let slice_count = 5.0;
    let samples_per_slice_side =3.0;
     let effect_radius = 0.09 * 1.457;
    let falloff_range = 0.615 * effect_radius*0.4;
    let falloff_from = effect_radius * (1.0 - 0.615)*0.4;
    let falloff_mul = -1.0 / falloff_range;
    let falloff_add = falloff_from / falloff_range + 1.0;
  
    let textureSize =vec2<f32>( textureDimensions(normals));
     
    let pixel_coordinates = vec2<i32>(floor(uv*textureSize));;
    
    let r = calculate_neighboring_depth_differences(uv);
    var pixel_depth = r.a;
   pixel_depth -= 0.00002; // Avoid depth precision issues

    var pixel_position = reconstruct_view_space_position(pixel_depth, uv);
   // pixel_position.z = pixel_position.z +0.01;
    let pixel_normal =load_normal_view_space(uv);
    let view_vec = normalize(-pixel_position);

    let noise = load_noise(pixel_coordinates);
    let sample_scale = (-0.5 * effect_radius * camera.projectionMatrix[0][0]) / pixel_position.z;

    var visibility = 0.0;
    for (var slice_t = 0.0; slice_t < slice_count; slice_t += 1.0) {
        let slice = slice_t + noise.x;
        let phi = (PI / slice_count) * slice;
        let omega = vec2<f32>(cos(phi), sin(phi));

        let direction = vec3<f32>(omega.xy, 0.0);
        let orthographic_direction = direction - (dot(direction, view_vec) * view_vec);
        let axis = cross(direction, view_vec);
        let projected_normal = pixel_normal - axis * dot(pixel_normal, axis);
        let projected_normal_length = length(projected_normal);

        let sign_norm = sign(dot(orthographic_direction, projected_normal));
        let cos_norm = saturate(dot(projected_normal, view_vec) / projected_normal_length);
        let n = sign_norm * fast_acos(cos_norm);

        let min_cos_horizon_1 = cos(n + HALF_PI);
        let min_cos_horizon_2 = cos(n - HALF_PI);
        var cos_horizon_1 = min_cos_horizon_1;
        var cos_horizon_2 = min_cos_horizon_2;
        let sample_mul = vec2<f32>(omega.x, -omega.y) * sample_scale;
        for (var sample_t = 0.0; sample_t < samples_per_slice_side; sample_t += 1.0) {
            var sample_noise = (slice_t + sample_t * samples_per_slice_side) * 0.6180339887498948482;
            sample_noise = fract(noise.y + sample_noise);

            var s = (sample_t + sample_noise) / samples_per_slice_side;
           s *= s; // https://github.com/GameTechDev/XeGTAO#sample-distribution
            let sample = s * sample_mul;

            // * view.viewport.zw gets us from [0, 1] to [0, viewport_size], which is needed for this to get the correct mip levels
            let sample_mip_level =round(clamp(log2(length(sample * textureSize)) - 3.3, 0.0,4.0)); // https://github.com/GameTechDev/XeGTAO#memory-bandwidth-bottleneck
            var mis = 1.0;
            if(sample_mip_level ==0.0){
            mis = 1.0;
            }
            else if(sample_mip_level ==1.0){
            mis=0.5;
            }
            else if(sample_mip_level ==2.0){
            mis=0.25;
            }
            else if(sample_mip_level ==3.0){
            mis=0.125;
            }
            else if(sample_mip_level ==4.0){
            mis=0.125*0.5;
            }
            let sample_position_1 = load_and_reconstruct_view_space_position((uv+ sample)*mis, uv+ sample, sample_mip_level);
            let sample_position_2 = load_and_reconstruct_view_space_position((uv - sample)*mis,uv - sample, sample_mip_level);

            let sample_difference_1 = sample_position_1 - pixel_position;
            let sample_difference_2 = sample_position_2 - pixel_position;
            let sample_distance_1 = length(sample_difference_1);
            let sample_distance_2 = length(sample_difference_2);
            var sample_cos_horizon_1 = dot(sample_difference_1 / sample_distance_1, view_vec);
            var sample_cos_horizon_2 = dot(sample_difference_2 / sample_distance_2, view_vec);

            let weight_1 = saturate(sample_distance_1 * falloff_mul + falloff_add);
            let weight_2 = saturate(sample_distance_2 * falloff_mul + falloff_add);
            sample_cos_horizon_1 = mix(min_cos_horizon_1, sample_cos_horizon_1, weight_1);
            sample_cos_horizon_2 = mix(min_cos_horizon_2, sample_cos_horizon_2, weight_2);

            cos_horizon_1 = max(cos_horizon_1, sample_cos_horizon_1);
            cos_horizon_2 = max(cos_horizon_2, sample_cos_horizon_2);
        }

        let horizon_1 = fast_acos(cos_horizon_1);
        let horizon_2 = -fast_acos(cos_horizon_2);
        let v1 = (cos_norm + 2.0 * horizon_1 * sin(n) - cos(2.0 * horizon_1 - n)) / 4.0;
        let v2 = (cos_norm + 2.0 * horizon_2 * sin(n) - cos(2.0 * horizon_2 - n)) / 4.0;
        visibility += projected_normal_length * (v1 + v2);
    }
    visibility /= slice_count;
    visibility = clamp(visibility, 0.03, 1.0);
 // visibility = textureSampleLevel(preprocessed_depth, point_clamp_sampler, uv*0.5, 1).r;
    output.ao = vec4(visibility*visibility,0,0,0);
    
    
    
    output.depthDif = vec4<u32>(r.b,0,0,0);
    return output;
}
///////////////////////////////////////////////////////////
        `
    }

}
