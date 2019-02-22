import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import FDS from 'fds';

window.FDS = new FDS({
  swarmGateway: 'http://209.97.190.111:8500',
  ethGateway: 'http://209.97.190.111:8545',
  faucetAddress: 'https://dfaucet-testnet-dev.herokuapp.com/gimmie',
  httpTimeout: 1000,
  gasPrice: 50,
  ensConfig: {
      domain: 'datafund.eth',
      registryAddress: '0x246d204ae4897e603b8cb498370dcbb2888213d1',
      fifsRegistrarContractAddress: '0xbbcfe6ccee58d3ebc82dcd4d772b2484d23d0a0b',
      resolverContractAddress: '0x79164c357f81627042d958533bba8a766c81f3d6'
  }
});

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const simulateTwo = () => {
  
  let r1 = Math.floor(Math.random() * 1010101);
  let r2 = Math.floor(Math.random() * 1010101);
  let account1, account2 = null;

  let account1name = "alice"+ r1;
  let account2name = "bob"+ r2;

  //consolelog("Creating accounts, testing storing values, messages, contacts, sending files"); 

  consolelog("creating account: " + account1name);
  window.FDS.CreateAccount(account1name, 'test', consolelog).then((account) => {
      account1 = account;
      window.appComponent.setAccount1(account1);
      consolelog("created account 1: " + account1.subdomain);
      
  }).then(() => {
      consolelog("creating account: " +  account2name);
      return window.FDS.CreateAccount(account2name, 'test', consolelog).then((account) => {
          account2 = account;
          window.appComponent.setAccount2(account2);
          consolelog("created account 2: " + account2.subdomain);
      })
  }).then(() => {
      return window.FDS.UnlockAccount(account1.subdomain, 'test').then((acc1) => {
        RunAccountTests(account1, account2);
      })
  }).then(() => {
      return window.FDS.UnlockAccount(account2.subdomain, 'test').then((acc2) => {
      })

  }).then(() => {
    return window.FDS.UnlockAccount(account1.subdomain, 'test').then((acc1) => {
    })
  }).then(() => {
    return window.FDS.UnlockAccount(account1.subdomain, 'test').then((acc1) => {
    })
  }).catch(console.error);
}

const RunAccountTests = async (account1, account2) => 
{
  await RunTests(account1, account2.subdomain);
  await RunTests(account2, account1.subdomain);
}

const RunTests = async (account, receiver) =>
{
  consolelog(`<<<<<<   ${account.subdomain} >>>>>>`);
  await TestStoreValue(account);
  await TestEncryptedStoreValue(account);

  
  await TestStoreFiles(account);
  
  await TestSendFile(account, receiver);  

  await TestMessages(account);
  await TestContacts(account, receiver); 
  consolelog(`>>>>>>   ${account.subdomain} <<<<<<`);
}

const TestSendFile = async (fromAccount, toAccountSubdomain) =>
{
  consolelog(`${fromAccount.subdomain} testing sending file to ${toAccountSubdomain}`);
  let r = Math.floor(Math.random() * 10101);
  let file = new File([`hello world 2${r} from ${fromAccount.subdomain} to ${toAccountSubdomain}`], `test${r}-snd.txt`, { type: 'text/plain' });

  let message = await fromAccount.send(toAccountSubdomain, file, consolelog, consolelog, consolelog);
  consolelog(`>>>> ${fromAccount.subdomain} sent ${message} to ${toAccountSubdomain}`);

  // promise.then version
  /*
  await fromAccount.send(toAccountSubdomain, file, consolelog, consolelog, consolelog).then((message) => {
    consolelog(`>>>> ${fromAccount.subdomain} sent ${message} to ${toAccountSubdomain}`);
  });
  */
} 

