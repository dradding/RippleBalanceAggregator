/* Loading ripple-lib with Node.js */
var Remote = require('ripple-lib').Remote;
var prompt = require('prompt');

var total_XRP = 0; //Cumulative XRP balance
var total_balances = {}; //Cumulative IOU balances
var XRP = 0; //XRP balance for the current wallet
var balances = {}; //Cumulative IOU balances for the current wallet

var properties = [
    {
      name: 'wallet', 
      validator: /^[0-9a-zA-Z]+$/, //Only allow alphanumeric characters
      warning: 'Ripple Addresses are alphanumeric only'
    }
  ];

console.log('Welcome to the Ripple Wallet Balance Aggregator. Enter \'clear\' to start over. Enter \'exit\' to exit. \nCreated by Daniel Radding \n*************************');

startPrompt(); //Use prompt to ask for wallet addresses

function startPrompt(){	
	prompt.start();

	prompt.get(properties, function (err, result) {
	  if (err) { 
	  	console.log(err);
	  	console.log('The was an error caused by the \'prompt\' module.')
	  	startPrompt();
	  	return; }
	  else if (result.wallet.toLowerCase() === 'clear'){
	  	console.log('Aggregate balances cleared');
	  	total_XRP = 0;
	  	total_balances = {}
	  	startPrompt();
	  }
	  else if (result.wallet.toLowerCase() === 'exit'){
	  	process.exit();
	  } else {
	  getBalances(result.wallet);
			}
	});
}

function getBalances(wallet){ //This function actually calls Ripple-Lib to get information from the network
	var remote = new Remote({
	  // see the API Reference for available options
	  servers: [ 'wss://s1.ripple.com:443' ]
	});
	remote.connect(function() {
	  var options = {
	  	account: wallet,
	  	ledger: 'validated'
	  };
	  //First get XRP balance with account_info
	  var request1 = remote.requestAccountInfo(options, function(err, info) {
	  	if (err) { 
	  		console.log(err.remote.error_message);
	 		  startPrompt();
	  		return; 
	  	}
	  	XRP = parseFloat(info.account_data.Balance); //Set the XRP value
	 		total_XRP += parseFloat(info.account_data.Balance); //Set the XRP value
	  });
	  //Next get IOU balances by process account_lines
	  var request2 = remote.requestAccountLines(options, function(err, info) {
	  	balances = {} //Clear balances from previous wallet balance
	  	if (err) { 
	  		return; //It is *extremely* unlikely the network will go out between request1 and request2.
	  	}
		 	var lines = info.lines.length;
		 	for (i=0; i<lines; i++){ //Loop through each trustline
		 		//if currency in balances, update
		 		currency = info.lines[i].currency;
		 		balance = info.lines[i].balance;
		 		if (currency in balances) { //Update individual wallet balance and aggregate balance
		 			balances[currency] += parseFloat(balance);
		 			total_balances[currency] += parseFloat(balance);
		 		} else { //Otherwise add the currency to balances and check to see if already in total_balances
		 			if (! (currency in total_balances)){
		 				balances[currency] = parseFloat(balance);
		 				total_balances[currency] = parseFloat(balance);
		 			}
		 			else{
		 				balances[currency] = parseFloat(balance);
		 				total_balances[currency] += parseFloat(balance);
		 			}
		 		}
	 	}
		console.log('Balances for wallet ' + options.account + ':' 
		+ '\n' + 'XRP: ' + XRP);
	 	for (key in balances){
	 		console.log(key + ": " + balances[key])
	 	}
	 	console.log('--------------------')
	 	console.log('Total balances:' 
		+ '\n' + 'XRP: ' + total_XRP);
	 	for (key in total_balances){
	 		console.log(key + ": " + total_balances[key])
	 	}
	 	
	 	console.log("\n"); //for readability

	 	startPrompt();
	  });
	});
}

function onErr(err) { //Used to handle errors from Ripple-Lib
    console.log(err.remote.error_message);
	  startPrompt();
}