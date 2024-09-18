"use strict";(()=>{self.addEventListener("message",e=>{console.log("Worker received a message:",e.data),self.postMessage({type:"log",message:"Worker is running."})});})();
//# sourceMappingURL=worker.js.map
