#Ripple Balance Aggregator

###Overview

Ripple Balance Aggregator provides an easy way to see the aggregated balances for a single Ripple Wallet as well as over multiple Ripple Wallets.

###Quick Start

Run '''npm install''' to install depedencies and '''node server.js''' to start the server.

###Implementation:

I know Ripple is a JS/Node shop so I decided to build this in Node. Using Ripple Lib was a breeze between the documentation on Github, the WebSocket Tool, and the Ripple Charts Graph Tool. Additionally I didn't want to hardcode in any wallet addresses so I found a [prompt module](https://github.com/flatiron/prompt) to allow the users to enter in the wallet address.

###Explanation:

To get the XRP balance I simply pull the balance out of the JSON returned from the requestAccountInfo call.

To get the other balances was a little more work. Once I got the JSON response from requestAccountLines call I had to sort through the trustlines. I did this by maintaining an associative array that could be updated and added to for both the individual wallet as well as the aggregate balance. The key for each entry was a currency abbreviation and the value was the sum of IOUs given and recieved in that currency.

I also put in some basic error handling. All errors are caught and handled so the program does not crash. Additionally when the error is from Ripple-Lib, the error_message from the err JSON is printed. I also set the prompt module to only accept alphanumeric characters.

I did have some issues with negative floats. However it seems widely accepted that floats have issues in js.

###Time Spent:

Total time spend was around 3-4 hours. I don't know Javascript or Node fluently so I spent a lot of time learning syntax and conventions. Working with the API and writing the logic was probably the easiest part.