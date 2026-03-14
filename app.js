import { createWalletClient, custom, createPublicClient, defineChain, parseEther } from 'https://esm.sh/viem';
import { contractAddress, abi } from './constants-js';

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fundButton");
const ethAmounInput = document.getElementById("ethAmount")

connectBtn.onclick = connect
fundBtn.onclick = fund

let walletClient
let publicClient //To simulate a transaction before sending, so we're sure it won't fail

async function fund(){
    const ethAmount = ethAmounInput.value;

    //Reconnect if they're not connected
    if(typeof window.ethereum !== 'undefined'){ // Using viem allows us to support other types of wallets asides metmask
        walletClient = createWalletClient({
            transport: custom(window.ethereum), //How do we communicate with the blockchain network?, custom is mostly used for browser wallets
        });

        const [connectedAccount] = await walletClient.requestAddresses(); //Sends a request to the wallet asking for permission to access the user's accounts

        // we want to simulate the transaction before sending it to the blockchain
        publicClient = createPublicClient({
            transport: custom(window.ethereum),
        });

        const currentChain = await getCurrentChain(walletClient);

        await publicClient.simulateContract({
            address: contractAddress,
            abi,
            functionName: "fund",
            account: connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmount),
        });
    } else {
        connectBtn.innerText = 'Please Install MetaMask';
    }

}

async function connect(){
    if(typeof window.ethereum !== 'undefined'){
    // window.ethereum.request({method: "eth_requestAccounts"})
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

async function getCurrentChain(client){
    const chainId = await client.getChainId();
    const currentChain = defineChain({
        id: chainId,
        name: "Ethereum",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: ["http://localhost:8545"],
    });
    return currentChain;
}