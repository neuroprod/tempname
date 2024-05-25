export default class KeyInput{

    leftDown =false;
    rightDown =false;

    camLeft:boolean =false;
    camRight:boolean =false;
    camUp:boolean =false;
    camDown:boolean =false;
    private rightDownTime: DOMHighResTimeStamp;
    private leftDownTime: DOMHighResTimeStamp;
    private space: boolean =false;
    constructor() {

        document.addEventListener('keydown', (event)=> {

           switch (event.key) {
               case "ArrowLeft":

                   if(event.shiftKey){
                       this.camLeft =true;
                   }else{
                    this.leftDown=true;
                    this.leftDownTime = event.timeStamp
                   }
                   break;
               case "ArrowRight":
                   if(event.shiftKey){
                       this.camLeft =true;
                   }else{
                   this.rightDown=true;
                   this.rightDownTime = event.timeStamp
                   }
                   break;
               case "ArrowUp" :
                   if(event.shiftKey){
                       this.camUp =true;
                       break;
                   }
               case " " :
                   this.space =true;
                   break;
               case "ArrowDown" :
                   if(event.shiftKey){
                       this.camDown=true;

                   }
                   break;
           }

        });

        document.addEventListener('keyup', (event)=> {
            switch (event.key) {
                case "ArrowLeft":
                   this.leftDown =false
                    break;
                case "ArrowRight":
                   this.rightDown=false
                    break;

            }
        });
    }
    getJump()
    {
        if(this.space){
            this.space =false;
            return true;
        }
        return false;
    }
    getHdir(){
        if(this.rightDown && !this.leftDown){
            return 1
        }
        if(this.leftDown && !this.rightDown){
            return -1
        }
        if(this.leftDown && this.rightDown){
            if(this.leftDownTime>this.rightDownTime) return -1
            else return 1;
        }
        return 0;
    }


}
