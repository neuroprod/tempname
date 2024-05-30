class Timer{

    public frame:number=0;
    public time:number=0;
    public delta:number=1/60;
    public fps =60;
    private prevTime:number;
    constructor(){
        this.prevTime =Date.now()
    }

    update()
    {
        let now = Date.now()
        this.delta = (now-this.prevTime)/1000;
        this.fps =Math.round(1/this.delta);
        this.time+=this.delta;
        this.frame++;
        this.prevTime =now;
    }

}
export default new Timer()