const TestStoreFiles = async (account) =>
{
  consolelog(`${account.subdomain} testing storing files`);

  for(let i=0;i<5;i++)
  {
    let r = Math.floor(Math.random() * 10101);
    let filename = `test${r}-snd.txt`;
    let file = new File([`hello world ${r} from ${account.subdomain}`], filename, { type: 'text/plain' });

    consolelog(`${account.subdomain} storing ${filename}`);
    let message = await account.store(file, consolelog, consolelog, consolelog);
    consolelog(`>>>> ${account.subdomain} stored file ${filename} in ${message}`);
  }

  consolelog(`${account.subdomain} testing retrieving stored files`);
  let stored = await account.stored();

  asyncForEach(stored, async (fileStored) =>{
    consolelog(`>>>> ${account.subdomain} retrieved stored ${fileStored.file.name}`);
      let file = await fileStored.getFile();
      consolelog(file.name);
  });

  // promise.then version
  /*
  for(let i=0;i<5;i++)
  {
    let r = Math.floor(Math.random() * 10101);
    let filename = `test${r}-snd.txt`;
    let file = new File([`hello world ${r} from ${account.subdomain}`], filename, { type: 'text/plain' });

    consolelog(`${account.subdomain} storing ${filename}`);
    await account.store(file, consolelog, consolelog, consolelog).then((message) => {
        consolelog(`>>>> ${account.subdomain} stored file ${filename} in ${message}`);
    });
  }

  consolelog(`${account.subdomain} testing retrieving stored files`);
  await account.stored().then((stored)=>{
    stored.forEach(fileStored => {
      consolelog(`>>>> ${account.subdomain} retrieved stored ${fileStored.file.name}`);
      fileStored.getFile().then(consolelog);
    });
  });*/
} 

const TestStoreValue = async (account) =>
{
    consolelog(`${account.subdomain} testing store value`);
    let stored = await account.storeValue('key1', 'hello value world');
    consolelog(`>>>> ${account.subdomain} stored ${stored}`);
    await TestRetrieveValue(account);

    // promise.then version
    /*await account.storeValue('key1', 'hello value world').then((stored) => {
      consolelog(`>>>> ${account.subdomain} stored ${stored}`);
      TestRetrieveValue(account);
    });*/
} 

const TestRetrieveValue = async (account) =>
{
    consolelog(`${account.subdomain} testing retrieve store value`);
    let stored = await account.retrieveValue('key1');
    consolelog(`>>>> ${account.subdomain} retrieved value ${stored}`);

    // promise.then version
    /*
    await account.retrieveValue('key1').then((stored) => {
        consolelog(`>>>> ${account.subdomain} retrieved value ${stored}`);
    }); */
}

const TestEncryptedStoreValue = async (account) =>
{
    consolelog(`${account.subdomain} testing encrypted store value`);
    let stored = await account.storeEncryptedValue('key2', 'hello encrypted value world');
    consolelog(`>>>> ${account.subdomain} stored encrypted value in ${stored}`);
    await TestEncryptedRetrieveValue(account);

    // promise.then version
    /*
    await account.storeEncryptedValue('key2', 'hello encrypted value world').then((stored) => {
        consolelog(`>>>> ${account.subdomain} stored encrypted value in ${stored}`);
        TestEncryptedRetrieveValue(account);
    });*/
} 

const TestEncryptedRetrieveValue = async (account) =>
{
    consolelog(`${account.subdomain} testing retrieve encrypted store value`);
    let stored = await account.retrieveDecryptedValue('key2');
    consolelog(`>>>> ${account.subdomain} retrieved encrypted: ${stored}`);

    // promise.then version
    /*
    await account.retrieveDecryptedValue('key2').then((stored) => {
        consolelog(`>>>> ${account.subdomain} retrieved encrypted: ${stored}`);
    });
    */
} 

const TestMessages = async (account) =>
{
    consolelog(`${account.subdomain} testing messages`);
    let messages = await account.messages();
    
    consolelog(`${account.subdomain} got ${messages.length} messages`);

    asyncForEach(messages, async (message) =>{
      //consolelog(`>>>> ${account.subdomain} message ${JSON.stringify(message)}`);
        let file = await message.getFile();
        consolelog(`${file.name} from:${message.from}`);
        // file.saveAs(); // can be used
    });

    // promise.then version
    /*
    await account.messages().then((messages)=>{
      consolelog(`${account.subdomain} got ${messages.length} messages`);
        messages.forEach(message => {
            message.getFile().then(consolelog)
            //message.saveAs();
        });
    }); */
} 

