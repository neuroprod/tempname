import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import Camera from "../lib/Camera.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";

import ModelPool from "./ModelPool.ts";
import UI from "../lib/UI/UI.ts";
import Ray from "../lib/Ray.ts";
import Outline from "./outline/Outline.ts";
import EditCursor from "./editCursor/EditCursor.ts";
import EditCamera from "./EditCamera.ts";
import SceneObject3D from "./SceneObject3D.ts";
import {saveScene} from "../lib/SaveUtils.ts";
import GameRenderer from "../render/GameRenderer.ts";
import Animation from "./timeline/animation/Animation.ts";
import AnimationEditor from "./timeline/AnimationEditor.ts";
import AnimationChannel, {Key} from "./timeline/animation/AnimationChannel.ts";
import {Quaternion, Vector3} from "@math.gl/core";
import {popSplitPanel, pushSplitPanel} from "../UI/SplitPanel.ts";
import SplitNode from "../UI/SplitNode.ts";
import {DockSplit} from "../lib/UI/docking/DockType.ts";
import UI_I from "../lib/UI/UI_I.ts";
import {popMainMenu, pushMainMenu} from "../UI/MainMenu.ts";
import {addMainMenuButton} from "../UI/MainMenuButton.ts";
import {Icons} from "../UI/Icons.ts";
import {addMainMenuDivider} from "../UI/MainMenuDivider.ts";
import {addMainMenuToggleButton} from "../UI/MainMenuToggleButton.ts";


export enum ToolState {

    translate,
    rotate,
    scale,

}

export default class SceneEditor {


    public modelsByLoadID: { [id: string]: SceneObject3D } = {};
    gameRenderer: GameRenderer;
    private renderer: Renderer;
    private camera: Camera;
    private modelRenderer: ModelRenderer;
    private root: SceneObject3D
    private modelPool: ModelPool;
    private mouseListener: MouseListener;
    private ray: Ray = new Ray();
    private currentModel: SceneObject3D | null = null;
    private outline: Outline;
    private editCursor: EditCursor;
    private editCamera: EditCamera;
    private currentToolState: ToolState = ToolState.translate;
    private currentAnimation!: Animation;
    private animations: Array<Animation> = [];
    private rootSplit:SplitNode
    private nodeCenter: SplitNode;
    private nodeRight: SplitNode;
    private nodeRightTop: SplitNode;
    private nodeRightBottom: SplitNode;
    private nodeTop: SplitNode;
    private nodeBottom: SplitNode;


    constructor(renderer: Renderer, mouseListener: MouseListener, modelData: any, sceneData: any) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera = new Camera(renderer);
        this.camera.cameraWorld.set(0.5, 0.3, 2)
        this.camera.cameraLookAt.set(0, 0.2, 0)
        this.camera.near = 0.5
        this.camera.far =100
        this.camera.fovy = 0.8

        this.gameRenderer = new GameRenderer(this.renderer, this.camera)

        this.modelPool = new ModelPool(renderer, modelData);
        this.modelRenderer = new ModelRenderer(renderer, "mainModels", this.camera)

        this.outline = new Outline(renderer, this.camera)
        this.editCursor = new EditCursor(renderer, this.camera, mouseListener, this.ray)
        this.editCamera = new EditCamera(renderer, this.camera, mouseListener, this.ray)
        this.root = new SceneObject3D(this.renderer, "root")
        this.root.setCurrentModel = this.setCurrentModel.bind(this);
        this.makeScene(sceneData);
        this.setCurrentToolState(ToolState.translate)

        this.rootSplit =new SplitNode("root")

        let a = this.rootSplit.split(DockSplit.Horizontal,"top","bottom")
        this.nodeTop =a[0];
        this.nodeBottom =a[1];

      let b =  this.nodeTop.split(DockSplit.Vertical,"center","right")
        this.nodeCenter =b[0];
        this.nodeRight =b[1];

