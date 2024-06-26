"use strict";
import { KH_Key, initKH } from "./lwkh";


//  Name: l-ap.ts
//
//   Date: May 13, 2024
//
//   Author: Lewis L Wood
//
// description: Audio Player that mimics Youtube Player, generates the key handlers.  Designed with Screen readers in mind.
//
//  integrates: lw-kh.ts - My key handler 
//


export type KeyHandlers = {
    goTo: KH_Key[];
    playPause?: KH_Key;
    jump: {foward?: KH_Key, back?:KH_Key};
    rate: {faster?: KH_Key, slower?:KH_Key};
    volume: {up?:KH_Key, down?: KH_Key};
    sayTime?: KH_Key; 
}




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
    private _currentPanel?:AudioPanel;
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
    private _keys: KeyHandlers[] = [];  // array of key handlers Alt sets
    public sayTime?:Function;  // You must set this if you want the say time key to be defined and work.
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
        return this._currentPanel;
    } // get currentPanel

    public set currentPanel( ap:AudioPanel  | undefined) {
        this._currentPanel = ap;

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
        <button name="ap-btn-play" class="lwap-main-btn">${this.html.pause}</button>
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
    this._currentPanel= ap;
    const btn = ap.panel.querySelector<HTMLButtonElement>(`[name="ap-btn-play"]`)!;
if (! ap.audio.paused) {
    // Now pause the media
    btn.innerHTML = this.html.pause;
    ap.audio.pause(); 
}else {
    this.stopAll(ap);
        btn.innerHTML = this.html.play;
        this._currentPanel = ap;
        ap.audio.play();
}
} // playPause

public playPauseCurrent() {
    const ap = this.currentPanel;
    if ( ap) this.playPause(ap);
} // playPauseCurrent