const TestContacts = async (account, subdomainToLookup) =>
{
  consolelog(`${account.subdomain} looking up contact ${subdomainToLookup}`);

  let contact = await account.lookupContact(subdomainToLookup, consolelog, consolelog, consolelog)
  consolelog(`>>>>>>> ${account.subdomain} Contact:${contact.subdomain} publicKey:${contact.publicKey} mailbox:${contact.mailboxAddress} feed:${contact.feedLocationHash}`);

  let contacts = await account.getContacts();
  consolelog(`${account.subdomain} contacts: ${contacts.length}`);
  contacts.forEach(contact => {
     consolelog(`>>>>>>>  Contact:${contact.subdomain} publicKey:${contact.publicKey} mailbox:${contact.mailboxAddress} feed:${contact.feedLocationHash}`);
  });

  // promise.then version
  /*
  await account.lookupContact(subdomainToLookup, consolelog, consolelog, consolelog).then((contact) => {
      consolelog(`>>>>>>> ${account.subdomain} Contact:${contact.subdomain} publicKey:${contact.publicKey} mailbox:${contact.mailboxAddress} feed:${contact.feedLocationHash}`);
  });

  await account.getContacts().then((contacts)=>{
    consolelog(`${account.subdomain} contacts: ${contacts.length}`);
    contacts.forEach(contact => {
      consolelog(`>>>>>>>  Contact:${contact.subdomain} publicKey:${contact.publicKey} mailbox:${contact.mailboxAddress} feed:${contact.feedLocationHash}`);
    });
  }); */
} 

/** just a proxy method to send to react component */
let consolelog = (e) =>
{
  console.log(e); 
  if(window.appComponent)
     window.appComponent.addMessage(e);
}

// start testing 
// simulateTwo();
const sendFrom1To2 = async () => {
  await window.appComponent.cleanMessages();
  let a1 = window.appComponent.state.account1;
  let a2 = window.appComponent.state.account2;
  if(a1 == null || a2 == null)
  {
    consolelog("create accounts first");
    return;
  }

  await TestSendFile(a1, a2.subdomain);  
  await TestMessages(a2);
}
const sendFrom2To1 = async () => {
  await window.appComponent.cleanMessages();
  let a1 = window.appComponent.state.account1;
  let a2 = window.appComponent.state.account2;
  if(a1 == null || a2 == null)
  {
    consolelog("create accounts first");
    return;
  }
  await TestSendFile(a2, a1.subdomain);  
  await TestMessages(a1);
}

class App extends Component {
  constructor(props, context)
  {
    super(props);
    window.appComponent = this; // quick hack to show messages

    this.state =  { viewMessages: [], 
       account1: null,
       account2: null 
    }
  }

  addMessage(e) {
    this.setState({ viewMessages: [...this.state.viewMessages, e.toString()]});
  }
  cleanMessages() 
  {  
    this.setState({ viewMessages: []}); 
  }
  setAccount1(acc1) {  
    this.setState({ account1: acc1 });  
  }
  setAccount2(acc2) {  
    this.setState({ account2: acc2 });  
  }

  renderAccount(account) 
  {
    if(account==null) return (<p>"no account"</p>); 

    return (
       <p>account.subdomain</p>
    );
  }

  render() {
    return (
      <div className="App">
      <button onClick={simulateTwo}> Create Alice and Bob and run tests </button><br />
      <Account account={this.state.account1} text="send to Bob" onClick={sendFrom1To2}/> <br />
      <Account account={this.state.account2} text="send to Alice" onClick={sendFrom2To1}/> <br />
      
      <h5>output</h5>
        {this.state.viewMessages.map(txt =><small>{txt}<br/></small> )}
      </div>
    ); 
  }
}

class Account extends React.Component {
  render () {
    let subdomain = this.props.account==null ? "account not created" : this.props.account.subdomain;
    let button = this.props.account==null ? null : <button onClick={this.props.onClick}> {this.props.text} </button>; 

    return <div className='message-box'>
       {subdomain} {button}
    </div>
  }
}

export default App;