        let c =  this.nodeRight.split(DockSplit.Horizontal,"rightTop","rightLeft");
        this.nodeRightTop =c[0];
        this.nodeRightBottom =c[1];


    }

    update() {
        this.camera.ratio = this.renderer.ratio

        //setScreenRay
        this.ray.setFromCamera(this.camera, this.mouseListener.getMouseNorm())

        //checkCameraInteraction
        let cursorNeeded = false
        cursorNeeded = this.editCamera.checkMouse();
        //check edit cursor
        if (!cursorNeeded) {
            cursorNeeded = this.editCursor.checkMouse()
        }
        //check modelSelect
        if (!cursorNeeded && this.mouseListener.isDownThisFrame && !UI.needsMouse()) {
            let intersections = this.ray.intersectModels(this.gameRenderer.gBufferPass.modelRenderer.models)
            if (intersections.length) {
                let m = intersections[0].model;
                this.setCurrentModel(m.parent as SceneObject3D)

            } else {
                this.setCurrentModel(null);

            }
        }

        this.editCursor.update()
      //  AnimationEditor.update();
    }
    onUINice() {
        pushMainMenu("tools",200,134);
        if (addMainMenuButton("Save", Icons.SAVE,false)){
            this.saveAll();
        }
        addMainMenuDivider("tooldDiv1")
        if (addMainMenuButton("Add", Icons.PLUS_CUBE,false)){

        }
        if (addMainMenuButton("Remove", Icons.MIN_CUBE,false)){

        }

        addMainMenuDivider("tooldDiv2")


        if ( addMainMenuToggleButton("Move", Icons.MOVE,this.currentToolState == ToolState.translate)) this.setCurrentToolState(ToolState.translate);
        if (addMainMenuToggleButton("Rotate", Icons.ROTATE,this.currentToolState == ToolState.rotate)) this.setCurrentToolState(ToolState.rotate);
        if (addMainMenuToggleButton("Scale", Icons.SCALE,this.currentToolState == ToolState.scale)) this.setCurrentToolState(ToolState.scale);
   //     if (addMainMenuButton("Game", Icons.GAME, this.currentMainState == MainState.game)) this.setMainState(MainState.game);
     //   if (addMainMenuButton("Scene Editor", Icons.CUBE, this.currentMainState == MainState.editor)) this.setMainState(MainState.editor);
      //  if (addMainMenuButton("Model Maker",  Icons.PAINT, this.currentMainState == MainState.modelMaker)) this.setMainState(MainState.modelMaker);

        popMainMenu()

        pushSplitPanel("horizontal panel",  this.nodeBottom);
        popSplitPanel()

        pushSplitPanel("Top panel",  this.nodeRightTop);

        this.root.onUI()
        popSplitPanel()

        pushSplitPanel("bottom panel",  this.nodeRightBottom);
        if(this.currentModel) {
            this.currentModel.onDataUI()
        }
        popSplitPanel()


        //this.rootSplit.setDividers();

        let s = UI_I.pixelSize.clone()
        s.x-=20
        s.y-=20
        if (this.rootSplit.resize(s)) {
         this.rootSplit.updateLayout();
        }



    }

    public saveAll(){
        let sceneData: Array<any> = []
        this.root.getSceneData(sceneData);

        let animationData: Array<any> = []
        for (let a of this.animations) {
            a.getAnimationData(animationData);
        }
        let data: any = {}
        data.scene = sceneData;
        data.animation = animationData;
        saveScene("scene1", JSON.stringify(data)).then()
    }

    public onUI() {
       /* if (UI.LButton("Save Scene")) {

            this.saveAll();
           let sceneData: Array<any> = []
            this.root.getSceneData(sceneData);

            let animationData: Array<any> = []
            for (let a of this.animations) {
                a.getAnimationData(animationData);
            }
            let data: any = {}
            data.scene = sceneData;
            data.animation = animationData;
            saveScene("scene1", JSON.stringify(data)).then()
        }
*/

        UI.separator("Tools")


        this.editCursor.localSpace = UI.LBool("Translate local", false);
      //  if (UI.LButton("Translate", "", this.currentToolState != ToolState.translate)) this.setCurrentToolState(ToolState.translate);
        //if (UI.LButton("Rotate", "", this.currentToolState != ToolState.rotate)) this.setCurrentToolState(ToolState.rotate);
        //if (UI.LButton("Scale", "", this.currentToolState != ToolState.scale)) this.setCurrentToolState(ToolState.scale);
        UI.separator("Animation")
        if (this.currentModel) {
            if (UI.LButton("New Animation For Model")) {
                this.currentAnimation = new Animation(this.renderer, "new_animation_" + this.animations.length, this.currentModel)
                this.animations.push(this.currentAnimation)
                AnimationEditor.setAnimation(this.currentAnimation)
            }

        }
        UI.pushLList("animations", 100)
        for (let a of this.animations) {
            if (UI.LListItem(a.label, a == this.currentAnimation)) {
                this.currentAnimation = a;
                AnimationEditor.setAnimation(a);
            }
        }
        UI.popList()

    }

    public onObjectUI() {
        UI.pushWindow("scene")
        this.root.onUI()

        if (this.currentModel) {
            UI.separator(this.currentModel.label.toUpperCase(), true)
            if (UI.LButton("Delete")) {
                this.removeModel(this.currentModel)
            }

            let selectedModel = UI.LSelect("models", this.modelPool.modelSelect)
            if (UI.LButton("Add +")) {
                let m = this.modelPool.getModelByName(selectedModel);

                m.setCurrentModel = this.setCurrentModel.bind(this);
                this.currentModel.addChild(m)
                this.setCurrentModel(m);
                this.addModel(m)
            }
            if (UI.LButton("Add Empty +")) {
                let m = new SceneObject3D(this.renderer,"newEmpty");

                m.setCurrentModel = this.setCurrentModel.bind(this);
                this.currentModel.addChild(m)
                this.setCurrentModel(m);
                this.addModel(m)
            }
            this.currentModel.onDataUI()

        }


        UI.popWindow()
    }

    setCurrentModel(value: SceneObject3D | null) {
        if (value) {
            this.currentModel = value;
            this.outline.setCurrentModel(value.model)
            this.editCursor.setCurrentModel(this.currentModel);
            AnimationEditor.setCurrentModel(this.currentModel);
        } else {
            this.currentModel = null;
            this.outline.setCurrentModel(null);
            this.editCursor.setCurrentModel(null);
            AnimationEditor.setCurrentModel(null);
        }

    }

    draw() {
        this.outline.draw()
        this.editCursor.draw();
        this.gameRenderer.draw();
    }

    drawInCanvas(pass: CanvasRenderPass) {
        //  this.modelRenderer.draw(pass);
        this.gameRenderer.drawFinal(pass);
        this.outline.drawFinal(pass);
        this.editCursor.drawFinal(pass);
    }

    public removeModel(m: SceneObject3D) {
        this.setCurrentModel(null)
        for (let child of m.children) {
            let childSceneObject = child as SceneObject3D
            if (childSceneObject.isSceneObject3D) {
                this.removeModel(childSceneObject)
            } else {
                //console.log(child)
            }

        }
        if (m.model) {
            this.gameRenderer.gBufferPass.modelRenderer.removeModel(m.model)
            this.gameRenderer.shadowMapPass.modelRenderer.removeModel(m.model)

            m.removeChild(m.model)
            m.model = null
        }
        if (m.parent) m.parent.removeChild(m)

    }

    public addModel(m: SceneObject3D) {
        if (m.model) {
            this.gameRenderer.gBufferPass.modelRenderer.addModel(m.model)
            this.gameRenderer.shadowMapPass.modelRenderer.addModel(m.model)
        }
    }

    private makeScene(data: any) {

        let sceneData = data.scene;
        for (let d of sceneData) {


            if (d.label == "root") {
                this.modelsByLoadID[d.id] = this.root;
                continue;
            }

            let m = this.modelPool.getModelByName(d.model, d.label);
            m.setPosition(d.position[0], d.position[1], d.position[2])
            m.setRotation(d.rotation[0], d.rotation[1], d.rotation[2], d.rotation[3])
            this.modelsByLoadID[d.id] = m;
            this.modelsByLoadID[d.parentID].addChild(m)
            m.setCurrentModel = this.setCurrentModel.bind(this);
            if (m.model) {
                if (d.scale) {
                    m.model.setScale(d.scale[0], d.scale[1], d.scale[2])
                }
                this.addModel(m)
            }
            // if(m.model)
        }
        for (let anime of data.animation) {

            let animation = new Animation(this.renderer, anime.label, this.modelsByLoadID[anime.rootID])
            animation.frameTime = anime.frameTime;
            animation.numFrames = anime.numFrames;

            for (let channelData of anime.channels) {
                let channel = new AnimationChannel(this.modelsByLoadID[channelData.id], channelData.type)

                for (let i = 0; i < channelData.frames.length; i++) {
                    let key = new Key()
                    key.frame = channelData.frames[i]
                    let keyData =channelData.values[i]
                    if(keyData.length==3){
                        key.data =new Vector3( channelData.values[i]   )
                    } if(keyData.length==4){
                        key.data =new Quaternion( channelData.values[i]   )
                    }


                    channel.keys.push(key);
                }
                channel.lastKeyIndex = channel.keys.length-1;
                animation.channels.push(channel)

            }

            this.animations.push(animation)

        }



    }

    private setCurrentToolState(toolState: ToolState) {
        this.currentToolState = toolState;
        this.editCursor.setToolState(this.currentToolState);
    }


}
