import {getSizeForShaderType, ShaderType} from "./ShaderTypes";

import Texture from "../textures/Texture.ts";
import ObjectGPU from "../ObjectGPU.ts";
import {
    AddressMode,
    FilterMode,
    SamplerBindingType,
    TextureDimension,
    TextureFormat,
    TextureSampleType,
    TextureViewDimension
} from "../WebGPUConstants.ts";
import Renderer from "../Renderer.ts";

type Uniform = {
    isSet: boolean,
    name: string,
    size: number,
    data: Array<number> | number | Float32Array,
    offset: number,
    usage: GPUShaderStageFlags,
    dirty: boolean
}


export type TextureUniformOptions = {
    usage: GPUShaderStageFlags,
    sampleType: GPUTextureSampleType,
    dimension: GPUTextureViewDimension,

}
export const TextureUniformOptionsDefault: TextureUniformOptions = {
    usage: GPUShaderStage.FRAGMENT,
    sampleType: TextureSampleType.Float,
    dimension: TextureDimension.TwoD,

}


type TextureUniform = {
    name: string,
    texture: Texture;
    usage: GPUShaderStageFlags,
    sampleType: GPUTextureSampleType
    dimension: GPUTextureViewDimension,
}
type StorageTextureUniform = {

    name: string,
    texture: Texture;
    usage: GPUShaderStageFlags,
    access: GPUStorageTextureAccess,
    dimension: GPUTextureViewDimension,
    baseMipLevel: number,
    format: GPUTextureFormat,
}
type SamplerUniform = {
    name: string,
    sampler: GPUSampler;
    usage: GPUShaderStageFlags,
    compare: boolean

}
type ExternalTexture = {
    name: string,
    videoFrame:  VideoFrame | null,
    timestamp:number;
}

export default class UniformGroup extends ObjectGPU {
    // public static instance: UniformGroup
    public bindGroupLayout!: GPUBindGroupLayout;
    public bindGroup!: GPUBindGroup;
    public isBindGroupDirty: boolean = true;
    public uniforms: Array<Uniform> = [];
    public textureUniforms: Array<TextureUniform> = [];
    public storageTextureUniforms: Array<StorageTextureUniform> = [];
    public samplerUniforms: Array<SamplerUniform> = [];
    public buffer!: GPUBuffer;
    public visibility: GPUShaderStageFlags = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;
    private isBufferDirty: boolean = true;
    private bufferData!: Float32Array;
    private readonly nameInShader: string;
    private readonly typeInShader: string;

    private hasUniformBuffer: boolean = true;
    private markDelete: boolean = false;
    private autoUpdate: boolean = true
    private externalTextures: Array<ExternalTexture> = [];

    constructor(renderer: Renderer, nameInShader: string, autoUpdate = true) {
        super(renderer, nameInShader);
        this.nameInShader = nameInShader;
        this.typeInShader = this.nameInShader.charAt(0).toUpperCase() + this.nameInShader.slice(1);
        this.autoUpdate = autoUpdate;
        if (autoUpdate) this.renderer.addUniformGroup(this);

    }

    addUniform(name: string, value: Array<number> | number | Float32Array, usage: GPUShaderStageFlags = GPUShaderStage.FRAGMENT, format = ShaderType.auto, arraySize = 1) {
        const found = this.uniforms.find((element) => element.name == name);
        if (found) {
            console.log("uniform already exist " + this.label + " " + name)
            return;
        }
        let size = 0;
        if (format == ShaderType.auto) {

            if (typeof value == "number") {
                size = 1;

            } else {
                size = value.length;
            }
        } else {
            size = getSizeForShaderType(format, arraySize)
        }
        let u = {
            name: name,
            data: value,
            size: size,
            offset: 0,
            usage: usage,
            dirty: true,
            isSet: false,
        }

        this.uniforms.push(u);
    }

    addStorageTexture(name: string, value: Texture, format: GPUTextureFormat = TextureFormat.RGBA8Unorm, baseMipLevel = 0) {
        this.storageTextureUniforms.push({

            name: name,
            texture: value,
            usage: GPUShaderStage.COMPUTE,
            access: "write-only",
            dimension: TextureDimension.TwoD,
            format: format,
            baseMipLevel: baseMipLevel
        })
    }

    addExternalTexture(name: string) {

        this.externalTextures.push({
            name: name,
            videoFrame: null,
            timestamp:0
        });

    }

    addTexture(name: string, value: Texture, options: Partial<TextureUniformOptions> = {}) {

        let opt: TextureUniformOptions = {...TextureUniformOptionsDefault, ...options};
        this.textureUniforms.push({
            name: name,
            sampleType: opt.sampleType,
            texture: value,
            usage: opt.usage,
            dimension: opt.dimension

        })

    }

    addSamplerComparison(name: string) {
        let sampler = this.renderer.device.createSampler({compare: 'less',})
        this.samplerUniforms.push({name: name, sampler: sampler, usage: GPUShaderStage.FRAGMENT, compare: true})

    }

