"use strict";(()=>{var ze=Object.create;var X=Object.defineProperty;var Ve=Object.getOwnPropertyDescriptor;var Je=Object.getOwnPropertyNames,D=Object.getOwnPropertySymbols,Ze=Object.getPrototypeOf,ee=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable;var me=(t,n,i)=>n in t?X(t,n,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[n]=i,Y=(t,n)=>{for(var i in n||(n={}))ee.call(n,i)&&me(t,i,n[i]);if(D)for(var i of D(n))de.call(n,i)&&me(t,i,n[i]);return t};var ge=(t,n)=>{var i={};for(var a in t)ee.call(t,a)&&n.indexOf(a)<0&&(i[a]=t[a]);if(t!=null&&D)for(var a of D(t))n.indexOf(a)<0&&de.call(t,a)&&(i[a]=t[a]);return i};var L=(t,n)=>()=>(n||t((n={exports:{}}).exports,n),n.exports);var Ke=(t,n,i,a)=>{if(n&&typeof n=="object"||typeof n=="function")for(let f of Je(n))!ee.call(t,f)&&f!==i&&X(t,f,{get:()=>n[f],enumerable:!(a=Ve(n,f))||a.enumerable});return t};var Qe=(t,n,i)=>(i=t!=null?ze(Ze(t)):{},Ke(n||!t||!t.__esModule?X(i,"default",{value:t,enumerable:!0}):i,t));var O=(t,n,i)=>new Promise((a,f)=>{var c=d=>{try{p(i.next(d))}catch(g){f(g)}},h=d=>{try{p(i.throw(d))}catch(g){f(g)}},p=d=>d.done?a(d.value):Promise.resolve(d.value).then(c,h);p((i=i.apply(t,n)).next())});var ve=L((Lt,re)=>{var te=function(t){"use strict";var n=Object.prototype,i=n.hasOwnProperty,a=Object.defineProperty||function(r,e,o){r[e]=o.value},f,c=typeof Symbol=="function"?Symbol:{},h=c.iterator||"@@iterator",p=c.asyncIterator||"@@asyncIterator",d=c.toStringTag||"@@toStringTag";function g(r,e,o){return Object.defineProperty(r,e,{value:o,enumerable:!0,configurable:!0,writable:!0}),r[e]}try{g({},"")}catch(r){g=function(e,o,l){return e[o]=l}}function M(r,e,o,l){var s=e&&e.prototype instanceof _?e:_,u=Object.create(s.prototype),y=new Z(l||[]);return a(u,"_invoke",{value:Ye(r,o,y)}),u}t.wrap=M;function R(r,e,o){try{return{type:"normal",arg:r.call(e,o)}}catch(l){return{type:"throw",arg:l}}}var x="suspendedStart",V="suspendedYield",W="executing",T="completed",F={};function _(){}function U(){}function k(){}var m={};g(m,h,function(){return this});var v=Object.getPrototypeOf,w=v&&v(v(K([])));w&&w!==n&&i.call(w,h)&&(m=w);var j=k.prototype=_.prototype=Object.create(m);U.prototype=k,a(j,"constructor",{value:k,configurable:!0}),a(k,"constructor",{value:U,configurable:!0}),U.displayName=g(k,d,"GeneratorFunction");function P(r){["next","throw","return"].forEach(function(e){g(r,e,function(o){return this._invoke(e,o)})})}t.isGeneratorFunction=function(r){var e=typeof r=="function"&&r.constructor;return e?e===U||(e.displayName||e.name)==="GeneratorFunction":!1},t.mark=function(r){return Object.setPrototypeOf?Object.setPrototypeOf(r,k):(r.__proto__=k,g(r,d,"GeneratorFunction")),r.prototype=Object.create(j),r},t.awrap=function(r){return{__await:r}};function A(r,e){function o(u,y,b,S){var E=R(r[u],r,y);if(E.type==="throw")S(E.arg);else{var Q=E.arg,G=Q.value;return G&&typeof G=="object"&&i.call(G,"__await")?e.resolve(G.__await).then(function(C){o("next",C,b,S)},function(C){o("throw",C,b,S)}):e.resolve(G).then(function(C){Q.value=C,b(Q)},function(C){return o("throw",C,b,S)})}}var l;function s(u,y){function b(){return new e(function(S,E){o(u,y,S,E)})}return l=l?l.then(b,b):b()}a(this,"_invoke",{value:s})}P(A.prototype),g(A.prototype,p,function(){return this}),t.AsyncIterator=A,t.async=function(r,e,o,l,s){s===void 0&&(s=Promise);var u=new A(M(r,e,o,l),s);return t.isGeneratorFunction(e)?u:u.next().then(function(y){return y.done?y.value:u.next()})};function Ye(r,e,o){var l=x;return function(u,y){if(l===W)throw new Error("Generator is already running");if(l===T){if(u==="throw")throw y;return he()}for(o.method=u,o.arg=y;;){var b=o.delegate;if(b){var S=pe(b,o);if(S){if(S===F)continue;return S}}if(o.method==="next")o.sent=o._sent=o.arg;else if(o.method==="throw"){if(l===x)throw l=T,o.arg;o.dispatchException(o.arg)}else o.method==="return"&&o.abrupt("return",o.arg);l=W;var E=R(r,e,o);if(E.type==="normal"){if(l=o.done?T:V,E.arg===F)continue;return{value:E.arg,done:o.done}}else E.type==="throw"&&(l=T,o.method="throw",o.arg=E.arg)}}}function pe(r,e){var o=e.method,l=r.iterator[o];if(l===f)return e.delegate=null,o==="throw"&&r.iterator.return&&(e.method="return",e.arg=f,pe(r,e),e.method==="throw")||o!=="return"&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+o+"' method")),F;var s=R(l,r.iterator,e.arg);if(s.type==="throw")return e.method="throw",e.arg=s.arg,e.delegate=null,F;var u=s.arg;if(!u)return e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,F;if(u.done)e[r.resultName]=u.value,e.next=r.nextLoc,e.method!=="return"&&(e.method="next",e.arg=f);else return u;return e.delegate=null,F}P(j),g(j,d,"Generator"),g(j,h,function(){return this}),g(j,"toString",function(){return"[object Generator]"});function He(r){var e={tryLoc:r[0]};1 in r&&(e.catchLoc=r[1]),2 in r&&(e.finallyLoc=r[2],e.afterLoc=r[3]),this.tryEntries.push(e)}function J(r){var e=r.completion||{};e.type="normal",delete e.arg,r.completion=e}function Z(r){this.tryEntries=[{tryLoc:"root"}],r.forEach(He,this),this.reset(!0)}t.keys=function(r){var e=Object(r),o=[];for(var l in e)o.push(l);return o.reverse(),function s(){for(;o.length;){var u=o.pop();if(u in e)return s.value=u,s.done=!1,s}return s.done=!0,s}};function K(r){if(r){var e=r[h];if(e)return e.call(r);if(typeof r.next=="function")return r;if(!isNaN(r.length)){var o=-1,l=function s(){for(;++o<r.length;)if(i.call(r,o))return s.value=r[o],s.done=!1,s;return s.value=f,s.done=!0,s};return l.next=l}}return{next:he}}t.values=K;function he(){return{value:f,done:!0}}return Z.prototype={constructor:Z,reset:function(r){if(this.prev=0,this.next=0,this.sent=this._sent=f,this.done=!1,this.delegate=null,this.method="next",this.arg=f,this.tryEntries.forEach(J),!r)for(var e in this)e.charAt(0)==="t"&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=f)},stop:function(){this.done=!0;var r=this.tryEntries[0],e=r.completion;if(e.type==="throw")throw e.arg;return this.rval},dispatchException:function(r){if(this.done)throw r;var e=this;function o(S,E){return u.type="throw",u.arg=r,e.next=S,E&&(e.method="next",e.arg=f),!!E}for(var l=this.tryEntries.length-1;l>=0;--l){var s=this.tryEntries[l],u=s.completion;if(s.tryLoc==="root")return o("end");if(s.tryLoc<=this.prev){var y=i.call(s,"catchLoc"),b=i.call(s,"finallyLoc");if(y&&b){if(this.prev<s.catchLoc)return o(s.catchLoc,!0);if(this.prev<s.finallyLoc)return o(s.finallyLoc)}else if(y){if(this.prev<s.catchLoc)return o(s.catchLoc,!0)}else if(b){if(this.prev<s.finallyLoc)return o(s.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(r,e){for(var o=this.tryEntries.length-1;o>=0;--o){var l=this.tryEntries[o];if(l.tryLoc<=this.prev&&i.call(l,"finallyLoc")&&this.prev<l.finallyLoc){var s=l;break}}s&&(r==="break"||r==="continue")&&s.tryLoc<=e&&e<=s.finallyLoc&&(s=null);var u=s?s.completion:{};return u.type=r,u.arg=e,s?(this.method="next",this.next=s.finallyLoc,F):this.complete(u)},complete:function(r,e){if(r.type==="throw")throw r.arg;return r.type==="break"||r.type==="continue"?this.next=r.arg:r.type==="return"?(this.rval=this.arg=r.arg,this.method="return",this.next="end"):r.type==="normal"&&e&&(this.next=e),F},finish:function(r){for(var e=this.tryEntries.length-1;e>=0;--e){var o=this.tryEntries[e];if(o.finallyLoc===r)return this.complete(o.completion,o.afterLoc),J(o),F}},catch:function(r){for(var e=this.tryEntries.length-1;e>=0;--e){var o=this.tryEntries[e];if(o.tryLoc===r){var l=o.completion;if(l.type==="throw"){var s=l.arg;J(o)}return s}}throw new Error("illegal catch attempt")},delegateYield:function(r,e,o){return this.delegate={iterator:K(r),resultName:e,nextLoc:o},this.method==="next"&&(this.arg=f),F}},t}(typeof re=="object"?re.exports:{});try{regeneratorRuntime=te}catch(t){typeof globalThis=="object"?globalThis.regeneratorRuntime=te:Function("r","regeneratorRuntime = r")(te)}});var ye=L((Ft,we)=>{we.exports={defaultArgs:["./ffmpeg","-nostdin","-y"],baseOptions:{log:!1,logger:()=>{},progress:()=>{},corePath:""}}});var ne=L((jt,Ee)=>{var oe=!1,be=()=>{},Xe=t=>{oe=t},et=t=>{be=t},tt=(t,n)=>{be({type:t,message:n}),oe&&console.log(`[${t}] ${n}`)};Ee.exports={logging:oe,setLogging:Xe,setCustomLogger:et,log:tt}});var je=L((St,Fe)=>{var N=0,ie=0,Le=t=>{let[n,i,a]=t.split(":");return parseFloat(n)*60*60+parseFloat(i)*60+parseFloat(a)};Fe.exports=(t,n)=>{if(typeof t=="string")if(t.startsWith("  Duration")){let i=t.split(", ")[0].split(": ")[1],a=Le(i);n({duration:a,ratio:ie}),(N===0||N>a)&&(N=a)}else if(t.startsWith("frame")||t.startsWith("size")){let i=t.split("time=")[1].split(" ")[0],a=Le(i);ie=a/N,n({ratio:ie,time:a})}else t.startsWith("video:")&&(n({ratio:1}),N=0)}});var ke=L((kt,Se)=>{Se.exports=(t,n)=>{let i=t._malloc(n.length*Uint32Array.BYTES_PER_ELEMENT);return n.forEach((a,f)=>{let c=t._malloc(a.length+1);t.writeAsciiToMemory(a,c),t.setValue(i+Uint32Array.BYTES_PER_ELEMENT*f,c,"i32")}),[n.length,i]}});var H=L((ae,Pe)=>{(function(t,n){typeof define=="function"&&define.amd?define(n):typeof ae=="object"?Pe.exports=n():t.resolveUrl=n()})(ae,function(){function t(){var n=arguments.length;if(n===0)throw new Error("resolveUrl requires at least one argument; got none.");var i=document.createElement("base");if(i.href=arguments[0],n===1)return i.href;var a=document.getElementsByTagName("head")[0];a.insertBefore(i,a.firstChild);for(var f=document.createElement("a"),c,h=1;h<n;h++)f.href=arguments[h],c=f.href,i.href=c;return a.removeChild(i),c}return t})});var se=L((Pt,rt)=>{rt.exports={name:"@ffmpeg/ffmpeg",version:"0.10.1",description:"FFmpeg WebAssembly version",main:"src/index.js",types:"src/index.d.ts",directories:{example:"examples"},scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js",prepublishOnly:"npm run build",lint:"eslint src",wait:"rimraf dist && wait-on http://localhost:3000/dist/ffmpeg.dev.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser:ffmpeg test:node:all","test:node":"node --experimental-wasm-threads --experimental-wasm-bulk-memory node_modules/.bin/_mocha --exit --bail --require ./scripts/test-helper.js","test:node:all":"npm run test:node -- ./tests/*.test.js","test:browser":"mocha-headless-chrome -a allow-file-access-from-files -a incognito -a no-sandbox -a disable-setuid-sandbox -a disable-logging -t 300000","test:browser:ffmpeg":"npm run test:browser -- -f ./tests/ffmpeg.test.html"},browser:{"./src/node/index.js":"./src/browser/index.js"},repository:{type:"git",url:"git+https://github.com/ffmpegwasm/ffmpeg.wasm.git"},keywords:["ffmpeg","WebAssembly","video"],author:"Jerome Wu <jeromewus@gmail.com>",license:"MIT",bugs:{url:"https://github.com/ffmpegwasm/ffmpeg.wasm/issues"},engines:{node:">=12.16.1"},homepage:"https://github.com/ffmpegwasm/ffmpeg.wasm#readme",dependencies:{"is-url":"^1.2.4","node-fetch":"^2.6.1","regenerator-runtime":"^0.13.7","resolve-url":"^0.2.1"},devDependencies:{"@babel/core":"^7.12.3","@babel/preset-env":"^7.12.1","@ffmpeg/core":"^0.10.0","@types/emscripten":"^1.39.4","babel-loader":"^8.1.0",chai:"^4.2.0",cors:"^2.8.5",eslint:"^7.12.1","eslint-config-airbnb-base":"^14.1.0","eslint-plugin-import":"^2.22.1",express:"^4.17.1",mocha:"^8.2.1","mocha-headless-chrome":"^2.0.3","npm-run-all":"^4.1.5","wait-on":"^5.3.0",webpack:"^5.3.2","webpack-cli":"^4.1.0","webpack-dev-middleware":"^4.0.0"}}});var Ce=L((Ct,Oe)=>{var Ot=H(),{devDependencies:ot}=se();Oe.exports={corePath:`https://unpkg.com/@ffmpeg/core@${ot["@ffmpeg/core"].substring(1)}/dist/ffmpeg-core.js`}});var Re=L((fe,qe)=>{var nt=H(),{log:$}=ne(),le=(t,n)=>O(fe,null,function*(){$("info",`fetch ${t}`);let i=yield(yield fetch(t)).arrayBuffer();$("info",`${t} file size = ${i.byteLength} bytes`);let a=new Blob([i],{type:n}),f=URL.createObjectURL(a);return $("info",`${t} blob URL = ${f}`),f});qe.exports=n=>O(fe,[n],function*({corePath:t}){if(typeof t!="string")throw Error("corePath should be a string!");let i=nt(t),a=yield le(i,"application/javascript"),f=yield le(i.replace("ffmpeg-core.js","ffmpeg-core.wasm"),"application/wasm"),c=yield le(i.replace("ffmpeg-core.js","ffmpeg-core.worker.js"),"application/javascript");return typeof createFFmpegCore=="undefined"?new Promise(h=>{let p=document.createElement("script"),d=()=>{p.removeEventListener("load",d),$("info","ffmpeg-core.js script loaded"),h({createFFmpegCore,corePath:a,wasmPath:f,workerPath:c})};p.src=a,p.type="text/javascript",p.addEventListener("load",d),document.getElementsByTagName("head")[0].appendChild(p)}):($("info","ffmpeg-core.js script is loaded already"),Promise.resolve({createFFmpegCore,corePath:a,wasmPath:f,workerPath:c}))})});var Ae=L((Te,Ue)=>{var it=H(),at=t=>new Promise((n,i)=>{let a=new FileReader;a.onload=()=>{n(a.result)},a.onerror=({target:{error:{code:f}}})=>{i(Error(`File could not be read! Code=${f}`))},a.readAsArrayBuffer(t)});Ue.exports=t=>O(Te,null,function*(){let n=t;return typeof t=="undefined"?new Uint8Array:(typeof t=="string"?/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(t)?n=atob(t.split(",")[1]).split("").map(i=>i.charCodeAt(0)):n=yield(yield fetch(it(t))).arrayBuffer():(t instanceof File||t instanceof Blob)&&(n=yield at(t)),new Uint8Array(n))})});var ce=L((Tt,Be)=>{var st=Ce(),lt=Re(),ft=Ae();Be.exports={defaultOptions:st,getCreateFFmpegCore:lt,fetchFile:ft}});var Ie=L((Ne,$e)=>{var{defaultArgs:ct,baseOptions:ut}=ye(),{setLogging:_e,setCustomLogger:Ge,log:q}=ne(),pt=je(),ht=ke(),{defaultOptions:mt,getCreateFFmpegCore:dt}=ce(),{version:gt}=se(),ue=Error("ffmpeg.wasm is not ready, make sure you have completed load().");$e.exports=(t={})=>{let k=Y(Y(Y({},ut),mt),t),{log:n,logger:i,progress:a}=k,f=ge(k,["log","logger","progress"]),c=null,h=null,p=null,d=!1,g=a,M=m=>{m==="FFMPEG_END"&&p!==null&&(p(),p=null,d=!1)},R=({type:m,message:v})=>{q(m,v),pt(v,g),M(v)},x=()=>O(Ne,null,function*(){if(q("info","load ffmpeg-core"),c===null){q("info","loading ffmpeg-core");let{createFFmpegCore:m,corePath:v,workerPath:w,wasmPath:j}=yield dt(f);c=yield m({mainScriptUrlOrBlob:v,printErr:P=>R({type:"fferr",message:P}),print:P=>R({type:"ffout",message:P}),locateFile:(P,A)=>{if(typeof window!="undefined"){if(typeof j!="undefined"&&P.endsWith("ffmpeg-core.wasm"))return j;if(typeof w!="undefined"&&P.endsWith("ffmpeg-core.worker.js"))return w}return A+P}}),h=c.cwrap("proxy_main","number",["number","number"]),q("info","ffmpeg-core loaded")}else throw Error("ffmpeg.wasm was loaded, you should not load it again, use ffmpeg.isLoaded() to check next time.")}),V=()=>c!==null,W=(...m)=>{if(q("info",`run ffmpeg command: ${m.join(" ")}`),c===null)throw ue;if(d)throw Error("ffmpeg.wasm can only run one command at a time");return d=!0,new Promise(v=>{let w=[...ct,...m].filter(j=>j.length!==0);p=v,h(...ht(c,w))})},T=(m,...v)=>{if(q("info",`run FS.${m} ${v.map(w=>typeof w=="string"?w:`<${w.length} bytes binary file>`).join(" ")}`),c===null)throw ue;{let w=null;try{w=c.FS[m](...v)}catch(j){throw Error(m==="readdir"?`ffmpeg.FS('readdir', '${v[0]}') error. Check if the path exists, ex: ffmpeg.FS('readdir', '/')`:m==="readFile"?`ffmpeg.FS('readFile', '${v[0]}') error. Check if the path exists`:"Oops, something went wrong in FS operation.")}return w}},F=()=>{if(c===null)throw ue;d=!1,c.exit(1),c=null,h=null,p=null},_=m=>{g=m},U=m=>{Ge(m)};return _e(n),Ge(i),q("info",`use ffmpeg.wasm v${gt}`),{setProgress:_,setLogger:U,setLogging:_e,load:x,isLoaded:V,run:W,exit:F,FS:T}}});var xe=L((At,Me)=>{ve();var vt=Ie(),{fetchFile:wt}=ce();Me.exports={createFFmpeg:vt,fetchFile:wt}});var bt=L(De=>{var z=Qe(xe());console.log(1);var B=(0,z.createFFmpeg)({log:!0}),We=document.getElementById("fileInput"),yt=document.getElementById("convertButton"),I=document.getElementById("output");yt.addEventListener("click",()=>O(De,null,function*(){var i;if(!((i=We.files)!=null&&i.length)){alert("Please select an mp3 file.");return}let t=We.files[0];I.textContent="Converting...",B.isLoaded()||(yield B.load()),B.FS("writeFile","input.mp3",yield(0,z.fetchFile)(t));let n="";B.setLogger(({type:a,message:f})=>{(a==="fferr"||a==="ffout")&&(n+=f+`
`)});try{yield B.run("-i","input.mp3","-filter_complex","showfreqs=s=1280x720:mode=line","-frames:v","1","output.png");let a=B.FS("readFile","output.png"),f=new Blob([a.buffer],{type:"image/png"}),c=URL.createObjectURL(f),h=document.createElement("img");console.log(c),h.src=c,h.style.width="100%",h.style.height="auto",I.appendChild(h),console.log("Image element added to the page");let p=document.createElement("a");p.href=c,p.download="output.png",p.textContent="Download Frequency Spectrum",I.appendChild(p),I.textContent="Conversion complete!"}catch(a){I.textContent="Error occurred during conversion.",console.error("FFmpeg error:",a),console.error("FFmpeg log:",n)}}))});bt();})();
//# sourceMappingURL=main.js.map
