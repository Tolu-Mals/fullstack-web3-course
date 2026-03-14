import { createWalletClient, custom, createPublicClient } from 'https://esm.sh/viem';

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fundButton");
const ethAmounInput = document.getElementById("ethAmount")

connectBtn.onclick = onClick
fundBtn.onclick = fund

let walletClient
let publicClient //To simulate a transaction before sending, so we're sure it won't fail

async function fund(){
    const ethAmount = ethAmounInput.value;
    console.log(`Funding with ${ethAmount}`)


    //Reconnect if they're not connected
    if(typeof window.ethereum !== 'undefined'){ // Using viem allows us to support other types of wallets asides metmask
    // window.ethereum.request({method: "eth_requestAccounts"})
        walletClient = createWalletClient({
            transport: custom(window.ethereum), //How do we communicate with the blockchain network?, custom is mostly used for browser wallets
        });

        await walletClient.requestAddresses(); //Sends a request to the wallet asking for permission to access the user's accounts

        publicClient = createPublicClient({
            transport: custom(window.ethereum),
        });

    } else {
        connectBtn.innerText = 'Please Install MetaMask';
    }

}

async function onClick(){
    if(typeof window.ethereum !== 'undefined'){
        // Connnect
        walletClient = createWalletClient({
            transport: custom(window.ethereum), //What type of blockchain are we connecting to?
        });

        await walletClient.requestAddresses();
        connectBtn.innerText = 'Connected 🔌';
    } else {
        connectBtn.innerText = 'Please Install MetaMask';
    }
}