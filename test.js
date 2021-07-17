const target = '"result":"MOK"'

const res = '<br /><b>Warning</b>:  mssql_fetch_assoc(): supplied argument is not a valid MS SQL-result resource in <b>/home/minigold/public_html/point/function_mssql.php</b> on line <b>80</b><br />{"result":"OK"} userid:tt11, point:100'

console.log(res.includes(target))