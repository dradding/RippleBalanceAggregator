/* Loading ripple-lib with Node.js */
var Remote = require('ripple-lib').Remote;
var prompt = require('prompt');

var XRP = 0;
var balances = {};

var properties = [
    {
      name: 'wallet', 
      validator: /^[0-9a-zA-Z]+$/,
      warning: 'Ripple Addresses are alphanumeric only'
    }
  ];

console.log('Welcome to the Ripple Wallet Balance Aggregator. Enter \'exit\' to exit. \nCreated by Daniel Radding \n*************************');

startPrompt();

function startPrompt(){	
	prompt.start();

	prompt.get(properties, function (err, result) {
	  if (err) { 
	  	console.log(err);
	  	startPrompt();
	  	return; }
	  else if (result.wallet.toLowerCase() === 'exit'){
	  	process.exit();
	  } else {
	  getBalances(result.wallet);
			}
	});
}

function getBalances(wallet){
	var remote = new Remote({
	  // see the API Reference for available options
	  servers: [ 'wss://s1.ripple.com:443' ]
	});
	remote.connect(function() {
	  /* remote connected 
	  remote.requestServerInfo(function(err, info) {
	  	//console.log(info)
	  });*/
	  var options = {
	  	account: wallet,
	  	ledger: 'validated'
	  }
	  //First get XRP balance with account_info
	  var request1 = remote.requestAccountInfo(options, function(err, info) {
	  	if (err) { return onErr(err); }
	 	//console.log(info)
	 	XRP = info.account_data.Balance;
	 	//console.log(XRP);
	  });
	  //Next get IOU balances by process account_lines
	  var request2 = remote.requestAccountLines(options, function(err, info) {
	  	balances = {}
	  	if (err) { return onErr(err); }
	  	//console.log(info.lines);
		 	var lines = info.lines.length;
		 	for (i=0; i<lines; i++){
		 		//if currency in balances, update
		 		currency = info.lines[i].currency;
		 		balance = info.lines[i].balance;
		 		if (currency in balances) {
		 			balances[currency] += parseFloat(balance);
		 		} else {
		 			balances[currency] = parseFloat(balance);
		 		}
	 		//console.log(balances)
	 		//else add currency to balances
	 	}
		console.log('Balances for wallet ' + options.account + ':' 
		+ '\n' + 'XRP: ' + XRP);
	 	for (key in balances){
	 		console.log(key + ": " + balances[key])
	 	}
	 	startPrompt();
	  });
	});
}

function onErr(err) {
    console.log(err.remote.error_message);
	  startPrompt();
}