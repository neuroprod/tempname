export default class MouseInteractionWrapper{
    id: string;

    constructor(id:string) {
        this.id =id;
    }
    onRollOver(){
        console.log("over",this.id)
    }
    onRollOut(){

        console.log("out",this.id)

    }
    onDown(){
        console.log("down",this.id)
    }
    onUp(){
        console.log("up",this.id)
    }
    onClick(){
        console.log("click",this.id)
    }
    onUpOutside(){
        console.log("upOutside",this.id)
    }
}
