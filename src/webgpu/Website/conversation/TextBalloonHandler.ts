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
    private showText: boolean =false;
    private textMesh: TextBalloonFontMesh;
    private newBalloon: boolean =true;
    private model!: SceneObject3D;
    private modelOffset: Vector3=new Vector3();
    private holder: Object3D;
    private gameCamera: Camera;
    constructor(renderer:Renderer,gameCamera:Camera) {
        this.gameCamera = gameCamera;
        this.renderer = renderer;
        this.camera = new Camera(renderer)
        this.camera.near=-100;
        this.camera.far = 100;

        this.modelRenderer =new ModelRenderer(renderer,"textBalloonRenderer",this.camera)

        this.textModel = new Model(renderer,"textModel")
        this.textModel.material = new TextBalloonFontMaterial(renderer,"textBalloonFontMaterial")

      this.textMesh =  new TextBalloonFontMesh(renderer)
        this.textMesh.setText("Hi Strawberry!\nWhats up?\n",SceneData.font,0.15)

        this.textModel.mesh =this.textMesh;
        this.textModel.setScaler(1)





        this.path = new Path()
        let w = this.textMesh.max.x
        let h = this.textMesh.min.y
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

        this.holder = new Object3D(renderer,"balloonHolder");
        this.holder.addChild(this.balloonModel)
        this.holder.addChild(this.textModel)
        this.showText =false;
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




this.path.clear()

        this.path.moveTo( this.tl)
        this.path.bezierCurveTo(this.tlc1,this.trc2,this.tr)
        this.path.bezierCurveTo(this.trc1,this.brc2,this.br)
        this.path.bezierCurveTo(this.brc1,this.blc2,this.bl)
        this.path.bezierCurveTo(this.blc1,this.tlc2,this.tl)

        this.extrudeMesh.setExtrusion(   this.path.getPoints(12),MeshType.PLANE)

    }
    update(){
        if(!this.showText)return;

        this.camera.setOrtho(100*this.renderer.ratio,-100*this.renderer.ratio,100,-100)

        if(this.model){

            let w =this.model.getWorldPos(this.modelOffset)

            w.transform(this.gameCamera.viewProjection)
            this.holder.x = w.x*100*this.renderer.ratio;
            this.holder.y = w.y*100;

        }

    }

    drawFinal(pass: CanvasRenderPass) {
        if(!this.showText)return;
        this.modelRenderer.draw(pass)

    }

    setText(text: string) {
        if(!this.showText)this.newBalloon =true
        this.showText =true;

        this.textMesh.setText(text,SceneData.font,0.15)
        let w = this.textMesh.max.x;
        let h = this.textMesh.min.y;
this.balloonModel.x = this.textModel.x  = -w/2
        this.balloonModel.y= this.textModel.y  = -h/2 -5
    this.tl.set( -this.offset.x,+this.offset.y)
        this.tr.set(w+this.offset.x,+this.offset.y)
        this.br.set( w+this.offset.x,h-this.offset.y)
        this.bl.set( -this.offset.x,h-this.offset.y)
        this.updatePath()

    }

    setModel(m: SceneObject3D, offset: Array<number>) {
        if(this.model!=m)this.newBalloon =true
        this.model = m
        this.modelOffset.from(offset)


    }

    hideText() {
        this.showText =false;
    }
}
