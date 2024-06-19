
export const AppStates={
    MAIN_STATE:"mainState"


}


class AppState{


    public data={}

    setState(state:string,value:any){
        this.data[state] =value;
        this.save()
    }
    getState(state:string){
        return this.data[state];
    }

    init() {
        let dataS = localStorage.getItem("appState")
        let data = JSON.parse(dataS)
        if (data) {
            for (let value of Object.keys(data)) {
                    this.data[value] = data[value];
            }
        }
    }

    save() {
        let s = JSON.stringify(this.data);
        localStorage.setItem("appState", s);
    }



}

export default new AppState()
