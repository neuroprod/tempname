class LoadHandler{

    private loading =false;
    isLoading(){
        return this.loading
    }

    startLoading(){
        this.loading =true

    }
    stopLoading(){
        this.loading =false

    }




}
export default new LoadHandler()
