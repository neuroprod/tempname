import Renderer from "../Renderer";
import {IndexFormat} from "../WebGPUConstants";


import {Vector3} from "@math.gl/core";
import ObjectGPU from "../ObjectGPU.ts";
import {NumericArray} from "@math.gl/types";

export default class Mesh extends ObjectGPU {

    public numVertices!: GPUSize32;

    public indexBuffer!: GPUBuffer;
    public numIndices!: GPUSize32;

    public hasIndices: boolean = false;
    indexFormat!: GPUIndexFormat;
    min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    max = new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    center = new Vector3();
    radius = Number.MAX_VALUE;
    public positions!: Float32Array;
    public indices!: Uint16Array | Uint32Array;


    private buffers: Array<GPUBuffer> = [];
    private bufferMap: Map<string, GPUBuffer> = new Map<string, GPUBuffer>();
    private destroyed: boolean = false;

    constructor(renderer: Renderer, label = "") {
        super(renderer, label);


    }

    setAttribute(name: string, data: Float32Array) {
        this.createBuffer(data, name);
    }

    setPositions(positions: Float32Array) {

        this.min.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE)
        this.max.set(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE)

        this.numVertices = positions.length;

        for (let i = 0; i < this.numVertices; i += 3) {
            let s = positions.subarray(i, i + 3);
            this.min.min(s as NumericArray)
            this.max.max(s as NumericArray)
        }
        this.center.copy(this.min as NumericArray);
        this.center.add(this.max as NumericArray);
        this.center.scale(0.5);

            this.radius = this.center.distance(this.max as NumericArray);

        this.positions = positions;
        this.createBuffer(positions, "aPos");
    }

    setNormals(normals: Float32Array) {
        this.createBuffer(normals, "aNormal");
    }

    setTangents(tangents: Float32Array) {
        this.createBuffer(tangents, "aTangent");
    }

    setColor0(colors: Float32Array) {
        this.createBuffer(colors, "aColor");
    }

    setUV0(uv0: Float32Array) {
        this.createBuffer(uv0, "aUV0");
    }

    setWeights(weights: Float32Array) {
        this.createBuffer(weights, "aWeights");
    }

    setJoints(data: Uint32Array) {
        this.createBufferI(data, "aJoints");
    }

    createBufferI(data: Uint32Array, name: string) {

        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,

        });
        const dst = new Uint32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "vertexBuffer_" + this.label + "_" + name;

        this.buffers.push(buffer);
        this.bufferMap.set(name, buffer);
    }



    createBuffer(data: Float32Array, name: string) {
        let bufferOld = this.getBufferByName(name);
        if (bufferOld) {
            let i = this.buffers.indexOf(bufferOld)
            this.buffers.splice(i, 1);
            bufferOld.destroy()
        }

        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "vertexBuffer_" + this.label + "_" + name;

        this.buffers.push(buffer);
        this.bufferMap.set(name, buffer);
    }

    setIndices(indices: Uint16Array) {
        if(this.indexBuffer){
            this.indexBuffer.destroy();
        }
        this.indices = indices;
        this.indexFormat = IndexFormat.Uint16
        this.hasIndices = true;
        this.numIndices = indices.length;

        let byteLength = Math.ceil(indices.byteLength / 4) * 4;

        this.indexBuffer = this.device.createBuffer({
            size: byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        });

        const dst = new Uint16Array(this.indexBuffer.getMappedRange());
        dst.set(indices);

        this.indexBuffer.unmap();
        this.indexBuffer.label = "indexBuffer_" + this.label;
    }

    setIndices32(indices: Uint32Array) {
        if(this.indexBuffer){
            this.indexBuffer.destroy();
        }

        this.indexFormat = IndexFormat.Uint32
        this.hasIndices = true;
        this.numIndices = indices.length;

        this.indexBuffer = this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        });

        const dst = new Uint32Array(this.indexBuffer.getMappedRange());
        dst.set(indices);

        this.indexBuffer.unmap();
        this.indexBuffer.label = "indexBuffer_" + this.label;
    }

    destroy() {
        if (this.indexBuffer) this.indexBuffer.destroy();
        for (let b of this.buffers) {
            b.destroy();
        }
        this.destroyed = true;
    }

    getBufferByName(name: string) {

        return this.bufferMap.get(name);
    }


}
