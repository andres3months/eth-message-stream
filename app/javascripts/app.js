// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import messagestream_artifacts from '../../build/contracts/MessageStream.json'

// MessageStream is our usable abstraction, which we'll use through the code below.
var MessageStream = contract(messagestream_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    MessageStream.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();

    });

    var self = this;
    MessageStream.deployed().then(function(instance) {
      instance.MessageReceived().watch(function(err, result) {
        if(err) {return;}
        self.messageReceved(result.args.title, result.args.body);
      })
    });
  },

  refreshBalance: function() {
    var self = this;

    var balance = web3.fromWei(web3.eth.getBalance(account)); 

    var balance_element = document.getElementById("balance");
    balance_element.innerHTML = balance;

    var account_element = document.getElementById("account");
    account_element.innerHTML = account;
  
  },


  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  sendMessage: function(evt) {
    var title = document.getElementById("title").value;
    var body = document.getElementById("_body").value;

    MessageStream.deployed().then(function(instance) {
      return instance.sendMessage(title, body, {from: account});
    })
  },

  messageReceved: function(title, body) {
    var messages = document.getElementById("messages");
    var el = document.createElement("li")
      el.innerHTML = title+ ": "+ body;
    messages.appendChild(el);
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MessageStream, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.25:8545"));
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
