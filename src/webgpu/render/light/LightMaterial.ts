import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";

import UniformGroup from "../../lib/material/UniformGroup.ts";
import {TextureSampleType} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {getWorldFromUVDepth} from "../../lib/material/shaders/DeferedChunks.ts";
import {Vector4} from "@math.gl/core";

export default class LightMaterial extends Material {
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("shadowMatrix",0,GPUShaderStage.FRAGMENT,ShaderType.mat4);
        uniforms.addUniform("shadowCameraPosition",new Vector4(0.5, 1, 0.5, 0.0));
        uniforms.addUniform("lightDir", new Vector4(0.5, 1, 0.5, 0.0));
        uniforms.addUniform("lightColor", new Vector4(1, 0.7, 0.7, 5));
        uniforms.addTexture("aoTexture",this.renderer.getTexture(Textures.GTAO_DENOISE), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("gColor",this.renderer.getTexture(Textures.GCOLOR), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("gNormal",this.renderer.getTexture(Textures.GNORMAL), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("gDepth",this.renderer.getTexture(Textures.GDEPTH), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("shadow",this.renderer.getTexture(Textures.SHADOW_DENOISE), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addSampler("mySampler");


    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
${getWorldFromUVDepth()}

const m1 = mat3x3f(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
    );
const m2 = mat3x3f(
    1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
    );
fn acestonemap( color:vec3f)->vec3f{
  
    let v = m1 * color;
    let a = v * (v + 0.0245786) - 0.000090537;
    let b = v * (0.983729 * v + 0.4329510) + 0.238081;
    let r=m2 * (a / b);
    return pow(clamp(r, vec3f(0.0), vec3f(1.0)), vec3f(1. / 2.2));
}

const PI = 3.14159265359;
fn fresnelSchlick(cosTheta:f32, F0:vec3f)-> vec3f
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
fn DistributionGGX( N:vec3f,  H:vec3f,  roughness:f32)-> f32
{
    let a      = roughness*roughness;
    let a2     = a*a;
    let NdotH  = max(dot(N, H), 0.0);
    let NdotH2 = NdotH*NdotH;

    let num   = a2;
    var denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}
fn GeometrySmith( N:vec3f,  V:vec3f,  L:vec3f, roughness:f32)-> f32
{
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    let ggx2  = GeometrySchlickGGX(NdotV, roughness);
    let ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
fn GeometrySchlickGGX(NdotV:f32,  roughness:f32)-> f32
{
    let r = (roughness + 1.0);
    let k = (r*r) / 8.0;

    let num   = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}

fn dirLight(lightDir:vec3f,lightColor:vec4f,albedo:vec3f,N:vec3f,V:vec3f,F0:vec3f,roughness:f32)->vec3f{
        let L = normalize(lightDir.xyz);
        let H = normalize(V + L);
        let NdotV = max(0.0, dot(N, V));
        let NDF = DistributionGGX(N, H, roughness);
        let G   = GeometrySmith(N, V, L, roughness);
        let F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
 
        let kS = F;
        let kD = vec3(1.0) - kS;
    
        let numerator    = NDF * G * F;
        let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        let specular     = numerator / denominator;
  
        let radiance =lightColor.xyz *lightColor.w;
    
        let NdotL = max(dot(N, L), 0.0);
        let light= (kD * albedo / PI + specular) * radiance * NdotL ;
        return light;
}



@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
     var output : VertexOutput;
    output.position =vec4( aPos,1.0);
    output.uv0 =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) -> @location(0) vec4f
{
   
      let textureSize =vec2<f32>( textureDimensions(gColor));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
      
       let depth=textureLoad(gDepth,  uvPos ,0).x; 
       let world =getWorldFromUVDepth(uv0,depth);
       
       let albedo=pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2)); 
      let ao=textureLoad(aoTexture,  uvPos ,0).x; 
    
       let roughness = 0.7;
       let metallic = 0.0;
       let N=normalize(textureLoad(gNormal,  uvPos ,0).xyz*2.0-1.0); 
       let V = normalize(camera.worldPosition.xyz - world);
       let F0 = mix(vec3(0.04), albedo, metallic);
     var color =albedo*vec3(0.6)*ao;
       

       
            let shadow=textureLoad(shadow,  uvPos ,0).x;
       color +=dirLight(normalize(uniforms.lightDir.xyz),uniforms.lightColor,albedo,N,V,F0,roughness)*shadow*ao;

    
      
     return vec4(acestonemap(color),1.0) ;
}
///////////////////////////////////////////////////////////
        `
    }



}
