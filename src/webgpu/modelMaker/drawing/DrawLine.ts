import {lerp, Vector2} from "@math.gl/core";
import Renderer from "../../lib/Renderer.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {NumericArray} from "@math.gl/types";
import Color from "../../lib/UI/math/Color.ts";


export default class DrawLine {

    public points: Array<Vector2> = []
    public lineSizes: Array<number> = []
    public buffer!: GPUBuffer;
    public numInstances: number = 0;

    public uniformGroup: UniformGroup;

    smoothing: number = 0.1;
    lineSize: number = 2;
    edge: number =0.5;
    isEraser =false;

    private readonly renderer: Renderer;


    constructor(renderer: Renderer, color: Color) {
        this.renderer = renderer;
        this.uniformGroup = new UniformGroup(this.renderer, "uniforms", false);

        this.uniformGroup.addUniform("color", color.getArray())
        this.uniformGroup.update();


    }

    makeSmooth() {


        let p1 = new Vector2()
        let p2 = new Vector2()
        let smoothFactor = this.smoothing / this.lineSize;
        let temp: Array<Vector2> = []
        for (let p of this.points) {
            temp.push(p.clone())
        }
        for (let s = 0; s < smoothFactor; s++) {


            for (let i = 1; i < this.points.length - 1; i++) {

                p1.from(temp[i - 1])
                p2.from(temp[i + 1])
                p1.add(p2 as NumericArray)
                p1.scale(0.5)
                p1.subtract(temp[i] as NumericArray)
                // p1.scale(0.5)

                this.points[i].add(p1 as NumericArray);
            }
            for (let i = 0; i < this.points.length; i++) {
                temp[i].from(this.points[i])
            }
        }


        this.updateData();
    }

    addPoint(p: Vector2, lineSize: number) {
        if (this.points.length > 1) {

            let lastPoint = this.points[this.points.length - 1];
            let lastLineSize = this.lineSizes[this.points.length - 1];
            let dist = p.distance(lastPoint as NumericArray);

            let numSteps = Math.floor(dist / lineSize * 6);
            if (numSteps == 0) return;


            if (numSteps < 2) {
                this.points.push(p)
                this.lineSizes.push(lineSize)
            } else {
                for (let i = 1; i < numSteps; i++) {
                    let pos = 1.0 / numSteps * i;

                    this.points.push(lerp(lastPoint, p, pos) as Vector2);
                    this.lineSizes.push(lerp(lastLineSize, lineSize, pos))
                }

            }

        } else {

            this.points.push(p)
            this.lineSizes.push(lineSize)
        }

        this.updateData();

    }

    createBuffer(data: Float32Array, name: string) {

        if (this.buffer) this.buffer.destroy();

        this.buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(this.buffer.getMappedRange());
        dst.set(data);

        this.buffer.unmap();
        this.buffer.label = name;


    }

    destroy() {
        if (this.buffer) this.buffer.destroy();
        if (this.uniformGroup) this.uniformGroup.destroy();
    }

    private updateData() {
        this.numInstances = this.points.length;
        let data = new Float32Array(this.numInstances * 4);

        let count = 0;
        let llCount = 0
        for (let p of this.points) {
            data[count++] = p.x;
            data[count++] = p.y;
            data[count++] = this.lineSizes[llCount++];
            data[count++] = this.edge;
        }
        this.createBuffer(data, "instanceBuffer")
    }


}
