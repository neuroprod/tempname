import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";

import UniformGroup from "../../lib/material/UniformGroup.ts";
import {TextureSampleType} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {getWorldFromUVDepth} from "../../lib/material/shaders/DeferedChunks.ts";
import {Vector2, Vector4} from "@math.gl/core";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";

export default class PCSSShadowMaterial extends Material {
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("shadowViewMatrix",0,GPUShaderStage.FRAGMENT,ShaderType.mat4);
        uniforms.addUniform("shadowViewProjectionMatrix",0,GPUShaderStage.FRAGMENT,ShaderType.mat4);
        uniforms.addTexture("gDepth",this.renderer.getTexture(Textures.GDEPTH), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("shadowMap",this.renderer.getTexture(Textures.SHADOW_DEPTH), {sampleType:TextureSampleType.Float})
        uniforms.addSampler("mySampler");
        uniforms.addTexture("noise", DefaultTextures.getMagicNoise(this.renderer));

    }
    getKernel() {
        let numSamples = 64;
        let s = "const kernel = array<vec2f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {

            let angle = Math.random()*Math.PI*2;
            let r  =1-Math.random()*Math.random();
            let x = Math.sin(angle)*r
            let y = Math.cos(angle)*r


            s += "vec2(" + x + ", " + y + "),";
        }
        s += " );";
        return s;
    }
    getKernel2() {
        let numSamples = 64;
        let s = "const kernel2 = array<vec2f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {

            let angle = Math.random()*Math.PI*2;
            let r  =1-Math.random()*Math.random();
            let x = Math.sin(angle)*r
            let y = Math.cos(angle)*r

            s += "vec2(" + x + ", " + y + "),";
        }
        s += " );";
        return s;
    }


    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
${getWorldFromUVDepth()}
${this.getKernel()}
${this.getKernel2()}


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
   
      let textureSize =vec2<f32>( textureDimensions(gDepth));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
      
       let depthT=textureLoad(gDepth,  uvPos ,0).x; 
       let world =getWorldFromUVDepth(uv0,depthT);
       
      
       var shadowPos = uniforms.shadowViewMatrix* vec4(world,1.0); //viewspace shadow
      let depth =shadowPos.z; 
       var shadowPosProj = uniforms.shadowViewProjectionMatrix* vec4(world,1.0);

       shadowPosProj = shadowPosProj/shadowPosProj.w;
       shadowPosProj.x = shadowPosProj.x*0.5 +0.5;
       shadowPosProj.y =1.0-( shadowPosProj.y*0.5 +0.5);
       
       
       var angle= textureLoad(noise, uvPos % 3, 0).r*3.1415*2.0;
       let  s = sin(angle);
       let  c = cos(angle);
       let rotMat   = mat2x2<f32> (c, s, -s, c);
      
      
       var  avgBlocker =0.0;
       var  blocker =0.0;
       for(var i=0;i<8;i++)
      {
      
        var offset = rotMat *kernel2[i];
        offset*=0.01;
        let  shadowDepth = textureSample(shadowMap, mySampler,   shadowPosProj.xy+offset).x;
   
        if(depth-shadowDepth+0.02<0.0) {
            avgBlocker += shadowDepth;
            blocker+=1.0;  
           
        }  
      
      
      }
      
      
      var size =0.0;
      if(blocker>0.0){
      avgBlocker =avgBlocker/blocker;
      size  =(avgBlocker-depth);

      }else 
      {
       avgBlocker =0.0;
      }

      size =size *0.01+0.001;
      var  shadow = 0.0;
      for(var i=0;i<8;i++)
      {
      
        var offset = rotMat *kernel[i];
        offset*=size;
        let  shadowDepth = textureSample(shadowMap, mySampler,   shadowPosProj.xy+offset).x;
   
        if(depth-shadowDepth+0.015>0) {shadow +=1.0;}  
      
      
      }
      shadow/=8.0;
      
      
    
     return vec4(  shadow ,0.0,0.0,0.0) ;

}
///////////////////////////////////////////////////////////
        `
    }



}
