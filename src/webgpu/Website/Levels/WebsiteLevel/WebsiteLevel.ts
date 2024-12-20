import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../../lib/UI/UI.ts";
import WebsiteShow from "./WebsiteShow.ts";
import MouseInteractionWrapper from "../../MouseInteractionWrapper.ts";
import SceneObject3D from "../../../data/SceneObject3D.ts";

import gsap from "gsap";
import LevelHandler from "../LevelHandler.ts";
import GameModel from "../../GameModel.ts";
import VideoPlayer from "../../../lib/video/VideoPlayer.ts";
import Model from "../../../lib/model/Model.ts";
import GBufferMaterial from "../../../render/GBuffer/GBufferMaterial.ts";
import Plane from "../../../lib/mesh/geometry/Plane.ts";
import Box from "../../../lib/mesh/geometry/Box.ts";



export class WebsiteLevel extends BaseLevel {


    private websiteShow = new WebsiteShow()
    private video1!: VideoPlayer;
constructor() {

    super();
    this.video1 =new VideoPlayer(GameModel.renderer,"video/test.mp4",new Vector2(1920,1080))

}
    init() {
        super.init();
        LoadHandler.onComplete = this.configScene.bind(this)
        LoadHandler.startLoading()
        LoadHandler.startLoading()

        SceneHandler.setScene("1f78eea8-a005-4204").then(() => {
            SceneHandler.addScene("1234").then(() => {
                LoadHandler.stopLoading()
            });
            LoadHandler.stopLoading()
        })

    }

    configScene() {

        LoadHandler.onComplete = () => {
        }

        //leftMargin
        GameModel.gameRenderer.setModels(SceneHandler.allModels)
        this.setMouseHitObjects(SceneHandler.mouseHitModels);


        this.setMouseHitObjects(SceneHandler.mouseHitModels);


        GameModel.gameCamera.setLockedView(new Vector3(0, 0, 0), new Vector3(0, 0, 1))

        GameModel.gameRenderer.setLevelType("website")

        window.scrollTo(0, 0);
        document.body.style.overflow = "visible"
        let char = SceneHandler.getSceneObject("charRoot")
        char.setScaler(0.7)
        char.x =0.5
        char.z =0.0
        char.ry =Math.PI
        char.y =-1.6;
        let fv =SceneHandler.getSceneObject("foodVideo")
console.log(fv.x,fv.y,fv.z)

        let m = new Model(GameModel.renderer,"video1")
        m.material =new GBufferMaterial(GameModel.renderer,"video1")
        m.material.setTexture('colorTexture',this.video1.getTexture())
        m.mesh =new Plane(GameModel.renderer,1920/1000,1080/1000)
            m.setScaler(0.3)
        m.z = 0.03
        m.rx =Math.PI/2

        fv.addChild(m)
        GameModel.gameRenderer.addModel(m)

       // fv.model?.material.setTexture("colorTexture",this.video1.getTexture())
// @ts-ignore
       // (char.children[0] as SceneObject3D ).model.material.setTexture("colorTexture",this.video1.getTexture())
        let webSiteRoot = SceneHandler.getSceneObject("rootWebsite")
        this.websiteShow.setObjects(webSiteRoot.children)

        this.websiteShow.show()
        gsap.delayedCall(2, () => {
            let backButton = this.mouseInteractionMap.get("backButton") as MouseInteractionWrapper
            backButton.onClick = () => {
                LevelHandler.setLevel("Start")
            }
            backButton.onRollOver = () => {

                this.bounce("backButton")
            }
           /* let meat1Button = this.mouseInteractionMap.get("meat1") as MouseInteractionWrapper

            meat1Button.onRollOver = () => {

                this.bounce("meat1")
            }
            let star1Button = this.mouseInteractionMap.get("star1") as MouseInteractionWrapper

            star1Button.onRollOver = () => {

                this.bounce("star1")
            }*/
        });




        this.video1.play()

    }

    public bounce(s: string) {
        let so = SceneHandler.getSceneObject(s) as SceneObject3D;
        if(so.sx!=1)return;
        let scale = 1
        let tl = gsap.timeline();
        let size = 1.1
        tl.to(so, {sx: scale * 1.2, sy: scale * 1.2, sz: scale * 1.2, ease: "back.in", duration: 0.4})
        tl.to(so, {sx: scale, sy: scale, sz: scale, ease: "elastic.out", duration: 0.6})

    }

    destroy() {
        let char = SceneHandler.getSceneObject("charRoot")
     if(char) {
         char.x = 0
         char.z = 0
         char.ry = 0
         char.y = 0
     }
        super.destroy();
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        this.websiteShow.destroy()
        this.video1.pauze()

    }

    onUI() {
        if (UI.LButton("test")) this.websiteShow.show()
    }

    update() {
        super.update();
        let t = document.body.getBoundingClientRect().top
        let p = -Math.abs(t / 1000)
        GameModel.gameCamera.setLockedView(new Vector3(0, p, 0), new Vector3(0, p, 1));

        // this.websiteSphere.update(this.sphereBlend)
    }


}
