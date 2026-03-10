const dbc = require('deathbycaptcha-lib');

const args = process.argv;

const username = args[2];     // DBC account username
const password = args[3];     // DBC account password
const clienttype = args[4];
var client;

if (clienttype === "HTTP"){
  console.log("Using http client");
  client = new dbc.HttpClient(username, password);
}else{
  console.log("using sockets client")
  client = new dbc.SocketClient(username, password);  
}

// Get user balance
client.get_balance((balance) => {
  console.log(balance);
});