    addSampler(name: string, usage = GPUShaderStage.FRAGMENT, filter: GPUFilterMode = FilterMode.Linear, addressMode = AddressMode.ClampToEdge, maxAnisotropy: number = 1) {
        let sampler = this.renderer.device.createSampler({
            magFilter: filter,
            minFilter: filter,
            mipmapFilter: filter,
            addressModeU: addressMode,
            addressModeV: addressMode,
            maxAnisotropy: maxAnisotropy
        })
        this.samplerUniforms.push({name: name, sampler: sampler, usage: usage, compare: false})


        //let sampler =this.renderer.device.createSampler({magFilter:"linear",minFilter:"linear" })
        //this.samplerUniforms.push({name:name,sampler:sampler,usage:GPUShaderStage.FRAGMENT})
    }

    setUniform(name: string, value: Float32Array | Array<number> | number) {
        const found = this.uniforms.find((element) => element.name == name);

        if (found) {


            found.data = value;
            this.isBufferDirty = true;

            if (this.bufferData) {

                if (found.size == 1) {
                    this.bufferData[found.offset] = found.data as number;
                } else {
                    this.bufferData.set(found.data as ArrayLike<number>, found.offset)

                }
                found.isSet = true;
            }

        } else {
            console.log("uniform not found", name, value, this.label)
        }

    }

    setTexture(name: string, value: Texture) {

        const found = this.textureUniforms.find((element) => element.name == name);

        if (found) {
            found.texture = value;
            this.isBindGroupDirty = true;
        } else {
            console.log("uniform texture not found", name, value, this.label)
        }

    }

    setVideoFrameTexture(name: string, videoFrame:  VideoFrame) {
        const found = this.externalTextures.find((element) => element.name == name);
        if(found){

            // if(video.timestamp !=found.timestamp){
            found.videoFrame =videoFrame;
           found.timestamp =videoFrame.timestamp;

            //}
            this.isBindGroupDirty = true;

        }else {
            console.log("uniform externalTexture not found", name, this.label)
        }
    }

    update() {

        this.updateData();

        for (let t of this.textureUniforms) {
            if (!t.texture) {
                console.log("texture not found:", t.name, "in", this.label)
            }
            if (t.texture.isDirty) this.isBindGroupDirty = true;
        }
        if(this.externalTextures.length) this.isBindGroupDirty = true;

        if (this.bindGroup) {
            if (this.isBindGroupDirty) {
                this.updateBindGroup();
                this.isBindGroupDirty = false;
            }


        }
        if (!this.bindGroup) {
            this.makeBuffer();
            this.makeBindGroupLayout()
            this.updateBindGroup()


        } else if (this.buffer) {

            if (this.isBufferDirty) {

                this.updateBuffer();
            }


        }
        // this.updateBindGroup()
        this.isBufferDirty = false;
        this.isBindGroupDirty = false;

    }

    updateBuffer() {

        this.device.queue.writeBuffer(
            this.buffer,
            0,
            this.bufferData.buffer,
            this.bufferData.byteOffset,
            this.bufferData.byteLength
        );

    }

    getShaderText(id: number) {


        let bindingCount = 0

        let a = ""

        if (this.hasUniformBuffer) {
            bindingCount++;
            a +=  /* wgsl */ `      
struct ${this.typeInShader}
{
${this.getUniformStruct()}
}
@group(${id}) @binding(0)  var<uniform> ${this.nameInShader} : ${this.typeInShader} ;
`;
        }

        let textureText = ""
        if (this.textureUniforms.length) {
            for (let s of this.textureUniforms) {
                let textureType = ""
                if (s.dimension == TextureViewDimension.Cube) {
                    if (s.sampleType == "depth") {
                        textureType = "texture_depth_cube"
                    } else {
                        textureType = "texture_cube<f32>"
                    }


                } else if (s.dimension == TextureViewDimension.TwoD) {
                    if (s.sampleType == "depth") {
                        textureType = "texture_depth_2d"
                    } else if (s.sampleType == "uint") {
                        textureType = "texture_2d<u32>"
                    } else {

                        textureType = "texture_2d<f32>"
                    }
                } else {
                    console.log("implement correct texture type");
                    //  texture_2d<f32>
                    // texture_3d<f32>
                    //texture_cube<f32>
                    //texture_depth_cube
                    //texture_1d<f32>
                    //texture_depth_2d
                    // texture_external
                }

                textureText += `@group(${id}) @binding(${bindingCount})  var ` + s.name + `:` + textureType + `;` + "\n";
                bindingCount++;
            }
        }
        if (this.externalTextures.length) {
            for (let s of this.externalTextures) {

                textureText += `@group(${id}) @binding(${bindingCount})  var ` + s.name + `:texture_external;` + "\n";
                bindingCount++;
            }

        }
        if (this.samplerUniforms.length) {
            for (let s of this.samplerUniforms) {

                if (s.compare) {
                    textureText += `@group(${id}) @binding(${bindingCount})  var ` + s.name + `:sampler_comparison;` + "\n";
                } else {
                    textureText += `@group(${id}) @binding(${bindingCount})  var ` + s.name + `:sampler;` + "\n";
                }

                bindingCount++
            }

        }
        a += textureText


        return a;
    }

