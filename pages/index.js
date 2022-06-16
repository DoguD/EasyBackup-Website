import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
// Icons
import {AiOutlineTwitter} from "react-icons/ai";
import {FaDiscord} from "react-icons/fa";
import {AiFillMediumSquare} from "react-icons/ai";

import {AiOutlinePlusCircle} from "react-icons/ai";
import {AiOutlineMinusCircle} from "react-icons/ai";
// Web3
import {NFT_ADDRESS, NFT_ABI} from "../contracts/EasyClub";
import {ethers} from "ethers";
// Toast
import toast, {Toaster, useToasterStore} from 'react-hot-toast';

import {useEffect, useState} from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import UtilityBox from "../components/UtilityBox";

// Web3 Global Vars
let provider;
let nftContract;
let nftContractWithSigner;
let signer;

export default function Home() {
    const [walletAddress, setWalletAddress] = useState("");
    const [minted, setMinted] = useState(550);
    const [toMint, setToMint] = useState(1);
    // UI Controllers
    const [isMinting, setIsMinting] = useState(false);

    // Web3
    let metamaskInstalled = false;
    useEffect(() => {
        if (window.ethereum != null) {
            metamaskInstalled = true;
            console.log("Metamask installed.");
            window.ethereum.enable();
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        } else {
            console.log("Metamask not installed.");
            provider = new ethers.providers.getDefaultProvider("https://rpc.ftm.tools");
        }

        // CONTRACTS
        nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider)

        // LISTENERS
        nftContract.on("Transfer", async (from, to, tokenId, event) => {
            console.log("Inside event.");
            console.log(event);
            /*
            if (event.event === "Transfer" && to === await signer.getAddress()) {
                console.log("Transfer occured.")
            }*/
        })
    }, [])

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

    return (
        <div className={styles.container}>
            <Toaster/>
            <Head>
                <title>The Easy Club</title>
                <meta name="description" content="Utility-enabled fully on chain Fantom NFTs"/>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            <main className={styles.main}>
                <div className={styles.navbar}>
                    <div className={styles.navbarTitleContainer}
                         onClick={() => window.location = "https://easyblock.finance"}>
                        <img src="/favicon.png" alt="Icon" width={40} height={40}/>
                        <p className={styles.navbarTitle}>EasyBlock</p>
                    </div>

                    <div className={styles.iconContainer}>
                        <img className={styles.paintSwapLogo + " " + styles.navbarIcon} src="/paintSwapLogo.png"
                             onClick={() => window.location = "https://paintswap.finance/marketplace/collections/0x5d6f546f2357e84720371a0510f64dbc3fbace33"}/>
                        <AiOutlineTwitter color={"#3f8bd2"} size={32} className={styles.navbarIcon}
                                          onClick={() => window.location = "https://twitter.com/easyblock_fin"}/>
                        <FaDiscord color={"#5568e3"} size={32} className={styles.navbarIcon}
                                   onClick={() => window.location = "http://discord.gg/easyblock"}/>
                        <AiFillMediumSquare size={32} className={styles.navbarIcon}
                                            onClick={() => window.location = "https://medium.com/easyblock"}/>
                    </div>
                </div>
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
                <p className={styles.generationText} style={{textDecoration: "line-through"}}>
                    <b>Generation 0:</b> Sold-out
                </p>
                <p className={styles.generationText}>
                    <b>Generation {Math.floor(minted / 1000) + 1} left to mint:</b> {1000 - minted % 1000} / 1000
                </p>
                <div style={{height: 16}}/>
                <ProgressBar bgColor={"#3a70ed"}
                             completed={(minted % 1000) * 100 / 1000}
                             width={300}/>
                {walletAddress === "" ?
                    <div className={styles.mintButton} onClick={() => connectWalletHandler()}>
                        <p className={styles.mintText}>Connect</p>
                    </div> :
                    <>
                        <div className={styles.mintCountController}>
                            <p className={styles.mintCountTitle}><b>Mint Count: </b></p>
                            <AiOutlineMinusCircle size={32} className={styles.mintCountButton} onClick={() => {
                                if (toMint > 1) setToMint(toMint - 1)
                            }}/>
                            <p className={styles.mintCount}>{toMint}</p>
                            <AiOutlinePlusCircle size={32} className={styles.mintCountButton}
                                                 onClick={() => {
                                                     if (toMint < 20) setToMint(toMint + 1)
                                                 }}/>
                        </div>
                        <p className={styles.mintCostText}>Cost: {100 * toMint} <b>$FTM</b></p>
                        <div className={styles.mintButton} onClick={async () => mintNFT(toMint)}>
                            <p className={styles.mintText}>Mint</p>
                        </div>
                    </>}

                <h2 className={styles.subTitle}>
                    Utility and Benefits
                </h2>

                <UtilityBox/>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16}/>
          </span>
                </a>
            </footer>
        </div>
    )
}
