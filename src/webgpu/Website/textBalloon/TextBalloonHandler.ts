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
import {Vector2} from "@math.gl/core";


export default class TextBalloonHandler{
    private camera: Camera;
    private modelRenderer: ModelRenderer;
    private renderer: Renderer;
    private textModel: Model;
    private path: Path;
    private extrudeMesh: ExtrudeMesh;
    private balloonModel: Model;

    private offset=new Vector2(5,3)
    private curveOffset=new Vector2(3,2)

    private tl: Vector2 =new Vector2();
    private tlc1: Vector2=new Vector2();
    private tlc2: Vector2=new Vector2();

    private tr: Vector2=new Vector2();
    private trc1: Vector2=new Vector2();
    private trc2: Vector2=new Vector2();


    private bl: Vector2 =new Vector2();
    private blc1: Vector2=new Vector2();
    private blc2: Vector2=new Vector2();

    private br: Vector2=new Vector2();
    private brc1: Vector2=new Vector2();
    private brc2: Vector2=new Vector2();
    constructor(renderer:Renderer) {
        this.renderer = renderer;
        this.camera = new Camera(renderer)
        this.camera.near=-100;
        this.camera.far = 100;

        this.modelRenderer =new ModelRenderer(renderer,"textBalloonRenderer",this.camera)

        this.textModel = new Model(renderer,"textModel")
        this.textModel.material = new TextBalloonFontMaterial(renderer,"textBalloonFontMaterial")

       let mesh =  new TextBalloonFontMesh(renderer)
        mesh.setText("Hi Strawberry!\nWhats up?\n",SceneData.font,0.15)

        this.textModel.mesh =mesh;
        this.textModel.setScaler(1)



        let w = mesh.max.x
        let h = mesh.min.y
        this.path = new Path()

       this.tl =new Vector2( -this.offset.x,+this.offset.y)

       this.tr =new Vector2( w+this.offset.x,+this.offset.y)


        this.br =new Vector2( w+this.offset.x,h-this.offset.y)

        this.bl =new Vector2( -this.offset.x,h-this.offset.y)



        this.extrudeMesh = new ExtrudeMesh(renderer)
        this.updatePath()

        this.balloonModel = new Model(renderer,"balloonModel")
        this.balloonModel.mesh =this.extrudeMesh;
        this.balloonModel.material = new TextBalloonMaterial(renderer,"textBalloonMaterial")
        this.modelRenderer.addModel(   this.balloonModel)
        this.modelRenderer.addModel(this.textModel)
    }

    updatePath(){


        this.tlc1.copy(this.tl).add([this.curveOffset.x,this.curveOffset.y])
        this.tlc2.copy(this.tl).add([-this.curveOffset.x,-this.curveOffset.y])

        this.trc1.copy(this.tr).add([this.curveOffset.x,-this.curveOffset.y])
        this.trc2.copy(this.tr).add([-this.curveOffset.x,this.curveOffset.y])

        this.brc1.copy(this.br).add([-this.curveOffset.x,-this.curveOffset.y])
        this.brc2.copy(this.br).add([this.curveOffset.x,this.curveOffset.y])


        this.blc1.copy(this.bl).add([-this.curveOffset.x,this.curveOffset.y])
        this.blc2.copy(this.bl).add([this.curveOffset.x,-this.curveOffset.y])






        this.path.moveTo( this.tl)
        this.path.bezierCurveTo(this.tlc1,this.trc2,this.tr)
        this.path.bezierCurveTo(this.trc1,this.brc2,this.br)
        this.path.bezierCurveTo(this.brc1,this.blc2,this.bl)
        this.path.bezierCurveTo(this.blc1,this.tlc2,this.tl)

        this.extrudeMesh.setExtrusion(   this.path.getPoints(16),MeshType.PLANE)

    }
    update(){
        this.camera.setOrtho(100*this.renderer.ratio,-100*this.renderer.ratio,100,-100)

    }

    drawFinal(pass: CanvasRenderPass) {
        this.modelRenderer.draw(pass)

    }
}
