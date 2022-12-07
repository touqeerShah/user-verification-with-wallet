import WalletConnectProvider from "@walletconnect/web3-provider";
// import WalletLink from "walletlink";
import Web3Modal from "web3modal";
// import { ALCHEMY_KEY, INFURA_ID } from "../constants";
import { INFURA_WALLET_PROVIDER } from "../config";
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_WALLET_PROVIDER, // required
      chainId: 5,
    },
  },
  binancechainwallet: {
    package: true,
  },
};

 function web3ModalSetup():Web3Modal {
  var web3modal = new Web3Modal({
    network: "goerli",
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions: providerOptions,
    // disableInjectedProvider: false,
  });
  return web3modal;
};

export { web3ModalSetup };
