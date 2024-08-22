import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {Textures} from "../../data/Textures.ts";
import {CullMode} from "../../lib/WebGPUConstants.ts";
import Blend from "../../lib/material/Blend.ts";


export default class TextBalloonFontMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
       this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

       // this.addVertexOutput("normal", ShaderType.vec3 );
        this.addVertexOutput("uv", ShaderType.vec2 );
        this.addVertexOutput("alpha", ShaderType.vec2  );
        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("charPos",8.0)
        uniforms.addTexture("colorTexture",this.renderer.getTexture(Textures.MAINFONT))
        uniforms.addSampler("mySampler")
        this.cullMode =CullMode.None;
        this.depthCompare="always"
        this.depthWrite =false;

        this.blendModes =[Blend.preMultAlpha()]
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
    let s  =1.0- smoothstep(uniforms.charPos,uniforms.charPos+4.0, aNormal.z);
    var pos =  aPos;
    pos.x -=aNormal.x;
    pos.y +=aNormal.y;
    pos*=s;
     pos.x +=aNormal.x;
    pos.y -=aNormal.y;
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( pos,1.0);
   output.alpha =vec2(s,s);
    output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{

    
    
     var text= textureSample(colorTexture, mySampler,  uv);//textureLoad(fontTexture,  mySampler,0);
      let sigDist = max(min(text.r, text.g), min(max(text.r, text.g), text.b))- 0.5;

  let pxRange = 4.0;

  let dx = 512*length(vec2f(dpdxFine(uv.x), dpdyFine(uv.x)));
  let dy = 512*length(vec2f(dpdxFine(uv.y), dpdyFine(uv.y)));
  let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);

  let pxDist = sigDist * toPixels;

  let edgeWidth = 0.5;

  let a= smoothstep(-edgeWidth, edgeWidth, pxDist)*alpha.x;
   
  


    return vec4(a);
}
///////////////////////////////////////////////////////////
        `
    }


}
