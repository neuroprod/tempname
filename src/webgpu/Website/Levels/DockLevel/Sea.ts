import ProjectData from "../../../data/ProjectData.ts";
import Model from "../../../lib/model/Model.ts";
import Mesh from "../../../lib/mesh/Mesh.ts";
import Renderer from "../../../lib/Renderer.ts";
import {Matrix4, Vector3} from "@math.gl/core";
import Texture from "../../../lib/textures/Texture.ts";
import Timer from "../../../lib/Timer.ts";
import GBufferWaveMaterial from "../../../render/GBuffer/GBufferWaveMaterial.ts";

class WaveParticle {
    position: Vector3 = new Vector3();
    positionDraw: Vector3 = new Vector3();
    public dir = 1
    public timeOffset = Math.random()
    private scale: number = 2
    private m: Matrix4 = new Matrix4()
    color: number=0;

    constructor() {


    }

    getMatrix() {
        this.m.identity()
        this.m.translate(this.positionDraw)

        this.m.scale([this.scale,this.scale,4])
        return this.m;
    }

    update(time: number) {
        this.positionDraw.from(this.position)
        this.positionDraw.x += (Math.sin(time + this.timeOffset) * this.dir) * 0.5
    }
}

export default class Sea {
    seaModel!: Model;

    private waves: Array<WaveParticle> = []

    constructor(renderer: Renderer) {
        let charProj = ProjectData.projectsNameMap.get("ship")
        if (charProj) {

            //   charProj.getProjectMeshByName("cloudParticles")
            this.seaModel = new Model(renderer, "wavesModel")

            this.seaModel.mesh = charProj.getProjectMeshByName("waves")?.getMesh() as Mesh

            this.seaModel.material = new GBufferWaveMaterial(renderer, "waveMaterial")
            this.seaModel.material.setTexture("colorTexture", charProj.baseTexture as Texture)
            this.seaModel.needCulling = false;
            this.seaModel.visible = true;


        }
        for (let y = 0; y < 20; y++) {
            let color =Math.random()*0.1+0.5
            for (let x = 0; x < 6; x++) {

                let waveParticle = new WaveParticle()
                if (y % 2) {
                    waveParticle.dir = -1;
                }
                waveParticle.color = color;
                waveParticle.position.x = (x * 1.9) - 2 + (y % 2) / 2
                waveParticle.position.z = -y / 4 + 2
                waveParticle.position.y = -0.15
                this.waves.push(waveParticle)
            }
        }


    }

    update() {
        this.seaModel.numInstances = this.waves.length;
        let matrices0: Array<number> = [];
        let matrices1: Array<number> = [];
        let matrices2: Array<number> = [];
        let matrices3: Array<number> = [];
        let colors: Array<number> = [];
        let t = Timer.time / 10;
        for (let p of this.waves) {
            p.update(t)
            let m = p.getMatrix();
            matrices0 = matrices0.concat(m.getColumn(0));
            matrices1 = matrices1.concat(m.getColumn(1));
            matrices2 = matrices2.concat(m.getColumn(2));
            matrices3 = matrices3.concat(m.getColumn(3));
            colors = colors.concat(p.color,0,0,0);
        }

        this.seaModel.createBuffer(new Float32Array(colors), "colors");
        this.seaModel.createBuffer(new Float32Array(matrices0), "instancesMatrix0");
        this.seaModel.createBuffer(new Float32Array(matrices1), "instancesMatrix1");
        this.seaModel.createBuffer(new Float32Array(matrices2), "instancesMatrix2");
        this.seaModel.createBuffer(new Float32Array(matrices3), "instancesMatrix3");

    }
}
