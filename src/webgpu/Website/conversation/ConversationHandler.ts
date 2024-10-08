import TextBalloonHandler from "./TextBalloonHandler.ts";
import copy from "./copy.json"
import SceneData from "../../data/SceneData.ts";
import Renderer from "../../lib/Renderer.ts";

export default class ConversationHandler {
    textReady: boolean = false;
    private textBalloonHandler: TextBalloonHandler;
    private dataArr!: any;
    private renderer: Renderer;
    private dataIndex: number = 0;
    private currentData!: any;
    private isChoice!: boolean;
    private choiceIndex: number = 0;
    private numChoices = 0;
    isDone: boolean =false;

    constructor(renderer: Renderer, textBalloonHandler: TextBalloonHandler) {
        this.renderer = renderer;
        this.textBalloonHandler = textBalloonHandler;
    }

    startConversation(id: string) {


        this.dataArr = this.getCopyData(id);
        this.dataIndex = 0
        this.isChoice = false;
        this.isDone =false;
        this.setText();


    }

    setText() {

        if (this.dataArr.length == this.dataIndex) {
            this.textBalloonHandler.hideText()
            return true;
        }



        let data = this.dataArr[this.dataIndex]

        if (data.char && data.pos) {
            let m = SceneData.sceneModelsByName[data.char];

            this.textBalloonHandler.setModel(m, data.pos)

        }
        this.currentData = data;

        if (this.currentData.choice) {
            this.setChoice()
        } else {


            this.displayText(data.text, 0, 0)
            this.dataIndex++;
        }


        return false

    }

    displayText(text:string, numAnswers:number, currentAnswer:number){
        this.textReady = false
        this.textBalloonHandler.setText(text,  numAnswers, currentAnswer)
        setTimeout(() => {
            this.textReady = true
        }, 800)

    }


    getCopyData(id: string) {

        for (let data of copy) {
            if (data.name == id) return data.data
        }

    }

    setInput(hInput: number, jump: boolean) {

        if (!this.textReady) {
            return;

        }
        if (this.isChoice) {

            let s = 0;
            if (hInput > 0) {
                s = 1
            } else if (hInput < 0) {
                s = -1
            }

            if(s!=0){

                this.choiceIndex +=s;
                this.choiceIndex= (( this.choiceIndex % this.numChoices) + this.numChoices) % this.numChoices;
console.log(this.choiceIndex)
                let text = this.currentData.choice[this.choiceIndex].text;
                this.displayText(text,   this.numChoices,   this.choiceIndex)

            }else if(jump) {

                console.log("setChoise")
               this.setDone();


            }

            return;
        }

        if (jump) {
            this.setText()
        }


    }



    setChoice() {
        this.isChoice = true;
        this.choiceIndex = 0;
        this.numChoices = this.currentData.choice.length;
        let text = this.currentData.choice[this.choiceIndex].text;


        this.displayText(text,   this.numChoices,   this.choiceIndex)

    }

    private setDone() {
        this.isDone =true;
       this.textBalloonHandler.hideText()
    }
}
