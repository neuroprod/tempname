import Renderer from "../../lib/Renderer.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import Camera from "../../lib/Camera.ts";
import Model from "../../lib/model/Model.ts";
import TextBalloonFontMaterial from "./TextBalloonFontMaterial.ts";
import SceneData from "../../data/SceneData.ts";
import TextBalloonFontMesh from "./TextBalloonFontMesh.ts";
import Path from "../../lib/path/Path.ts";
import ExtrudeMesh from "../../modelMaker/ExtrudeMesh.ts";
import {MeshType} from "../../data/ProjectMesh.ts";
import TextBalloonMaterial from "./TextBalloonMaterial.ts";
import {Vector2, Vector3} from "@math.gl/core";
import SceneObject3D from "../../sceneEditor/SceneObject3D.ts";
import Object3D from "../../lib/model/Object3D.ts";
import gsap from 'gsap'
import DebugDraw from "../DebugDraw.ts";

export default class TextBalloonHandler {
    private camera: Camera;
    private modelRenderer: ModelRenderer;
    private renderer: Renderer;
    private textModel: Model;
    private path: Path;
    private extrudeMesh: ExtrudeMesh;
    private balloonModel: Model;

    private offset = new Vector2(5, 3)
    private curveOffset = new Vector2(3, 2)

    private tl: Vector2 = new Vector2();
    private tlS: Vector2 = new Vector2();
    private tlc1: Vector2 = new Vector2();
    private tlc2: Vector2 = new Vector2();

    private tr: Vector2 = new Vector2();
    private trS: Vector2 = new Vector2();
    private trc1: Vector2 = new Vector2();
    private trc2: Vector2 = new Vector2();


    private bl: Vector2 = new Vector2();
    private blS: Vector2 = new Vector2();
    private blc1: Vector2 = new Vector2();
    private blc2: Vector2 = new Vector2();

    private br: Vector2 = new Vector2();
    private brS: Vector2 = new Vector2();
    private brc1: Vector2 = new Vector2();
    private brc2: Vector2 = new Vector2();
    private showText: boolean = false;
    private textMesh: TextBalloonFontMesh;
    private newBalloon: boolean = true;
    private model!: SceneObject3D;
    private modelOffset: Vector3 = new Vector3();
    private holder: Object3D;
    private gameCamera: Camera;
    private timeLine!: gsap.core.Timeline;
    private extrudeMeshArrow: ExtrudeMesh;
    private arrowModel: Model;
    private charPos=-4;

    constructor(renderer: Renderer, gameCamera: Camera) {
        this.gameCamera = gameCamera;
        this.renderer = renderer;
        this.camera = new Camera(renderer)
        this.camera.near = -100;
        this.camera.far = 100;

        this.modelRenderer = new ModelRenderer(renderer, "textBalloonRenderer", this.camera)

        this.textModel = new Model(renderer, "textModel")
        this.textModel.material = new TextBalloonFontMaterial(renderer, "textBalloonFontMaterial")

        this.textMesh = new TextBalloonFontMesh(renderer)
        this.textMesh.setText("Hi Strawberry!\nWhats up?\n", SceneData.font, 0.15)

        this.textModel.mesh = this.textMesh;
        this.textModel.setScaler(1)


        this.path = new Path()
        let w = this.textMesh.max.x
        let h = this.textMesh.min.y
        this.tl = new Vector2(-this.offset.x, +this.offset.y)

        this.tr = new Vector2(w + this.offset.x, +this.offset.y)


        this.br = new Vector2(w + this.offset.x, h - this.offset.y)

        this.bl = new Vector2(-this.offset.x, h - this.offset.y)


        this.extrudeMesh = new ExtrudeMesh(renderer)
        this.extrudeMeshArrow = new ExtrudeMesh(renderer)


        this.balloonModel = new Model(renderer, "balloonModel")
        this.balloonModel.mesh = this.extrudeMesh;
        this.balloonModel.material = new TextBalloonMaterial(renderer, "textBalloonMaterial")


        this.arrowModel = new Model(renderer, "arrowModel")
        this.arrowModel.mesh = this.extrudeMeshArrow;
        this.arrowModel.material  =this.balloonModel.material
        this.arrowModel.y =10;
        this.modelRenderer.addModel(this.arrowModel)


        this.modelRenderer.addModel(this.balloonModel)
        this.modelRenderer.addModel(this.textModel)

        this.holder = new Object3D(renderer, "balloonHolder");
        this.holder.addChild(this.arrowModel)
        this.holder.addChild(this.balloonModel)
        this.holder.addChild(this.textModel)
        this.showText = false;
    }

