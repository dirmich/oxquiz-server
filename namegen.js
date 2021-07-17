const faker = require('faker')

// faker.locale = "ko"


function makeEmail() { 
  var strValues="abcdefg12345"; 
  var strEmail = ""; 
  var strTmp; 
  for (var i=0;i<10;i++) { 
  strTmp = strValues.charAt(Math.round(strValues.length*Math.random())); 
  strEmail = strEmail + strTmp; 
  } 
  strTmp = ""; 
  strEmail = strEmail + "@"; 
  for (var j=0;j<8;j++) { 
  strTmp = strValues.charAt(Math.round(strValues.length*Math.random())); 
  strEmail = strEmail + strTmp; 
  } 
  strEmail = strEmail + ".com" 
  return strEmail; 
} 


function genNumber(size) {
  let n = "1"+("0000000000".substr(0,size))
  return Math.floor(Math.random()* Number(n))
}

function genPhone(dm='') {
  let ret=[]
  ret.push('010')
  ret.push(genNumber(4))
  ret.push(genNumber(4))
  return ret.join(dm)
}

function gen(count) {
  let ret=[]
  for (var i=0;i<count;i++)
    ret.push({
      name:faker.name.lastName()+faker.name.firstName(),
      email:faker.internet.email(),
      phone: genPhone('-'),
      addr:faker.address.streetAddress(true)
    })
  return ret
}


// console.log(gen(100))

// console.log(genNumber(1))

module.exports = {
  gen:gen
}