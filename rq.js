const rq = require('request-promise')

rq({
  method:'POST',
  uri: 'http://minigold.co.kr/game_api/insert.php',
  headers: {
    apiKey: 'yJK2zhH3CvPOvgrmYm0pFD3ovO1mEn02DDxFwFESJEVXSuMHIJ',
    userid: 'meinan05',
    point: 10
  }
}).then((r)=>{
  console.log(r)
}).catch((e)=>{
  console.error(e)
})