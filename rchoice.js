
// function race(list,p=.5) {
//   let ts = Math.round(list.length / p)
//   let idx = Math.floor(Math.random()*ts)
//   return {ts:ts,val:(idx<list.length)?list[idx]:0}
// }

// // console.log(race([1,2,3,4,5,6,7]))
let samplelist=[1,2,3,4,5,6,7]
// let nok=0
// for (var i=0;i<1000;i++) {
//   let t = race(samplelist,.2)
//   if (t.val==0) nok++
// }

// console.log(nok)

Array.prototype.choice = function(p=.5) {
  if (p==0) return null
  let ts = Math.round(this.length / p)
  let idx = Math.floor(Math.random()*ts)
  return (idx<this.length)?this[idx]:null
}

let nok=0
for (var i=0;i<1000;i++) {
    if (!samplelist.choice(.001)) nok++
}

console.log(nok)