public async jump( seconds: number) {
    const ap = this.currentPanel;
if (ap) {
    const a:HTMLAudioElement= ap.audio;
    const cur = (a.currentTime + seconds);
    if (cur < 0) a.currentTime = 0
    else if (cur > a.duration) a.currentTime = a.duration
    else a.currentTime = cur;
}
} // jump
public async goTo( percentage: number) {
    const ap = this.currentPanel;
if ((ap)&& ((percentage < 100) && (percentage >= 0))) {
    const aud:HTMLAudioElement = ap.audio;
    const p = ((percentage < 10)? percentage * 10 : percentage) / 100;
    const newPos = (p * aud.duration)
    aud.currentTime = Math.floor(newPos);
}

} //goTo()
public async playBackRate(change: number) {
    const ap = this.currentPanel;
if (ap) {
const aud = ap.audio;
    const cur = aud.playbackRate + change;
    if ((cur >= 0.25) && ( cur <= 4))  aud.playbackRate = cur;
}
} // playBackRate
public async volumeChange( change: number) {
    const ap = this.currentPanel;
if (ap) {
    const aud:HTMLAudioElement = ap.audio;
const newVol = aud.volume + change;
if ((newVol >= 0) && (newVol <= 1)) aud.volume = newVol;
}
}  // volumeChange




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

    // retrieves the value being displayed for the current element
    public statsCurrent():string {
        if (! this.currentPanel) return "Nothing playing";
        const ap = this.currentPanel!;
        const lbl = ap.panel.querySelector<HTMLLabelElement>(`[name="dur-stat"]`)!;
        return this.positionAsString(ap.audio, "%time") + lbl.innerHTML;        
    } //statsCurrent

    public  get keys():KeyHandlers[] {
        return this._keys;
    } // get keys

    private blankKeys():KeyHandlers {
        return {
            goTo: [],
            jump: {},
            rate: {},
            volume: {}
        };
    } // blankKeys

    //  Clears all keys and generates a fresh set of key mappings
    public async generateKeys() {
this._keys = [this.blankKeys(), this.blankKeys()];
const pKeys = this.keys[0], aKeys = this.keys[1];
        const hk = initKH();
const khGet = (alt: boolean, key:string,prefix: string, desc: string, action:Function):KH_Key  => {
    return { ...hk.newKeyBlank, altKey: alt, shiftKey: alt, key, name: `${prefix}-${key}${(alt)?"-alt":""}`, desc, action, category: "Audio Player"}
} 
// goTo section
for (let k = 0;k<10;k++) {
   pKeys.goTo.push(  khGet(false,`${k}`,"ap-goto",`Goto ${k*10}%`,()=>{ this.goTo(k)}) );
}
// Jump has screen reader friendly keys as well
        pKeys.jump.foward= khGet(false, `l`, "ap-jump-f","Jump foward 15s",() => { this.jump(15) });
        pKeys.jump.back = khGet(false, `j`, "ap-jump-b", "Jump back 15s", () => { this.jump(-15) });
aKeys.jump.foward = khGet(true, `L`, "ap-jump-f", "Jump foward 15s", () => { this.jump(15) });
        aKeys.jump.back= khGet(true, `J`, "ap-jump-b", "Jump back 15s", () => { this.jump(-15) });

        // playPause with screen reader keys
        aKeys.playPause = khGet(true, "K", "ap-play", "Play/pause", () => { this.playPauseCurrent() });
        pKeys.playPause = khGet(false, `k`, "ap-play", "Play/pause", () => { this.playPauseCurrent()});
// rate
        pKeys.rate.slower = {...khGet(false, `<`, "ap-rate-s", "Playback rate slower", () => { this.playBackRate(-0.25)}),shiftKey:true} ;
        pKeys.rate.faster = {...khGet(false, `>`, "ap-jump-f", "Playback rate faster", () => { this.playBackRate(0.25) }), shiftKey:true};
        aKeys.rate.slower = { ...khGet(true, `<`, "ap-rate-s", "Playback rate slower", () => { this.playBackRate(-0.25) }), shiftKey: true };
        aKeys.rate.faster = { ...khGet(true, `>`, "ap-jump-f", "Playback rate faster", () => { this.playBackRate(0.25) }), shiftKey: true };
        // volume
        pKeys.volume.up = {...khGet(false, `V`, "ap-vol-u", "Volume up", () => { this.volumeChange(0.1) }), shiftKey:true};
        pKeys.volume.down = {...khGet(false, `v`, "ap-vol-d", "Volume down", () => { this.volumeChange(-0.1) }), shiftKey:false};
        // sayTime
        if (this.sayTime) {
            //@ts-ignore
    const st = (e:Event)=>{ this.SayStats(); e.preventDefault(); }                    
    aKeys.sayTime= {...khGet(false, "t", "ap-say-time", "* Say Time",st ), shiftKey:false};

        }
    } // generateKeys
    
    private SayStats() {
        const st = this.sayTime;
        if (st) {
st(this.statsCurrent());
        }
    }  // sayStats


    public async enableKeyHandling() {
        const kh = initKH();
        // kh.addKeyTest(this.keys[1].playPause!)
        // return;

        const keys = this.getKeyList();


        keys.forEach((k) => { kh.addKeyTest(k) });

    } // enableKeyHandling    

    private getKeyList():KH_Key[] {
        const pKeys = this.keys[0], aKeys = this.keys[1];
const keys = [ ...pKeys.goTo, ...aKeys.goTo];
const addKey = (k?:KH_Key)=>{if (k) keys.push(k)};
        addKey(pKeys.jump.back); addKey(pKeys.jump.foward); addKey(aKeys.jump.back); addKey(aKeys.jump.foward);
    addKey(pKeys.playPause); addKey(aKeys.playPause);
        addKey(pKeys.volume.up); addKey(pKeys.volume.down); addKey(aKeys.volume.up); addKey(aKeys.volume.down);
        addKey(pKeys.rate.faster); addKey(pKeys.rate.slower); addKey(aKeys.rate.faster); addKey(aKeys.rate.slower);
        addKey(pKeys.sayTime); addKey(aKeys.sayTime);


return keys;
    } // getKeyList

} // class lwAP

let lwAP: LwAP ;
export const initAP = async ()=> {
    if (lwAP) return lwAP;
    lwAP = new LwAP();
    return lwAP;
}
