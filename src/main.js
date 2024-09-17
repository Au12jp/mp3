"use strict";(()=>{var f=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var c=(e,t,r)=>new Promise((a,n)=>{var o=s=>{try{d(r.next(s))}catch(l){n(l)}},m=s=>{try{d(r.throw(s))}catch(l){n(l)}},d=s=>s.done?a(s.value):Promise.resolve(s.value).then(o,m);d((r=r.apply(e,t)).next())});var I=f(p=>{var g=new Worker("./core-mt/worker.js");function u(e,t=[]){return new Promise((r,a)=>{g.postMessage({command:e,args:t}),g.onmessage=n=>{if(n.data.status==="error")a(n.data.message);else if(n.data.status==="progress"){let{percent:o,estimatedRemainingTime:m}=n.data;T.style.width=`${o}%`,k.innerText=`Estimated Time Left: ${m}s`}else r(n.data.result)}})}var E=document.getElementById("fileInput"),y=document.getElementById("createPackButton"),T=document.getElementById("progress"),k=document.getElementById("timeRemaining"),i=document.getElementById("status");function B(){return c(this,null,function*(){try{i.innerText="Loading FFmpeg...",yield u("load"),i.innerText="FFmpeg loaded."}catch(e){i.innerText="Error loading FFmpeg.",console.error("Error loading FFmpeg:",e)}})}function w(e,t,r){return c(this,null,function*(){i.innerText="Creating BP and RP...";let a=new Uint8Array(yield e.arrayBuffer());yield u("createPack",[a,t,r]);let n=yield u("getPack"),o=document.createElement("a");o.href=URL.createObjectURL(n),o.download="generated_pack.mcaddon",o.click(),i.innerText="Pack creation complete!"})}y.addEventListener("click",()=>c(p,null,function*(){var a;let e=(a=E.files)==null?void 0:a[0];if(!e){alert("Please select a video file.");return}let t=parseInt(document.getElementById("frameCount").value),r=parseInt(document.getElementById("fps").value);try{yield w(e,t,r)}catch(n){i.innerText="Error during pack creation.",console.error("Error during pack creation:",n)}}));B().catch(console.error)});I();})();
//# sourceMappingURL=main.js.map
