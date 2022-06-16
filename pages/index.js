import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
// Web3
import {NFT_ADDRESS, NFT_ABI} from "../contracts/EasyClub";
import {ethers} from "ethers";
// Toast
import toast, {Toaster, useToasterStore} from 'react-hot-toast';

import {useEffect, useState} from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import UtilityBox from "../components/UtilityBox";
import MintBox from "../components/MintBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";

// Web3 Global Vars
let provider;
let nftContract;
let nftContractWithSigner;
let signer;

export default function Home() {
    const [walletAddress, setWalletAddress] = useState("");
    const [minted, setMinted] = useState(0);
    // UI Controllers
    const [isMinting, setIsMinting] = useState(false);
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);

    // Web3
    useEffect(() => {
        if (window.ethereum != null) {
            setMetamaskInstalled(true);
            console.log("Metamask installed.");
            window.ethereum.enable();
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");

            // CONTRACTS
            nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider)
            getNFTData();

            // LISTENERS
            nftContract.on("Transfer", async (from, to, tokenId, event) => {
                console.log("Inside event.");
                console.log(event);
                /*
                if (event.event === "Transfer" && to === await signer.getAddress()) {
                    console.log("Transfer occured.")
                }*/
            })
        } else {
            console.log("Metamask not installed.");
            provider = new ethers.providers.getDefaultProvider("https://rpc.ftm.tools");
        }
    }, [signer])

    // Network Change
    async function changeNetworkToFTM() {
        try {
            if (!window.ethereum) throw new Error("No crypto wallet found.");
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: `0x${Number(250).toString(16)}`,
                    chainName: "Fantom",
                    nativeCurrency: {
                        name: "Fantom",
                        symbol: "FTM",
                        decimals: 18
                    },
                    rpcUrls: ["https://rpc.ftm.tools/"],
                    blockExplorerUrls: ["https://ftmscan.com/"]
                }]
            });
        } catch (e) {
            alert(e.message);
        }
    }

    // Wallet Connect
    const connectWalletHandler = async () => {
        if (!metamaskInstalled) {
            alert("Please install Metamask to mint NFTs.");
            return;
        }
        try {
            await window.ethereum.enable();
            let chainId = await provider.getNetwork();
            chainId = chainId['chainId'];

            if (chainId !== 250) {
                if (window.confirm("Please switch to Fantom Network to mint Easy Club NFTs.")) {
                    await changeNetworkToFTM();
                }
            } else {
                signer = provider.getSigner();
                console.log("Is signer null ?", signer == null)
                nftContractWithSigner = nftContract.connect(signer);
                setWalletAddress(await signer.getAddress());
            }
        } catch (e) {
            console.log(e);
        }
    };

    // Contract Methods
    async function mintNFT(count) {
        try {
            console.log('Hey');
            setIsMinting(true);
            const options = {value: ethers.utils.parseEther((100 * count).toString())}
            await nftContractWithSigner.mintForSelfFtm(count, options);

        } catch (e) {
            console.log('Nah');
            console.log(e);
            toast.error("You don't have enough FTM in your wallet.", {duration: 5000,});
            setIsMinting(false);
        }
    }

    async function getNFTData() {
        try {
            setMinted(parseInt(await nftContract.numTokensMinted(), 10));
        } catch (e) {
            console.log("General methods error: ");
            console.log(e);
            let chainId = await provider.getNetwork();
            chainId = chainId['chainId'];
            if (chainId !== 250) {
                if (window.confirm("Please switch to Fantom Network to use EasyBlock.")) {
                    await changeNetworkToFTM();
                }
            } else {
                await getNFTData()
            }
        }
    }

    return (
        <div className={styles.container}>
            <Toaster/>
            <Head>
                <title>The Easy Club</title>
                <meta name="description" content="Utility-enabled fully on chain Fantom NFTs"/>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            <main className={styles.main}>
                <NavBar/>
                <img src="/bannerLong.png" alt="Samples Banner" width={'100%'}/>
                <div className={styles.line}/>
                <h1 className={styles.title}>
                    The Easy Club
                </h1>

                <p className={styles.description}>
                    Official EasyBlock Genesis NFTs | <span style={{fontWeight: 'bold'}}>5000 Limited</span>
                    <br/>
                    All artwork and metadata are <span style={{fontWeight: 'bold'}}>fully on-chain and randomly generated at mint.</span>
                    <br/>
                    Each NFT grants holders many <span style={{fontWeight: 'bold'}}>community benefits and financial advantages</span> under
                    the EasyBlock
                    ecosystem.
                </p>

                <h2 className={styles.subTitle}>
                    Mint Now
                </h2>
                <MintBox walletAddress={walletAddress} connectWalletHandler={() => connectWalletHandler()}
                         mintNFT={(count) => mintNFT(count)} minted={minted}/>

                <h2 className={styles.subTitle}>
                    Utility and Benefits
                </h2>

                <UtilityBox/>
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
        </div>
    )
}
