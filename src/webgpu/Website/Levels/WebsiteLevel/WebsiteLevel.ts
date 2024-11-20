import {BaseLevel} from "../BaseLevel.ts";
import LoadHandler from "../../../data/LoadHandler.ts";
import SceneHandler from "../../../data/SceneHandler.ts";
import {Vector3} from "@math.gl/core";
import UI from "../../../lib/UI/UI.ts";
import WebsiteShow from "./WebsiteShow.ts";
import MouseInteractionWrapper from "../../MouseInteractionWrapper.ts";
import SceneObject3D from "../../../data/SceneObject3D.ts";

import gsap from "gsap";
import LevelHandler from "../LevelHandler.ts";

;


export class WebsiteLevel extends BaseLevel {


    private websiteShow = new WebsiteShow()

    init() {
        super.init();
        LoadHandler.onComplete = this.configScene.bind(this)
        LoadHandler.startLoading()


        SceneHandler.setScene("1f78eea8-a005-4204").then(() => {

            LoadHandler.stopLoading()
        })

    }

    configScene() {

        LoadHandler.onComplete = () => {
        }
        //leftMargin
        this.levelObjects.gameRenderer.setModels(SceneHandler.allModels)
        this.setMouseHitObjects(SceneHandler.mouseHitModels);


        this.setMouseHitObjects(SceneHandler.mouseHitModels);


        this.levelObjects.gameCamera.setLockedView(new Vector3(0, 0, 0), new Vector3(0, 0, 1))

        this.levelObjects.gameRenderer.setLevelType("website")

        window.scrollTo(0, 0);
        document.body.style.overflow = "visible"


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
            let meat1Button = this.mouseInteractionMap.get("meat1") as MouseInteractionWrapper

            meat1Button.onRollOver = () => {

                this.bounce("meat1")
            }
            let star1Button = this.mouseInteractionMap.get("star1") as MouseInteractionWrapper

            star1Button.onRollOver = () => {

                this.bounce("star1")
            }
        });
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
        super.destroy();
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        this.websiteShow.destroy()
    }

    onUI() {
        if (UI.LButton("test")) this.websiteShow.show()
    }

    update() {
        super.update();
        let t = document.body.getBoundingClientRect().top
        let p = -Math.abs(t / 2000)
        this.levelObjects.gameCamera.setLockedView(new Vector3(0, p, 0), new Vector3(0, p, 1));

        // this.websiteSphere.update(this.sphereBlend)
    }


}
