"use strict";(()=>{var Z=Object.defineProperty;var k=Object.getOwnPropertySymbols;var q=Object.prototype.hasOwnProperty,Q=Object.prototype.propertyIsEnumerable;var T=t=>{throw TypeError(t)};var ee=(t,e,r)=>e in t?Z(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var C=(t,e)=>{var r={};for(var a in t)q.call(t,a)&&e.indexOf(a)<0&&(r[a]=t[a]);if(t!=null&&k)for(var a of k(t))e.indexOf(a)<0&&Q.call(t,a)&&(r[a]=t[a]);return r};var h=(t,e)=>()=>(t&&(e=t(t=0)),e);var te=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var c=(t,e,r)=>ee(t,typeof e!="symbol"?e+"":e,r),x=(t,e,r)=>e.has(t)||T("Cannot "+r);var s=(t,e,r)=>(x(t,e,"read from private field"),r?r.call(t):e.get(t)),u=(t,e,r)=>e.has(t)?T("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),_=(t,e,r,a)=>(x(t,e,"write to private field"),a?a.call(t,r):e.set(t,r),r);var m=(t,e,r)=>new Promise((a,n)=>{var i=E=>{try{l(r.next(E))}catch(D){n(D)}},w=E=>{try{l(r.throw(E))}catch(D){n(D)}},l=E=>E.done?a(E.value):Promise.resolve(E.value).then(i,w);l((r=r.apply(t,e)).next())});var re,Ee,o,F=h(()=>{re="0.12.6",Ee=`https://unpkg.com/@ffmpeg/core@${re}/dist/umd/ffmpeg-core.js`;(function(t){t.LOAD="LOAD",t.EXEC="EXEC",t.WRITE_FILE="WRITE_FILE",t.READ_FILE="READ_FILE",t.DELETE_FILE="DELETE_FILE",t.RENAME="RENAME",t.CREATE_DIR="CREATE_DIR",t.LIST_DIR="LIST_DIR",t.DELETE_DIR="DELETE_DIR",t.ERROR="ERROR",t.DOWNLOAD="DOWNLOAD",t.PROGRESS="PROGRESS",t.LOG="LOG",t.MOUNT="MOUNT",t.UNMOUNT="UNMOUNT"})(o||(o={}))});var S,W=h(()=>{S=(()=>{let t=0;return()=>t++})()});var Re,P,j,me,B=h(()=>{Re=new Error("unknown message type"),P=new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first"),j=new Error("called FFmpeg.terminate()"),me=new Error("failed to import ffmpeg-core.js")});var v,f,g,p,L,O,N,d,y,$=h(()=>{F();W();B();v={},y=class{constructor(){u(this,f,null);u(this,g,{});u(this,p,{});u(this,L,[]);u(this,O,[]);c(this,"loaded",!1);u(this,N,()=>{s(this,f)&&(s(this,f).onmessage=({data:{id:e,type:r,data:a}})=>{switch(r){case o.LOAD:this.loaded=!0,s(this,g)[e](a);break;case o.MOUNT:case o.UNMOUNT:case o.EXEC:case o.WRITE_FILE:case o.READ_FILE:case o.DELETE_FILE:case o.RENAME:case o.CREATE_DIR:case o.LIST_DIR:case o.DELETE_DIR:s(this,g)[e](a);break;case o.LOG:s(this,L).forEach(n=>n(a));break;case o.PROGRESS:s(this,O).forEach(n=>n(a));break;case o.ERROR:s(this,p)[e](a);break}delete s(this,g)[e],delete s(this,p)[e]})});u(this,d,({type:e,data:r},a=[],n)=>s(this,f)?new Promise((i,w)=>{let l=S();s(this,f)&&s(this,f).postMessage({id:l,type:e,data:r},a),s(this,g)[l]=i,s(this,p)[l]=w,n==null||n.addEventListener("abort",()=>{w(new DOMException(`Message # ${l} was aborted`,"AbortError"))},{once:!0})}):Promise.reject(P));c(this,"load",(n={},{signal:a}={})=>{var i=n,{classWorkerURL:e}=i,r=C(i,["classWorkerURL"]);return s(this,f)||(_(this,f,e?new Worker(new URL(e,v.url),{type:"module"}):new Worker(new URL("./worker.js",v.url),{type:"module"})),s(this,N).call(this)),s(this,d).call(this,{type:o.LOAD,data:r},void 0,a)});c(this,"exec",(e,r=-1,{signal:a}={})=>s(this,d).call(this,{type:o.EXEC,data:{args:e,timeout:r}},void 0,a));c(this,"terminate",()=>{let e=Object.keys(s(this,p));for(let r of e)s(this,p)[r](j),delete s(this,p)[r],delete s(this,g)[r];s(this,f)&&(s(this,f).terminate(),_(this,f,null),this.loaded=!1)});c(this,"writeFile",(e,r,{signal:a}={})=>{let n=[];return r instanceof Uint8Array&&n.push(r.buffer),s(this,d).call(this,{type:o.WRITE_FILE,data:{path:e,data:r}},n,a)});c(this,"mount",(e,r,a)=>{let n=[];return s(this,d).call(this,{type:o.MOUNT,data:{fsType:e,options:r,mountPoint:a}},n)});c(this,"unmount",e=>{let r=[];return s(this,d).call(this,{type:o.UNMOUNT,data:{mountPoint:e}},r)});c(this,"readFile",(e,r="binary",{signal:a}={})=>s(this,d).call(this,{type:o.READ_FILE,data:{path:e,encoding:r}},void 0,a));c(this,"deleteFile",(e,{signal:r}={})=>s(this,d).call(this,{type:o.DELETE_FILE,data:{path:e}},void 0,r));c(this,"rename",(e,r,{signal:a}={})=>s(this,d).call(this,{type:o.RENAME,data:{oldPath:e,newPath:r}},void 0,a));c(this,"createDir",(e,{signal:r}={})=>s(this,d).call(this,{type:o.CREATE_DIR,data:{path:e}},void 0,r));c(this,"listDir",(e,{signal:r}={})=>s(this,d).call(this,{type:o.LIST_DIR,data:{path:e}},void 0,r));c(this,"deleteDir",(e,{signal:r}={})=>s(this,d).call(this,{type:o.DELETE_DIR,data:{path:e}},void 0,r))}on(e,r){e==="log"?s(this,L).push(r):e==="progress"&&s(this,O).push(r)}off(e,r){e==="log"?_(this,L,s(this,L).filter(a=>a!==r)):e==="progress"&&_(this,O,s(this,O).filter(a=>a!==r))}};f=new WeakMap,g=new WeakMap,p=new WeakMap,L=new WeakMap,O=new WeakMap,N=new WeakMap,d=new WeakMap});var G=h(()=>{$()});var Y,H,X=h(()=>{Y=new Error("failed to get response body reader"),H=new Error("failed to complete download")});var V,z=h(()=>{V="Content-Length"});var ae,I,J=h(()=>{X();z();ae=(t,e)=>m(void 0,null,function*(){var n;let r=yield fetch(t),a;try{let i=parseInt(r.headers.get(V)||"-1"),w=(n=r.body)==null?void 0:n.getReader();if(!w)throw Y;let l=[],E=0;for(;;){let{done:A,value:U}=yield w.read(),M=U?U.length:0;if(A){if(i!=-1&&i!==E)throw H;e&&e({url:t,total:i,received:E,delta:M,done:A});break}l.push(U),E+=M,e&&e({url:t,total:i,received:E,delta:M,done:A})}let D=new Uint8Array(E),b=0;for(let A of l)D.set(A,b),b+=A.length;a=D.buffer}catch(i){console.log("failed to send download progress event: ",i),a=yield r.arrayBuffer(),e&&e({url:t,total:a.byteLength,received:a.byteLength,delta:0,done:!0})}return a}),I=(t,e,r=!1,a)=>m(void 0,null,function*(){let n=r?yield ae(t,a):yield(yield fetch(t)).arrayBuffer(),i=new Blob([n],{type:e});return URL.createObjectURL(i)})});var ce=te(K=>{G();J();var R=null;self.addEventListener("message",t=>m(K,null,function*(){let{command:e,args:r}=t.data;if(!R&&e!=="load"){self.postMessage({status:"error",message:"FFmpeg is not loaded."});return}switch(e){case"load":yield se();break;case"writeFile":yield oe(r);break;case"readFile":yield ne(r);break;case"run":yield ie(r);break;default:console.error(`Unknown command: ${e}`)}}));function se(){return m(this,null,function*(){try{if(R===null){R=new y;let t="./core-mt",e={classWorkerURL:yield I(`${t}/worker.js`,"text/javascript"),coreURL:yield I(`${t}/ffmpeg-core.js`,"text/javascript"),wasmURL:yield I(`${t}/ffmpeg-core.wasm`,"application/wasm"),workerURL:yield I(`${t}/ffmpeg-core.worker.js`,"text/javascript")};yield R.load(e),self.postMessage({status:"loaded"})}else self.postMessage({status:"already-loaded"})}catch(t){self.postMessage({status:"error",message:t instanceof Error?t.message:String(t)})}})}function oe(t){return m(this,null,function*(){try{R&&(yield R.writeFile(t.fileName,t.fileData),self.postMessage({status:"file-written"}))}catch(e){self.postMessage({status:"error",message:e instanceof Error?e.message:String(e)})}})}function ne(t){return m(this,null,function*(){try{if(R){let e=yield R.readFile(t.fileName);self.postMessage({result:e})}}catch(e){self.postMessage({status:"error",message:e instanceof Error?e.message:String(e)})}})}function ie(t){return m(this,null,function*(){try{R&&(yield R.exec(t.commandArgs),self.postMessage({status:"execution-completed"}))}catch(e){self.postMessage({status:"error",message:e instanceof Error?e.message:String(e)})}})}});ce();})();
//# sourceMappingURL=worker.js.map
