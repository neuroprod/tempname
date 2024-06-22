import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {CompareFunction,  VertexStepMode} from "../../lib/WebGPUConstants.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import Blend from "../../lib/material/Blend.ts";


export default class PathPointMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addAttribute("positionData", ShaderType.vec4,1,VertexStepMode.Instance);

        this.addVertexOutput("uv0",ShaderType.vec2)

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("scale",this.renderer.inverseSizePixelRatio);
        uniforms.addTexture("colorTexture",this.renderer.getTexture("bezierPoints.png"));
        uniforms.addSampler("mySampler");
        this.depthCompare = CompareFunction.Always;
        this.depthWrite =false;
this.blendModes=[Blend.preMultAlpha()]
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
   
    var pos =camera.viewProjectionMatrix *model.modelMatrix*vec4( positionData.xy,0.0,1.0);
    
    output.position =pos+ vec4(aPos*vec3(uniforms.scale,1.0)*(positionData.w),0.0);
    output.uv0 = aUV0;
    output.uv0.x*=0.25;
    output.uv0.x+=positionData.z;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
return textureSample(colorTexture, mySampler,  uv0);

}
///////////////////////////////////////////////////////////
        `
    }


}
