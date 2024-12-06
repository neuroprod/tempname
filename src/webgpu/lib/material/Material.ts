import ObjectGPU from "../ObjectGPU.ts";
import Renderer from "../Renderer.ts";
import RenderPass from "../RenderPass.ts";
import UniformGroup from "./UniformGroup.ts";
import Attribute from "./Attribute.ts";
import {CompareFunction, CullMode, PrimitiveTopology} from "../WebGPUConstants.ts";
import {getShaderTextForShaderType} from "./ShaderTypes.ts";
import Texture from "../textures/Texture.ts";

class VertexOutput {
    name: string;
    type: string;

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
    }

}

export default class Material extends ObjectGPU {

    pipeLine!: GPURenderPipeline;
    attributes: Array<Attribute> = [];
    vertexOutputs: Array<VertexOutput> = [];
    public depthWrite: boolean = true;
    public topology = PrimitiveTopology.TriangleList
    public cullMode: "none" | "front" | "back" = CullMode.Back;
    public depthCompare: GPUCompareFunction = CompareFunction.Less;
    public blendModes!: Array<GPUBlendState>;
    public logShader: boolean = false;
    uniformGroups: Array<UniformGroup> = [];
    private pipeLineLayout!: GPUPipelineLayout;
    private colorTargets: Array<GPUColorTargetState> = [];
    private depthStencilState!: GPUDepthStencilState;
    private needsDepth: boolean = true;
    private shader!: GPUShaderModule;
    private defaultUniformGroup!: UniformGroup;


    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        this.setup();

    }

    setUniform(name: string, value: Float32Array | Array<number> | number) {
        this.defaultUniformGroup.setUniform(name, value)

    }

    setTexture(name: string, value: Texture) {
        this.defaultUniformGroup.setTexture(name, value)
    }
    setVideoFrameTexture(name: string, value: VideoFrame) {
        this.defaultUniformGroup.setVideoFrameTexture(name, value)
    }
    makePipeLine(pass: RenderPass) {
        if (this.pipeLine) return;


        this.makeShader();


        let count = 0;
        for (let a of pass.colorAttachments) {

            let s: GPUColorTargetState = {format: a.renderTexture.options.format}
            if (this.blendModes) {
                s.blend = this.blendModes[count];
            }
            count++
            this.colorTargets.push(s);
        }

        if (pass.depthStencilAttachment) {
            this.needsDepth = true;
            this.depthStencilState = {
                depthWriteEnabled: this.depthWrite,
                depthCompare: this.depthCompare,
                format: pass.depthStencilAttachment.renderTexture.options.format,
            }
        }
        //uniforms layout
        this.makePipeLineLayout()

        this.pipeLine = this.device.createRenderPipeline(this.getPipeLineDescriptor(pass));

    }

    public getShaderUniforms() {
        let s = ""
        let count = 0

        for (let u of this.uniformGroups) {
            s += u.getShaderText(count)
            count++;
        }


        return s;
    }

    addUniformGroup(uniformGroup: UniformGroup, def: boolean = false) {
        this.uniformGroups.push(uniformGroup);
        if (def) {
            this.defaultUniformGroup = uniformGroup;
        }
    }

    public addAttribute(name: string, type: string, arrayLength = 1, stepMode: GPUVertexStepMode = "vertex") {
        let at = new Attribute(name, type, arrayLength, stepMode);
        at.slot = this.attributes.length;
        this.attributes.push(at);
    }

    public addVertexOutput(name: string, type: string) {
        this.vertexOutputs.push(new VertexOutput(name, type));
    }

    public getVertexOutputStruct() {
        let a = "struct VertexOutput\n{\n";
        let loc = 0;
        for (let o of this.vertexOutputs) {
            a += "   @location(" + loc + ") " + o.name + " : " + getShaderTextForShaderType(o.type) + ",\n"
            loc++;
        }
        a += "   @builtin(position) position : vec4f\n}";
        return a;
    }

    public getFragmentInput() {
        let a = "";
        let loc = 0;
        for (let o of this.vertexOutputs) {
            a += " @location(" + loc + ") " + o.name + " : " + getShaderTextForShaderType(o.type) + ","
            loc++;
        }

        return a;
    }

    public getShaderAttributes() {

        let a = "";
        for (let atr of this.attributes) {

            a += atr.getShaderText();
        }
        return a;
    }

    public getShader() {
        return "";
    }

    protected setup() {

    }

    protected makeShader() {

        if (this.shader) return
        if (this.logShader) {
            this.logShaderCode();

        }
        this.shader = this.device.createShaderModule({
            label: "shader_" + this.label,
            code: this.getShader(),
        });
        return this.shader

    }

    private getPipeLineDescriptor(pass: RenderPass): GPURenderPipelineDescriptor {


        let desc: GPURenderPipelineDescriptor = {
            label: "Material_pipeLine" + this.label,
            layout: this.pipeLineLayout,
            vertex: {
                module: this.shader,
                entryPoint: "mainVertex",
                buffers: this.getVertexBufferLayout(),
            },

            primitive: {
                topology: this.topology,
                cullMode: this.cullMode,
            },
            multisample: {
                count: pass.sampleCount,
            },
        };
        if (this.needsDepth) {
            desc.depthStencil = this.depthStencilState;
        }
        if (this.colorTargets.length) {
            desc.fragment = {
                module: this.shader,
                entryPoint: "mainFragment",
                targets: this.colorTargets,
            }
        }
        return desc;
    }

    private makePipeLineLayout() {
        let layouts: Array<GPUBindGroupLayout> = [];
        for (let u of this.uniformGroups) {

            layouts.push(u.bindGroupLayout)
        }

        this.pipeLineLayout = this.device.createPipelineLayout({
            label: "Material_pipelineLayout_" + this.label,
            bindGroupLayouts: layouts,
        });
    }

    private getVertexBufferLayout() {
        let bufferLayout: Array<GPUVertexBufferLayout> = [];

        for (let atr of this.attributes) {

            let vertexAtr: GPUVertexAttribute = {
                shaderLocation: atr.slot, offset: 0, format: atr.format,
            }

            bufferLayout.push({
                arrayStride: atr.size * 4,
                stepMode: atr.stepMode,
                attributes: [
                    vertexAtr,
                ],
            });
        }
        return bufferLayout;
    }

    private logShaderCode() {
        console.log("vvvv", this.label, "vvvvvvvvvvvvvvvvvvvvvvvvvvvv")
        let s = this.getShader();
        let a = s.split("\n");
        let count = 1;
        let r = ""
        for (let l of a) {
            r += count + ": " + l + "\n";
            count++;
        }
        console.log(r);
        console.log("^^^^", this.label, "^^^^^^^^^^^^^^^^^^^^^^^^")

    }
}
