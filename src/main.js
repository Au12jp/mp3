"use strict";(()=>{var ze=Object.create;var X=Object.defineProperty;var Ve=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames,D=Object.getOwnPropertySymbols,Ze=Object.getPrototypeOf,ee=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable;var me=(t,o,i)=>o in t?X(t,o,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[o]=i,Y=(t,o)=>{for(var i in o||(o={}))ee.call(o,i)&&me(t,i,o[i]);if(D)for(var i of D(o))de.call(o,i)&&me(t,i,o[i]);return t};var ge=(t,o)=>{var i={};for(var a in t)ee.call(t,a)&&o.indexOf(a)<0&&(i[a]=t[a]);if(t!=null&&D)for(var a of D(t))o.indexOf(a)<0&&de.call(t,a)&&(i[a]=t[a]);return i};var L=(t,o)=>()=>(o||t((o={exports:{}}).exports,o),o.exports);var Ke=(t,o,i,a)=>{if(o&&typeof o=="object"||typeof o=="function")for(let l of Je(o))!ee.call(t,l)&&l!==i&&X(t,l,{get:()=>o[l],enumerable:!(a=Ve(o,l))||a.enumerable});return t};var Qe=(t,o,i)=>(i=t!=null?ze(Ze(t)):{},Ke(o||!t||!t.__esModule?X(i,"default",{value:t,enumerable:!0}):i,t));var O=(t,o,i)=>new Promise((a,l)=>{var c=d=>{try{p(i.next(d))}catch(g){l(g)}},m=d=>{try{p(i.throw(d))}catch(g){l(g)}},p=d=>d.done?a(d.value):Promise.resolve(d.value).then(c,m);p((i=i.apply(t,o)).next())});var ve=L((Lt,re)=>{var te=function(t){"use strict";var o=Object.prototype,i=o.hasOwnProperty,a=Object.defineProperty||function(r,e,n){r[e]=n.value},l,c=typeof Symbol=="function"?Symbol:{},m=c.iterator||"@@iterator",p=c.asyncIterator||"@@asyncIterator",d=c.toStringTag||"@@toStringTag";function g(r,e,n){return Object.defineProperty(r,e,{value:n,enumerable:!0,configurable:!0,writable:!0}),r[e]}try{g({},"")}catch(r){g=function(e,n,f){return e[n]=f}}function M(r,e,n,f){var s=e&&e.prototype instanceof _?e:_,u=Object.create(s.prototype),y=new Z(f||[]);return a(u,"_invoke",{value:Ye(r,n,y)}),u}t.wrap=M;function R(r,e,n){try{return{type:"normal",arg:r.call(e,n)}}catch(f){return{type:"throw",arg:f}}}var x="suspendedStart",V="suspendedYield",W="executing",T="completed",F={};function _(){}function U(){}function k(){}var h={};g(h,m,function(){return this});var v=Object.getPrototypeOf,w=v&&v(v(K([])));w&&w!==o&&i.call(w,m)&&(h=w);var j=k.prototype=_.prototype=Object.create(h);U.prototype=k,a(j,"constructor",{value:k,configurable:!0}),a(k,"constructor",{value:U,configurable:!0}),U.displayName=g(k,d,"GeneratorFunction");function P(r){["next","throw","return"].forEach(function(e){g(r,e,function(n){return this._invoke(e,n)})})}t.isGeneratorFunction=function(r){var e=typeof r=="function"&&r.constructor;return e?e===U||(e.displayName||e.name)==="GeneratorFunction":!1},t.mark=function(r){return Object.setPrototypeOf?Object.setPrototypeOf(r,k):(r.__proto__=k,g(r,d,"GeneratorFunction")),r.prototype=Object.create(j),r},t.awrap=function(r){return{__await:r}};function A(r,e){function n(u,y,b,S){var E=R(r[u],r,y);if(E.type==="throw")S(E.arg);else{var Q=E.arg,G=Q.value;return G&&typeof G=="object"&&i.call(G,"__await")?e.resolve(G.__await).then(function(C){n("next",C,b,S)},function(C){n("throw",C,b,S)}):e.resolve(G).then(function(C){Q.value=C,b(Q)},function(C){return n("throw",C,b,S)})}}var f;function s(u,y){function b(){return new e(function(S,E){n(u,y,S,E)})}return f=f?f.then(b,b):b()}a(this,"_invoke",{value:s})}P(A.prototype),g(A.prototype,p,function(){return this}),t.AsyncIterator=A,t.async=function(r,e,n,f,s){s===void 0&&(s=Promise);var u=new A(M(r,e,n,f),s);return t.isGeneratorFunction(e)?u:u.next().then(function(y){return y.done?y.value:u.next()})};function Ye(r,e,n){var f=x;return function(u,y){if(f===W)throw new Error("Generator is already running");if(f===T){if(u==="throw")throw y;return he()}for(n.method=u,n.arg=y;;){var b=n.delegate;if(b){var S=pe(b,n);if(S){if(S===F)continue;return S}}if(n.method==="next")n.sent=n._sent=n.arg;else if(n.method==="throw"){if(f===x)throw f=T,n.arg;n.dispatchException(n.arg)}else n.method==="return"&&n.abrupt("return",n.arg);f=W;var E=R(r,e,n);if(E.type==="normal"){if(f=n.done?T:V,E.arg===F)continue;return{value:E.arg,done:n.done}}else E.type==="throw"&&(f=T,n.method="throw",n.arg=E.arg)}}}function pe(r,e){var n=e.method,f=r.iterator[n];if(f===l)return e.delegate=null,n==="throw"&&r.iterator.return&&(e.method="return",e.arg=l,pe(r,e),e.method==="throw")||n!=="return"&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+n+"' method")),F;var s=R(f,r.iterator,e.arg);if(s.type==="throw")return e.method="throw",e.arg=s.arg,e.delegate=null,F;var u=s.arg;if(!u)return e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,F;if(u.done)e[r.resultName]=u.value,e.next=r.nextLoc,e.method!=="return"&&(e.method="next",e.arg=l);else return u;return e.delegate=null,F}P(j),g(j,d,"Generator"),g(j,m,function(){return this}),g(j,"toString",function(){return"[object Generator]"});function He(r){var e={tryLoc:r[0]};1 in r&&(e.catchLoc=r[1]),2 in r&&(e.finallyLoc=r[2],e.afterLoc=r[3]),this.tryEntries.push(e)}function J(r){var e=r.completion||{};e.type="normal",delete e.arg,r.completion=e}function Z(r){this.tryEntries=[{tryLoc:"root"}],r.forEach(He,this),this.reset(!0)}t.keys=function(r){var e=Object(r),n=[];for(var f in e)n.push(f);return n.reverse(),function s(){for(;n.length;){var u=n.pop();if(u in e)return s.value=u,s.done=!1,s}return s.done=!0,s}};function K(r){if(r){var e=r[m];if(e)return e.call(r);if(typeof r.next=="function")return r;if(!isNaN(r.length)){var n=-1,f=function s(){for(;++n<r.length;)if(i.call(r,n))return s.value=r[n],s.done=!1,s;return s.value=l,s.done=!0,s};return f.next=f}}return{next:he}}t.values=K;function he(){return{value:l,done:!0}}return Z.prototype={constructor:Z,reset:function(r){if(this.prev=0,this.next=0,this.sent=this._sent=l,this.done=!1,this.delegate=null,this.method="next",this.arg=l,this.tryEntries.forEach(J),!r)for(var e in this)e.charAt(0)==="t"&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=l)},stop:function(){this.done=!0;var r=this.tryEntries[0],e=r.completion;if(e.type==="throw")throw e.arg;return this.rval},dispatchException:function(r){if(this.done)throw r;var e=this;function n(S,E){return u.type="throw",u.arg=r,e.next=S,E&&(e.method="next",e.arg=l),!!E}for(var f=this.tryEntries.length-1;f>=0;--f){var s=this.tryEntries[f],u=s.completion;if(s.tryLoc==="root")return n("end");if(s.tryLoc<=this.prev){var y=i.call(s,"catchLoc"),b=i.call(s,"finallyLoc");if(y&&b){if(this.prev<s.catchLoc)return n(s.catchLoc,!0);if(this.prev<s.finallyLoc)return n(s.finallyLoc)}else if(y){if(this.prev<s.catchLoc)return n(s.catchLoc,!0)}else if(b){if(this.prev<s.finallyLoc)return n(s.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(r,e){for(var n=this.tryEntries.length-1;n>=0;--n){var f=this.tryEntries[n];if(f.tryLoc<=this.prev&&i.call(f,"finallyLoc")&&this.prev<f.finallyLoc){var s=f;break}}s&&(r==="break"||r==="continue")&&s.tryLoc<=e&&e<=s.finallyLoc&&(s=null);var u=s?s.completion:{};return u.type=r,u.arg=e,s?(this.method="next",this.next=s.finallyLoc,F):this.complete(u)},complete:function(r,e){if(r.type==="throw")throw r.arg;return r.type==="break"||r.type==="continue"?this.next=r.arg:r.type==="return"?(this.rval=this.arg=r.arg,this.method="return",this.next="end"):r.type==="normal"&&e&&(this.next=e),F},finish:function(r){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===r)return this.complete(n.completion,n.afterLoc),J(n),F}},catch:function(r){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===r){var f=n.completion;if(f.type==="throw"){var s=f.arg;J(n)}return s}}throw new Error("illegal catch attempt")},delegateYield:function(r,e,n){return this.delegate={iterator:K(r),resultName:e,nextLoc:n},this.method==="next"&&(this.arg=l),F}},t}(typeof re=="object"?re.exports:{});try{regeneratorRuntime=te}catch(t){typeof globalThis=="object"?globalThis.regeneratorRuntime=te:Function("r","regeneratorRuntime = r")(te)}});var ye=L((Ft,we)=>{we.exports={defaultArgs:["./ffmpeg","-nostdin","-y"],baseOptions:{log:!1,logger:()=>{},progress:()=>{},corePath:""}}});var oe=L((jt,Ee)=>{var ne=!1,be=()=>{},Xe=t=>{ne=t},et=t=>{be=t},tt=(t,o)=>{be({type:t,message:o}),ne&&console.log(`[${t}] ${o}`)};Ee.exports={logging:ne,setLogging:Xe,setCustomLogger:et,log:tt}});var je=L((St,Fe)=>{var N=0,ie=0,Le=t=>{let[o,i,a]=t.split(":");return parseFloat(o)*60*60+parseFloat(i)*60+parseFloat(a)};Fe.exports=(t,o)=>{if(typeof t=="string")if(t.startsWith("  Duration")){let i=t.split(", ")[0].split(": ")[1],a=Le(i);o({duration:a,ratio:ie}),(N===0||N>a)&&(N=a)}else if(t.startsWith("frame")||t.startsWith("size")){let i=t.split("time=")[1].split(" ")[0],a=Le(i);ie=a/N,o({ratio:ie,time:a})}else t.startsWith("video:")&&(o({ratio:1}),N=0)}});var ke=L((kt,Se)=>{Se.exports=(t,o)=>{let i=t._malloc(o.length*Uint32Array.BYTES_PER_ELEMENT);return o.forEach((a,l)=>{let c=t._malloc(a.length+1);t.writeAsciiToMemory(a,c),t.setValue(i+Uint32Array.BYTES_PER_ELEMENT*l,c,"i32")}),[o.length,i]}});var H=L((ae,Pe)=>{(function(t,o){typeof define=="function"&&define.amd?define(o):typeof ae=="object"?Pe.exports=o():t.resolveUrl=o()})(ae,function(){function t(){var o=arguments.length;if(o===0)throw new Error("resolveUrl requires at least one argument; got none.");var i=document.createElement("base");if(i.href=arguments[0],o===1)return i.href;var a=document.getElementsByTagName("head")[0];a.insertBefore(i,a.firstChild);for(var l=document.createElement("a"),c,m=1;m<o;m++)l.href=arguments[m],c=l.href,i.href=c;return a.removeChild(i),c}return t})});var se=L((Pt,rt)=>{rt.exports={name:"@ffmpeg/ffmpeg",version:"0.10.1",description:"FFmpeg WebAssembly version",main:"src/index.js",types:"src/index.d.ts",directories:{example:"examples"},scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js",prepublishOnly:"npm run build",lint:"eslint src",wait:"rimraf dist && wait-on http://localhost:3000/dist/ffmpeg.dev.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser:ffmpeg test:node:all","test:node":"node --experimental-wasm-threads --experimental-wasm-bulk-memory node_modules/.bin/_mocha --exit --bail --require ./scripts/test-helper.js","test:node:all":"npm run test:node -- ./tests/*.test.js","test:browser":"mocha-headless-chrome -a allow-file-access-from-files -a incognito -a no-sandbox -a disable-setuid-sandbox -a disable-logging -t 300000","test:browser:ffmpeg":"npm run test:browser -- -f ./tests/ffmpeg.test.html"},browser:{"./src/node/index.js":"./src/browser/index.js"},repository:{type:"git",url:"git+https://github.com/ffmpegwasm/ffmpeg.wasm.git"},keywords:["ffmpeg","WebAssembly","video"],author:"Jerome Wu <jeromewus@gmail.com>",license:"MIT",bugs:{url:"https://github.com/ffmpegwasm/ffmpeg.wasm/issues"},engines:{node:">=12.16.1"},homepage:"https://github.com/ffmpegwasm/ffmpeg.wasm#readme",dependencies:{"is-url":"^1.2.4","node-fetch":"^2.6.1","regenerator-runtime":"^0.13.7","resolve-url":"^0.2.1"},devDependencies:{"@babel/core":"^7.12.3","@babel/preset-env":"^7.12.1","@ffmpeg/core":"^0.10.0","@types/emscripten":"^1.39.4","babel-loader":"^8.1.0",chai:"^4.2.0",cors:"^2.8.5",eslint:"^7.12.1","eslint-config-airbnb-base":"^14.1.0","eslint-plugin-import":"^2.22.1",express:"^4.17.1",mocha:"^8.2.1","mocha-headless-chrome":"^2.0.3","npm-run-all":"^4.1.5","wait-on":"^5.3.0",webpack:"^5.3.2","webpack-cli":"^4.1.0","webpack-dev-middleware":"^4.0.0"}}});var Ce=L((Ct,Oe)=>{var Ot=H(),{devDependencies:nt}=se();Oe.exports={corePath:`https://unpkg.com/@ffmpeg/core@${nt["@ffmpeg/core"].substring(1)}/dist/ffmpeg-core.js`}});var Re=L((le,qe)=>{var ot=H(),{log:$}=oe(),fe=(t,o)=>O(le,null,function*(){$("info",`fetch ${t}`);let i=yield(yield fetch(t)).arrayBuffer();$("info",`${t} file size = ${i.byteLength} bytes`);let a=new Blob([i],{type:o}),l=URL.createObjectURL(a);return $("info",`${t} blob URL = ${l}`),l});qe.exports=o=>O(le,[o],function*({corePath:t}){if(typeof t!="string")throw Error("corePath should be a string!");let i=ot(t),a=yield fe(i,"application/javascript"),l=yield fe(i.replace("ffmpeg-core.js","ffmpeg-core.wasm"),"application/wasm"),c=yield fe(i.replace("ffmpeg-core.js","ffmpeg-core.worker.js"),"application/javascript");return typeof createFFmpegCore=="undefined"?new Promise(m=>{let p=document.createElement("script"),d=()=>{p.removeEventListener("load",d),$("info","ffmpeg-core.js script loaded"),m({createFFmpegCore,corePath:a,wasmPath:l,workerPath:c})};p.src=a,p.type="text/javascript",p.addEventListener("load",d),document.getElementsByTagName("head")[0].appendChild(p)}):($("info","ffmpeg-core.js script is loaded already"),Promise.resolve({createFFmpegCore,corePath:a,wasmPath:l,workerPath:c}))})});var Ae=L((Te,Ue)=>{var it=H(),at=t=>new Promise((o,i)=>{let a=new FileReader;a.onload=()=>{o(a.result)},a.onerror=({target:{error:{code:l}}})=>{i(Error(`File could not be read! Code=${l}`))},a.readAsArrayBuffer(t)});Ue.exports=t=>O(Te,null,function*(){let o=t;return typeof t=="undefined"?new Uint8Array:(typeof t=="string"?/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(t)?o=atob(t.split(",")[1]).split("").map(i=>i.charCodeAt(0)):o=yield(yield fetch(it(t))).arrayBuffer():(t instanceof File||t instanceof Blob)&&(o=yield at(t)),new Uint8Array(o))})});var ce=L((Tt,Be)=>{var st=Ce(),ft=Re(),lt=Ae();Be.exports={defaultOptions:st,getCreateFFmpegCore:ft,fetchFile:lt}});var Ie=L((Ne,$e)=>{var{defaultArgs:ct,baseOptions:ut}=ye(),{setLogging:_e,setCustomLogger:Ge,log:q}=oe(),pt=je(),ht=ke(),{defaultOptions:mt,getCreateFFmpegCore:dt}=ce(),{version:gt}=se(),ue=Error("ffmpeg.wasm is not ready, make sure you have completed load().");$e.exports=(t={})=>{let k=Y(Y(Y({},ut),mt),t),{log:o,logger:i,progress:a}=k,l=ge(k,["log","logger","progress"]),c=null,m=null,p=null,d=!1,g=a,M=h=>{h==="FFMPEG_END"&&p!==null&&(p(),p=null,d=!1)},R=({type:h,message:v})=>{q(h,v),pt(v,g),M(v)},x=()=>O(Ne,null,function*(){if(q("info","load ffmpeg-core"),c===null){q("info","loading ffmpeg-core");let{createFFmpegCore:h,corePath:v,workerPath:w,wasmPath:j}=yield dt(l);c=yield h({mainScriptUrlOrBlob:v,printErr:P=>R({type:"fferr",message:P}),print:P=>R({type:"ffout",message:P}),locateFile:(P,A)=>{if(typeof window!="undefined"){if(typeof j!="undefined"&&P.endsWith("ffmpeg-core.wasm"))return j;if(typeof w!="undefined"&&P.endsWith("ffmpeg-core.worker.js"))return w}return A+P}}),m=c.cwrap("proxy_main","number",["number","number"]),q("info","ffmpeg-core loaded")}else throw Error("ffmpeg.wasm was loaded, you should not load it again, use ffmpeg.isLoaded() to check next time.")}),V=()=>c!==null,W=(...h)=>{if(q("info",`run ffmpeg command: ${h.join(" ")}`),c===null)throw ue;if(d)throw Error("ffmpeg.wasm can only run one command at a time");return d=!0,new Promise(v=>{let w=[...ct,...h].filter(j=>j.length!==0);p=v,m(...ht(c,w))})},T=(h,...v)=>{if(q("info",`run FS.${h} ${v.map(w=>typeof w=="string"?w:`<${w.length} bytes binary file>`).join(" ")}`),c===null)throw ue;{let w=null;try{w=c.FS[h](...v)}catch(j){throw Error(h==="readdir"?`ffmpeg.FS('readdir', '${v[0]}') error. Check if the path exists, ex: ffmpeg.FS('readdir', '/')`:h==="readFile"?`ffmpeg.FS('readFile', '${v[0]}') error. Check if the path exists`:"Oops, something went wrong in FS operation.")}return w}},F=()=>{if(c===null)throw ue;d=!1,c.exit(1),c=null,m=null,p=null},_=h=>{g=h},U=h=>{Ge(h)};return _e(o),Ge(i),q("info",`use ffmpeg.wasm v${gt}`),{setProgress:_,setLogger:U,setLogging:_e,load:x,isLoaded:V,run:W,exit:F,FS:T}}});var xe=L((At,Me)=>{ve();var vt=Ie(),{fetchFile:wt}=ce();Me.exports={createFFmpeg:vt,fetchFile:wt}});var bt=L(De=>{var z=Qe(xe()),B=(0,z.createFFmpeg)({log:!0}),We=document.getElementById("fileInput"),yt=document.getElementById("convertButton"),I=document.getElementById("output");yt.addEventListener("click",()=>O(De,null,function*(){var i;if(!((i=We.files)!=null&&i.length)){alert("Please select an mp3 file.");return}let t=We.files[0];I.textContent="Converting...",B.isLoaded()||(yield B.load()),B.FS("writeFile","input.mp3",yield(0,z.fetchFile)(t));let o="";B.setLogger(({type:a,message:l})=>{(a==="fferr"||a==="ffout")&&(o+=l+`
`)});try{yield B.run("-i","input.mp3","-filter_complex","showfreqs=s=1280x720:mode=line","output.png");let a=B.FS("readFile","output.png"),l=new Blob([a.buffer],{type:"image/png"}),c=URL.createObjectURL(l),m=document.createElement("img");m.src=c,I.appendChild(m);let p=document.createElement("a");p.href=c,p.download="output.png",p.textContent="Download Frequency Spectrum",I.appendChild(p),I.textContent="Conversion complete!"}catch(a){I.textContent="Error occurred during conversion.",console.error("FFmpeg error:",a),console.error("FFmpeg log:",o)}}))});bt();})();
//# sourceMappingURL=main.js.map
