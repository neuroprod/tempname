class LoadHandler{

    private loading =0;
    onComplete!: () => void;
    isLoading(){
       if(this.loading>0)return true
        return false;
    }

    startLoading(){
        this.loading ++;

    }
    stopLoading(){
        this.loading--
        console.log(this.loading,"load")
        if(this.loading==0)this.onComplete()

    }




}
export default new LoadHandler()
