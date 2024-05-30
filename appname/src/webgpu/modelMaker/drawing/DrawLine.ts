import {lerp, Vector2, Vector4} from "@math.gl/core";
import Renderer from "../../lib/Renderer.ts";
import ColorV from "../../lib/ColorV.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";


export default class DrawLine {

    public points: Array<Vector2> = []

    public buffer!: GPUBuffer;
    private readonly renderer: Renderer;
    public numInstances: number=0;
    public color =new ColorV()
    public uniformGroup: UniformGroup;
    public drawSize =0.01
    constructor(renderer:Renderer,color:ColorV) {
        this.renderer =renderer;
        this.uniformGroup=new UniformGroup(this.renderer,"uniforms",false);

        this.uniformGroup.addUniform("color",color)
        this.uniformGroup.update();
    }

    smoothing() {

        let temp: Array<Vector2> = []
        for (let p of this.points) {
            temp.push(p.clone())
        }
        for (let i = 1; i < this.points.length - 1; i++) {

            let p1 = temp[i - 1]
            let p2 = temp[i + 1]
            p1.add(p2)
            p1.scale(0.5)
            p1.subtract(temp[i])
            // p1.scale(0.5)

            this.points[i].add(p1);
        }
    }

    addPoint(p: Vector2) {
        if (this.points.length > 1) {

            let lastPoint = this.points[this.points.length - 1];

            let dist = p.distance(lastPoint);

            let numSteps = Math.floor(dist / this.drawSize * 6);
            if (numSteps == 0) return;
            this.points.push(p)


            if (numSteps < 2) {
                this.points.push(p)
            } else {
                for (let i = 1; i < numSteps; i++) {
                    let pos = 1.0 / numSteps * i;

                    this.points.push(lerp(lastPoint, p, pos) as Vector2);

                }

            }

        } else {

            this.points.push(p)
        }

        this.updateData();

    }
    private updateData() {
        this.numInstances = this.points.length;
        let data =new Float32Array(this.numInstances*3);

        let count =0;

        for(let p of this.points) {
            data[count++] = p.x;
            data[count++] = p.y;
            data[count++] = this.drawSize;
        }
        this.createBuffer(data,"instanceBuffer")
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
        this.buffer.label =  name;


    }

    destroy(){
        if (this.buffer) this.buffer.destroy();
        if(this.uniformGroup)this.uniformGroup.destroy();
    }


}
