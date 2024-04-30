"use strict";





type AudioPanel  = {
audio: HTMLAudioElement;
panel: HTMLDivElement;
playPause?: (e:MouseEvent)=>void;
    timeUpdate?: (e: Event) =>  void;
    title?: string;
    category?: string;
    index: number;
} 

type ControlHtml = {
    play: string;
    pause: string;
}

export class LwAP {
    private audioPanels: AudioPanel  [] = [];
    private _index = -1;
    private html:ControlHtml = {
        play: `<svg name="control-pause" role="img" aria-label="pause button"  
    class="lwap-main-sz" viewBox="0 0 16 16">
    <path class="lwap-main-sz"
        d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5zm3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5z" />
</svg>
`,
pause: `
<svg name="play-control" class="lwap-main-sz " role="img" aria-label="play" 
    class="lwap-main-sz" viewBox="0 0 16 16">
    <path class="lwap-main-sz"
        d="M6 10.117V5.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43z" />
</svg>`
    }
    constructor() {
window.addEventListener("load", ()=>{ this.loadControls()});
    }// constructor

    public get categories():string[] {
const cats  = new Map<string, string>();
cats.set("all", "1");
for (let ap of this.audioPanels) {
    if ((ap.category) && (! cats.has(ap.category))) cats.set(ap.category, "1");
}return [...cats.keys()];
    } //get categories

    public filterAudioPanels(filterBy= "all"):AudioPanel[]  {
if ((filterBy !== "all") && (filterBy)) {
    return this.audioPanels.filter((ap)=>((!ap.category) && (filterBy === ap.category)))
}
        return [...this.audioPanels];
    } // all filterAudioPanels

    public get lastIndex():number {
        if (this.audioPanels.length ===0) return -1
        else return this.audioPanels.length - 1;
    } // get lastIndex

    public get firstIndex():number {
        if (this.audioPanels.length === 0) return -1
        else return 0;
    } // get firstIndex


    public get currentPanel():AudioPanel | undefined {
        if (this._index < 0) {
            if (this.audioPanels.length > 0) this._index = 0
            else return undefined;
        }
        return this.audioPanels[this._index];
    } // get currentPanel

    public set currentPanel( ap:AudioPanel  | undefined) {
        if (ap !== undefined) {
        // validates that it is in the list and adds if not and sets the index property
    this.addAudioPanel( ap); 
    this._index = ap.index;
        }

    } // set currentPanel

     private addAudioPanel( ap:AudioPanel):AudioPanel {
        let i = this.findIndexOf(ap);
        if (i < 0){
            i = this.audioPanels.length;
            this.audioPanels.push(ap);
        }
        ap.index = i;
return ap;
     } // addAudioPanel

     private findIndexOf( ap: AudioPanel | HTMLAudioElement): number {
         const a: HTMLAudioElement = ("audio" in ap)?ap.audio: ap;
         return this.audioPanels.findIndex((ap) =>{ return ap.audio === a} )
     } // findIndexOf

public async stopAll( exceptThisOne?:AudioPanel | HTMLAudioElement){
    const a: HTMLAudioElement | null = (exceptThisOne === undefined) ? null  :('audio' in exceptThisOne)? exceptThisOne.audio: exceptThisOne;
for (let ap of this.audioPanels) {
    if (a !== ap.audio) {
        if (!ap.audio.paused) this.playPause(ap);
    }
}
} // stopAll

    public async loadControls() {
        const aCtrls = document.querySelectorAll<HTMLAudioElement>("audio");
        let aList:HTMLAudioElement[] = [];
        if (aCtrls) aList  = [...aCtrls];
        if (aCtrls) this.initControls(aList);

    } // loadControls
private error( a:HTMLAudioElement) {
console.log(`lwAP Error Found: ${a.error?.message}`);
}; // error

    private async initControls(aList: HTMLAudioElement[]) {
        for (let a of aList){
            if (a.error) this.error(a);
        a.onerror = ()=>{ this.error(a);};

            a.preload = "metadata";

            a.addEventListener("durationchange", ()=>{ this.durationChunker(a)});


        } // for controls
    } // initControls

