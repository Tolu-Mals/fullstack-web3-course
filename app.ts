import "viem/window";
import { 
    createWalletClient, 
    custom, 
    createPublicClient, 
    defineChain, 
    parseEther, 
    formatEther, 
    type Chain,
} from 'viem';
import { contractAddress, abi } from './constants';

const connectBtn = document.getElementById("connectButton") as HTMLButtonElement;
const fundBtn = document.getElementById("fundButton") as HTMLButtonElement;
const balanceBtn = document.getElementById("balanceButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
const statusText = document.getElementById("statusText") as HTMLDivElement;

if (connectBtn) connectBtn.onclick = connect;
if (fundBtn) fundBtn.onclick = fund;
if (balanceBtn) balanceBtn.onclick = getBalance;
if (withdrawButton) withdrawButton.onclick = withdraw;

// Using 'any' here to bypass some of the strict type checking issues with Viem's inferred clients 
// that were causing the ES5/Account errors in some environments.
let walletClient: any;
let publicClient: any;

function updateStatus(msg: string) {
    if (statusText) statusText.innerText = msg;
}

async function fund() {
    if (!ethAmountInput) return;
    const ethAmount = ethAmountInput.value;
    if (!ethAmount) {
        updateStatus("Please enter an amount");
        return;
    }

    if (typeof window.ethereum !== 'undefined') {
        walletClient = createWalletClient({
            transport: custom(window.ethereum!),
        });

        updateStatus("Requesting account...");
        const [connectedAccount] = await walletClient.requestAddresses();

        publicClient = createPublicClient({
            transport: custom(window.ethereum!),
        });

        const currentChain = await getCurrentChain(walletClient);

        try {
            updateStatus("Simulating transaction...");
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi,
                functionName: "fund",
                account: connectedAccount,
                chain: currentChain,
                value: parseEther(ethAmount),
            });

            updateStatus("Waiting for approval...");
            const tx_hash = await walletClient.writeContract(request);
            updateStatus(`Success! Hash: ${tx_hash.slice(0, 10)}...`);
            console.log("Transaction Hash:", tx_hash);
        } catch (error: any) {
            updateStatus(`Error: ${error.shortMessage || error.message}`);
            console.error("Funding error:", error);
        }
    } else {
        updateStatus("Please install MetaMask");
    }
}

async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
        walletClient = createWalletClient({
            transport: custom(window.ethereum!),
        });

        const [connectedAccount] = await walletClient.requestAddresses();

        publicClient = createPublicClient({
            transport: custom(window.ethereum!),
        });

        const currentChain = await getCurrentChain(walletClient);

        try {
            updateStatus("Withdrawing...");
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi,
                functionName: "withdraw",
                account: connectedAccount,
                chain: currentChain,
            });

            const tx_hash = await walletClient.writeContract(request);
            updateStatus("Withdrawal Hash: " + tx_hash.slice(0, 10) + "...");
            console.log("Transaction Hash:", tx_hash);
        } catch (error: any) {
            updateStatus(`Error: ${error.shortMessage || error.message}`);
            console.error("Withdrawal error:", error);
        }
    } else {
        updateStatus("Please install MetaMask");
    }
}

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            walletClient = createWalletClient({
                transport: custom(window.ethereum!),
            });

            updateStatus("Connecting...");
            await walletClient.requestAddresses();
            if (connectBtn) connectBtn.innerText = 'Connected 🔌';
            updateStatus("Wallet connected!");
        } catch (error: any) {
            updateStatus("Connection failed");
        }
    } else {
        updateStatus("Please install MetaMask");
    }
}

async function getCurrentChain(client: any): Promise<Chain> {
    const chainId = await client.getChainId();
    return defineChain({
        id: chainId,
        name: "Localhost",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: {
            default: {
                http: ["http://localhost:8545"],
            },
            public: {
                http: ["http://localhost:8545"],
            }
        },
    });
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        publicClient = createPublicClient({
            transport: custom(window.ethereum!),
        });

        try {
            const balance = await publicClient.getBalance({
                address: contractAddress,
            });

            updateStatus(`Contract Balance: ${formatEther(balance)} ETH`);
            console.log("Balance: ", formatEther(balance));
        } catch (error: any) {
            updateStatus("Failed to get balance");
        }
    }
}