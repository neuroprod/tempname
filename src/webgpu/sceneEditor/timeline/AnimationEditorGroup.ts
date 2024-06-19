import SceneObject3D from "../SceneObject3D.ts";

import UI_I from "../../lib/UI/UI_I.ts";


import {AnimationType} from "./animation/Animation.ts";
import AnimationChannelEditor from "./AnimationChannelEditor.ts";
import AnimationEditor from "./AnimationEditor.ts";

import UI from "../../lib/UI/UI.ts";
import UI_IC from "../../lib/UI/UI_IC.ts";
import {ButtonBaseSettings} from "../../lib/UI/components/internal/ButtonBase.ts";

import {TreeReturn} from "../../lib/UI/components/Tree.ts";
import {HAlign} from "../../lib/UI/UI_Enums.ts";
import UIKeyFrameData, {UIKeyFrames} from "./UIKeyFrameData.ts";

export default class AnimationEditorGroup {


    public parent: AnimationEditorGroup | null = null;
    public children: Array<AnimationEditorGroup> = [];
    label: string;
    private obj: SceneObject3D | null;
    private offset: number = 0;

    private channels: Array<AnimationChannelEditor> = [];

    private buttonSettings: ButtonBaseSettings;
    private isOpen: boolean = false;
    private transOpen: boolean = false;
     keyDataMain: UIKeyFrameData;
    private keyDataTrans: UIKeyFrameData;

    constructor(label: string, obj: SceneObject3D | null = null) {
        this.label = label;
        this.obj = obj;

        this.keyDataMain = new UIKeyFrameData()
        this.keyDataTrans = new UIKeyFrameData()
        this.keyDataMain.addChild(this.keyDataTrans)
        this.addChannels();
        this.buttonSettings = new ButtonBaseSettings()
        this.buttonSettings.box.size.y = 16;
        this.buttonSettings.box.marginBottom = 2;
        this.buttonSettings.box.size.x = 100;
        this.buttonSettings.box.hAlign = HAlign.RIGHT;
        this.buttonSettings.disableColor.setHex("#394150")


    }

    drawUIKeyframes() {
        //drawThisKeyframes;
        UIKeyFrames(this.label, this.keyDataMain)
        // UI_IC.buttonBase(this.label, false, this.buttonSettings);
        if (this.isOpen) {
            if (this.channels.length) {
                //drawThisKeyframes;
                UIKeyFrames(this.label + "trans", this.keyDataTrans)
                if (this.transOpen) {

                    for (let c of this.channels) {
                        //drawChannelsKeyFrames
                        c.drawKeyData()
                    }
                }
            }
            for (let c of this.children) {
                c.drawUIKeyframes();
            }
        }
    }

    drawUITree() {
        let tr: TreeReturn = UI.pushTree(this.label, false)
        this.isOpen = tr.isOpen

        if (this.isOpen) {
            UI_I.globalStyle.compIndent += 20
            if (this.channels.length) {
                let trTrans: TreeReturn = UI.pushTree("transforms", false)
                this.transOpen = trTrans.isOpen;
                if (this.transOpen) {
                    for (let c of this.channels) {
                        UI_IC.buttonBase(c.label, false, this.buttonSettings);
                    }
                }
                UI.popTree()
            }

            UI_I.globalStyle.compIndent -= 20
            //UI_I.groupDepth-=20
            for (let c of this.children) {
                c.drawUITree();
            }

        } else {
            this.transOpen = false;
        }


        UI.popTree()


    }

    addChannels() {
        if (this.obj) {
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj, AnimationType.TRANSLATE, true) as AnimationChannelEditor
                this.keyDataTrans.addChild(channelEditor.keyData)

                this.channels.push(channelEditor)
            }
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj, AnimationType.ROTATE, true) as AnimationChannelEditor
                this.keyDataTrans.addChild(channelEditor.keyData)

                this.channels.push(channelEditor)
            }
            {
                let channelEditor = AnimationEditor.getChannelEditor(this.obj, AnimationType.SCALE, true) as AnimationChannelEditor
                this.keyDataTrans.addChild(channelEditor.keyData)

                this.channels.push(channelEditor)
            }
        }
    }

    setInitialUIKeys() {
        for (let c of this.channels) {
            c.setKeys()
        }
        for (let child of this.children) {
            child.setInitialUIKeys()

        }

    }

    destroy() {

        for (let c of this.children) {
            c.destroy()
        }

        for (let c of this.channels) {
            c.destroy()
        }
        this.children = []
        this.channels = []
        this.parent = null;
        this.obj = null;
       this.keyDataMain.destroy()
        this.keyDataTrans.destroy();
    }


    addGroup(group: AnimationEditorGroup) {
        this.children.push(group)
        this.keyDataMain.addChild(group.keyDataMain)
    }


}
