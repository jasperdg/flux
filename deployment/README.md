## Pre-requisites
* Make sure you have `near-shell` installed
```
npm install -g near-shell
```
* Clone the Flux monorepo 
```
git clone https://github.com/jasperdg/flux-protocol.git
```

## Calling flux-protocol tests
Make sure you navigate to `/deployment`

```
cd deployment
```

Login to near-shell

```
near login
```

This will return 
```
{ networkId: 'default',
  nodeUrl: 'https://rpc.nearprotocol.com',
  contractName: 'near-hello-devnet',
  walletUrl: 'https://wallet.nearprotocol.com' }
Please navigate to this url and follow the instructions to log in: 
https://wallet.nearprotocol.com/login/?title=NEAR+Shell&public_key=ed25519%3ACtmbyY3tZ95K4s24RouwxAsAcBoTmaEXRasPv1vW98XB
```

Navigate to the link in your terminal and log-in to the NEAR wallet.

You will now be prompted in your terminal to enter the username you used to log-in.

```Please enter the accountId that you logged in with: <myAccount>```

A version of Flux protocol is living at the address `flux-test6`

You can make a contract call by firing the following command: 
```
near call flux-test6 get_all_markets --accountId <myAccount>
```

To call a function that requires parameters:

```
near call flux-test6 get_market "{\"id\": 15}" --accountId <myAccount>
```

All available exposed methods and their required parameters can be found [here](https://github.com/jasperdg/flux-protocol/blob/master/protocol/src/markets.rs)

## Side notes
To test using an existing version of the protocol please checkout [deployment](https://github.com/jasperdg/flux-protocol/tree/master/deployment)