    makeBindGroupLayout() {

        let bindingCount = 0;
        let entriesLayout: Array<GPUBindGroupLayoutEntry> = []
        if (this.hasUniformBuffer) {
            entriesLayout.push({
                binding: bindingCount,
                visibility: this.visibility,
                buffer: {},
            })
            bindingCount++;
        }
        for (let t of this.textureUniforms) {
            entriesLayout.push({
                binding: bindingCount,
                visibility: t.usage,
                texture: {
                    sampleType: t.sampleType,
                    viewDimension: t.dimension,
                    multisampled: false,

                },
            })
            bindingCount++;
        }
        for (let t of this.externalTextures) {
            entriesLayout.push({
                binding: bindingCount,
                visibility: GPUShaderStage.FRAGMENT,
                externalTexture: {}
            })
            bindingCount++;
        }
        for (let t of this.storageTextureUniforms) {
            entriesLayout.push({
                binding: bindingCount,
                visibility: t.usage,
                storageTexture: {
                    access: t.access,
                    format: t.format,
                    viewDimension: t.dimension,


                },
            })
            bindingCount++;
        }
        for (let t of this.samplerUniforms) {
            let s: GPUSamplerBindingLayout = {type: SamplerBindingType.Filtering}
            if (t.compare) {
                s = {type: SamplerBindingType.Comparison}
            }
            entriesLayout.push({
                binding: bindingCount,
                visibility: t.usage,
                sampler: s,
            })
            bindingCount++;
        }
        let bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor = {
            label: "BindGroupLayout_" + this.label,
            entries: entriesLayout,

        }

        this.bindGroupLayout = this.device.createBindGroupLayout(bindGroupLayoutDescriptor);


    }

    destroy() {
        if (this.hasUniformBuffer) {
            this.buffer.destroy();
        }
        this.markDelete = true;
        if (this.autoUpdate) {
            this.renderer.removeUniformGroup(this);

        }
    }

    protected updateData() {

    }

    private makeBuffer() {
        let dataSize = 0;
        if (this.uniforms.length == 0) {
            this.hasUniformBuffer = false;
            return
        }
        for (let u of this.uniforms) {

            u.offset = dataSize;

            dataSize += u.size;

        }

        dataSize = Math.ceil(dataSize / 16) * 16

        this.bufferData = new Float32Array(dataSize);
        for (let u of this.uniforms) {
            if (u.size == 1) {
                this.bufferData[u.offset] = u.data as number;
            } else {
                this.bufferData.set(u.data as ArrayLike<number>, u.offset);

            }
        }


        this.buffer = this.device.createBuffer({
            size: this.bufferData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.buffer.label = "uniformBuffer_" + this.label;


        this.device.queue.writeBuffer(
            this.buffer,
            0,
            this.bufferData.buffer,
            this.bufferData.byteOffset,
            this.bufferData.byteLength
        );

    }

    private updateBindGroup() {

        let entries: Array<GPUBindGroupEntry> = []
        let bindingCount = 0;
        if (this.hasUniformBuffer) {
            entries.push(
                {
                    binding: bindingCount,
                    resource: {
                        buffer: this.buffer,
                    },
                }
            )
            bindingCount++;
        }
        for (let t of this.textureUniforms) {
            entries.push(
                {
                    binding: bindingCount,
                    resource: t.texture.textureGPU.createView({dimension: t.dimension}),

                }
            )

            bindingCount++;
        }
        for (let t of this.externalTextures) {
            entries.push(
                {
                    binding: bindingCount,
                    resource: this.device.importExternalTexture({
                        source: t.videoFrame as VideoFrame,
                    }),

                }
            )

            bindingCount++;
        }
        for (let t of this.storageTextureUniforms) {
            entries.push(
                {
                    binding: bindingCount,
                    resource: t.texture.textureGPU.createView({
                        dimension: t.dimension,
                        mipLevelCount: 1,
                        baseMipLevel: t.baseMipLevel
                    }),

                }
            )

            bindingCount++;
        }
        for (let t of this.samplerUniforms) {
            entries.push(
                {
                    binding: bindingCount,
                    resource: t.sampler,

                }
            )
            bindingCount++;
        }


        this.bindGroup = this.device.createBindGroup({
            label: "BindGroup_" + this.label,
            layout: this.bindGroupLayout,
            entries: entries,
        });

    }

    private getUniformStruct() {
        let uniformText = "";
        for (let uniform of this.uniforms) {
            uniformText += "   " + uniform.name + " : ";
            if (uniform.size == 1) uniformText += "f32,";
            else if (uniform.size == 2) uniformText += "vec2 <f32>,"
            else if (uniform.size == 3) uniformText += "vec3 <f32>,"
            else if (uniform.size == 4) uniformText += "vec4 <f32>,"
            else if (uniform.size == 9) uniformText += "mat3x3 <f32>,"
            else if (uniform.size == 16) uniformText += "mat4x4 <f32>,";
            uniformText += "\n";
        }
        return uniformText
    }
}