    private async durationChunker( a: HTMLAudioElement) {
        this.createAudioPanel(a);
    } // durationChunker


private async createAudioPanel(a: HTMLAudioElement) {
    const pholder:HTMLDivElement  = document.createElement("div");
    pholder.innerHTML= `
<div class="ap-panel" id="${a.id}-panel">
        <button name="ap-btn-play" class="lwap-main-btn">Play</button>
        <label class="ap-status ap-status-left" name="cur-stat"></label>
        <label class="ap-status ap-status-right" name="dur-stat">${this.secondsToString(a.duration)}</label>
    </div>
`;
    const panel = pholder.firstElementChild as HTMLDivElement;

const ap:AudioPanel = {
    audio: a,
    "panel":panel,
    index:-1
};
    ap.playPause=  () => { this.playPause(ap) },

    a.after(panel);
     const play:HTMLButtonElement  = panel.querySelector<HTMLButtonElement>(`[name="ap-btn-play"]`)!;
    ap.timeUpdate=  () => { cur.innerHTML = this.positionAsString(a, "%time") } 

    play.addEventListener("click",ap.playPause );
    const cur: HTMLLabelElement = panel.querySelector<HTMLLabelElement>(`[name="cur-stat"]`)!;
    a.addEventListener("timeupdate",ap.timeUpdate);  
    this.setTitle(ap);
    this.setCategory(ap);
    this.addAudioPanel(ap);
    }// createAudioPanel

    private async setCategory(ap:AudioPanel) {
        if ( ap.audio.dataset.category) {
            ap.category = ap.audio.dataset.category;
        } 
if (! ap.category) ap.category = "unknown";
    } // setCategory

    private async setTitle(ap:AudioPanel) {
let title: string = ap.audio.title;
if ( title  === "") {
    let src = ap.audio.src;
    if (src) {
        src  = src.split("/").pop() as string;
        const file: string[] = src.split(".");
        file.pop(); // remove extension
        src = file.join(".");
        src = src.replace(/_-/g, " "); // convert file name to a title string
        title = src;
    }
}
if (title) ap.title = title;
    } // setTitle


private async playPause(ap:AudioPanel) {
    const btn = ap.panel.querySelector<HTMLButtonElement>(`[name="ap-btn-play"]`)!;
if (! ap.audio.paused) {
    // Now pause the media
    btn.innerHTML = this.html.pause;
    ap.audio.pause(); 
}else {
    this.stopAll(ap);
        btn.innerHTML = this.html.play;
        ap.audio.play();
}
} // playPause
private secondsToString(sec:number): string {
    const time: string[]  = [];
    let s = sec;
    if (s > 3599) {
time.push(`${Math.floor(s/3600)}hr`)
s %= 3600;
    }
    if (s > 59) {
        time.push(`${Math.floor(s/60)}min`)
        s %= 60;
    }
    if (s > 0) time.push(`${Math.floor(s)}sec`);
    if (time.length === 0) time.push("0s");
    return time.join(" ");
}  // secondsToString

    private positionAsString(a:HTMLAudioElement, mode: "%" | "time" | '%time' ): string {
        const stat:string[] = [];
const pos = a.currentTime, dur = a.duration;
if (pos === 0) return "";
if ((mode === "%") || ( mode === "%time")) {
    const showDec = (dur >= 1800); 
    let pct = Math.floor((pos / dur) * ((showDec)? 1000: 100));
    if (showDec) pct /= 10;
    stat.push(`${pct}%`)
}
if ((mode === "%time") || (mode === "time"))    stat.push(`${this.secondsToString(pos)} Of `);
return stat.join(" "); 
    } // positionAs String
    
} // class lwAP

let lwAP: LwAP ;
export const initAP = async ()=> {
    if (lwAP) return lwAP;
    lwAP = new LwAP();
    return lwAP;
}
