import Head from 'next/head'
import { useCallback, useEffect, useRef, useState } from "react";
import { web3ModalSetup } from "../helpers/index";
import { ToastContainer, toast } from "react-toastify";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import axios from "axios";


export default function Home() {

  let [injectedProvider, setInjectedProvider] = useState(providers);
  let BACKEND_ENDPOINT = `http://localhost:8000/api`
  let web3ModalRef = useRef(Web3Modal);
  let isCalled = useRef(false);

  let [isOnGoerli, setIsOnGoerli] = useState(false);
  let [showConnectButton, setShowConnectButton] = useState(true);
  let [isLoaded, setIsLoaded] = useState(false);
  let [walletConnected, setWalletConnected] = useState(false);
  let [userAddress, setUserAddress] = useState("");

  const connectWallet = async () => {
    try {
      console.log("sssss");

      let web3Modal = web3ModalSetup(); // get web3 modal object
      // console.log("walletConnectedwalletConnected",  await web3Modal.connect());
      if (web3Modal)
        loadWeb3Modal(web3Modal);
    } catch (err) {
      console.log(err);
    }
  };


  // this will run only when wallet is not connect and trigger automatical on page refresh
  useEffect(() => {
    console.log("walletConnected", isCalled.current);
    if (!walletConnected && !isCalled.current) {
      try {
        connectWallet(); // call wallet instance
        isCalled.current = true;
        return;
      } catch (error) { }
    }
  }, [walletConnected]);

  const loadWeb3Modal = useCallback(async (web3Modal: Web3Modal) => {
    try {
      // const attestation = await navigator.credentials.create({
      //   publicKey: {
      //     authenticatorSelection: {
      //       authenticatorAttachment: "platform",
      //       userVerification: "required"
      //     },
      //     challenge: Buffer.from("test", 'utf-8'),
      //     rp: { id: document.domain, name: "My Acme Inc" },
      //     user: {
      //       id: Buffer.from("test", 'utf-8'),
      //       name: "node01",
      //       displayName: "user.fullName"
      //     },
      //     pubKeyCredParams: [
      //       { type: "public-key", alg: -7 },
      //       { type: "public-key", alg: -257 }
      //     ]
      //   }
      // });
      // console.log("attestation", attestation);

      // navigator.credentials.preventSilentAccess();
      const provider = await web3Modal.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // console.log("injectedProvider", injectedProvider);
      const signer = web3Provider.getSigner();
      const addr = await signer.getAddress();
      const { chainId } = await web3Provider.getNetwork();

      let { data } = await axios.get(`${BACKEND_ENDPOINT}/get-message`, {
        params: { address: addr, chainId: chainId }
      });
      console.log("data", data.message.issuedAt);

      var signature = await signer.signMessage(data.message)
      let res = await axios.post(`${BACKEND_ENDPOINT}/verify-signature`, {
        nonce: data.nonce,
        issuedAt: data.issuedAt,
        statement: data.statement,
        address: addr, chainId: chainId,
        uri: data.uri,
        signature: signature
      });

      setUserAddress(res.data.status == 200 ? res.data.token : "")
      console.log("token", res.data.token);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': "JWT " + res.data.token
      }
      res = await axios.post(`${BACKEND_ENDPOINT}/verify-token`, {
        nonce: data.nonce,
        issuedAt: data.issuedAt,
        statement: data.statement,
        address: addr, chainId: chainId,
        uri: data.uri,
        signature: signature
      }, { headers: headers });
      console.log(res);


      setUserAddress(addr.toString());
      setWalletConnected(true);
      setIsLoaded(true);
      setShowConnectButton(false);

      checkNetworkIsRinkby(chainId);

      provider.on("chainChanged", (chainId: any) => {
        checkNetworkIsRinkby(chainId);
        return null;
        // setInjectedProvider(new providers.Web3Provider(provider));
      });

      provider.on("accountsChanged", async () => {
        //call on account change in wallet and check it connected or not
        const web3Provider = new providers.Web3Provider(provider);
        try {
          const signer = web3Provider.getSigner();
          const addr = await signer.getAddress();
          setUserAddress(addr.toString());
        } catch (error) {
          // setProfilePicColor("white");
          setShowConnectButton(true);
          setUserAddress("");
          isCalled.current = false;
          setWalletConnected(false);
          // setWalletConnected(false);
        }
        return null;
      });


      return null;
    } catch (error: any) {
      setIsLoaded(true);
      console.log("error", error.message);
      console.log("User Reject Request");
    }
    // eslint-disable-next-line
  }, []);
  // useEffect(() => {
  //   if (web3ModalRef.current.cachedProvider) {
  //     loadWeb3Modal();
  //   }
  // }, [loadWeb3Modal]);
  function checkNetworkIsRinkby(chainId: number) {
    // check user is not testnet on which contract is deployed
    if (chainId != 5) {
      console.log("error");
      // window.alert("Change Network To Goerli Network");
      toast.error("Change Network To Goerli Network");
      setIsOnGoerli(false);
      // throw new Error("Change Network to Goerli Network");
    } else {
      setIsOnGoerli(true);
    }
    return null;
  }

  return (
    <div className={"container"}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"main"}>
        <h1 className={"title"}>
          Welcome to User Verification
        </h1>

        <p className={"description"}>
          Connect User With Wallet and Login

        </p>

        <div className={"grid"}>
          <div className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
            <div className="px-12 py-4">
              <form
                id="create-choose-type-single"
              // onSubmit={handleSubmit(onSubmit)}
              >

                <div className="mt-10">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-dark_mode text-sm font-semibold"
                  >
                    User Token
                  </label>
                  <br />
                  <input
                    type="text"
                    value={userAddress}
                    className="block p-4 w-full text-dark_mode text-sm font-medium placeholder:text-gray-300 placeholder:font-normal bg-gray-300/20 rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-gray-300/60"
                    autoComplete="off"
                    readOnly
                  />
                </div>
                <br />
                <button
                  type="submit"
                  onClick={() => { connectWallet() }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"                >

                  Connect Wallet
                </button>

              </form>
            </div>

          </div>
        </div>
      </main>


    </div>
  )
}