    updatePath() {


        this.tlc1.copy(this.tl).add([this.curveOffset.x, this.curveOffset.y])
        this.tlc2.copy(this.tl).add([-this.curveOffset.x, -this.curveOffset.y])

        this.trc1.copy(this.tr).add([this.curveOffset.x, -this.curveOffset.y])
        this.trc2.copy(this.tr).add([-this.curveOffset.x, this.curveOffset.y])

        this.brc1.copy(this.br).add([-this.curveOffset.x, -this.curveOffset.y])
        this.brc2.copy(this.br).add([this.curveOffset.x, this.curveOffset.y])


        this.blc1.copy(this.bl).add([-this.curveOffset.x, this.curveOffset.y])
        this.blc2.copy(this.bl).add([this.curveOffset.x, -this.curveOffset.y])


        this.path.clear()

        this.path.moveTo(this.tl)
        this.path.bezierCurveTo(this.tlc1, this.trc2, this.tr)
        this.path.bezierCurveTo(this.trc1, this.brc2, this.br)
        this.path.bezierCurveTo(this.brc1, this.blc2, this.bl)
        this.path.bezierCurveTo(this.blc1, this.tlc2, this.tl)

        this.extrudeMesh.setExtrusion(this.path.getPoints(12), MeshType.PLANE)

    }

    update() {
        if (!this.showText) return;

        this.camera.setOrtho(100 * this.renderer.ratio, -100 * this.renderer.ratio, 100, -100)

        if (this.model) {

            let w = this.model.getWorldPos(this.modelOffset)
            DebugDraw.drawCircle(w, 0.01)
            w.transform(this.gameCamera.viewProjection)
            this.holder.x = w.x * 100 * this.renderer.ratio;
            this.holder.y = w.y * 100;

            this.textModel.material.setUniform("charPos",this.charPos)

        }

    }

    drawFinal(pass: CanvasRenderPass) {
        if (!this.showText) return;
        this.modelRenderer.draw(pass)

    }
    private makeArrow() {
        this.path.clear()
        if(this.modelOffset.x >0){
        this.path.moveTo(new Vector2(-2,-10))

        this.path.lineTo(new Vector2(-3,0))
        this.path.lineTo(new Vector2(3,0))
        }
        else{
            this.path.moveTo(new Vector2(2,-10))
            this.path.lineTo(new Vector2(3,0))
            this.path.lineTo(new Vector2(-3,0))
        }
        this.extrudeMeshArrow.setExtrusion(this.path.getPoints(12), MeshType.PLANE)
    }
    setText(text: string) {
        if (!this.showText) {
            this.newBalloon = true

        }
        if(this.newBalloon){
            this.makeArrow()
        }
        this.showText = true;
        this.charPos =-4
        this.textMesh.setText(text, SceneData.font, 0.15)
        let w = this.textMesh.max.x;
        let h = -this.textMesh.numLines * 7;

        let ox = -w / 2;
        let oy = -h + 15 - this.textMesh.numLines * 2;

        if(this.modelOffset.x >0){
            ox+=10
        }else{
            ox-=10
        }

        this.textModel.x = ox;
        this.textModel.y = oy;


        this.tlS.set(-this.offset.x + ox, +this.offset.y + oy);
        this.trS.set(w + this.offset.x + ox, +this.offset.y + oy);
        this.brS.set(w + this.offset.x + ox, h - this.offset.y + oy);
        this.blS.set(-this.offset.x + ox, h - this.offset.y + oy);

        if (this.newBalloon) {
            this.tl.from(this.tlS);
            this.tr.from(this.trS);
            this.bl.from(this.blS);
            this.br.from(this.brS);
            let startOff = 5;
            this.tl.add([startOff, -startOff]);
            this.tr.add([-startOff, -startOff]);
            this.bl.add([startOff, startOff]);
            this.br.add([-startOff, startOff]);

        }
        let ease = "back.out(3)";
        let time = 0.3
        this.charPos =-4;
        let tline = gsap.timeline()
        if(this.newBalloon){
            this.arrowModel.sx =this.arrowModel.sy =0;
            tline.to(this.arrowModel, {sx: 1, sy: 1, duration: 0.2, ease: "power4.out"}, 0)
            this.holder.setScaler(0);
            tline.to(this.holder, {sx: 1, sy: 1,sz:1, duration: 0.3, ease: "power4.out"}, 0)
        }

        tline.to(this.tl, {x: this.tlS.x, y: this.tlS.y, duration: time, ease: ease}, 0)
        tline.to(this.tr, {x: this.trS.x, y: this.trS.y, duration: time, ease: ease}, 0)
        tline.to(this.bl, {x: this.blS.x, y: this.blS.y, duration: time, ease: ease}, 0)
        tline.to(this.br, {
            x: this.brS.x, y: this.brS.y, duration: time, ease: ease, onUpdate: () => {
                this.updatePath()
            }
        }, 0)

        tline.to(this, {
            charPos: this.textMesh.charCount, duration: this.textMesh.charCount/50
        }, 0.2)

        this.newBalloon = false


    }

    setModel(m: SceneObject3D, offset: Array<number>) {
        if (this.model != m) this.newBalloon = true
        this.model = m
        this.modelOffset.from(offset)


    }

    hideText() {
        this.showText = false;
    }


}
