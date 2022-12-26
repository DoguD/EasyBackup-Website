import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
// Web3
import {NFT_ADDRESS, NFT_ABI, DISCOUNTED_ADDRESS, DISCOUNTED_ABI} from "../contracts/EasyClub";
import {ethers} from "ethers";
// Toast
import toast, {Toaster, useToasterStore} from 'react-hot-toast';

import {useEffect, useState} from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import UtilityBox from "../components/UtilityBox";
import MintBox from "../components/MintBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";
import NFTsContainer from "../components/NFTsContainer";

// Circular Progress Bar
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Web3 Global Vars
let provider;
let nftContract;
let discountedContract;
let nftContractWithSigner;
let discountedContractWithSigner;
let signer;

export default function Home() {
    const giveAwayCutOffCount = 1982;
    const giveAwayRewardCount = 2;
    const [walletAddress, setWalletAddress] = useState("");
    const [minted, setMinted] = useState(0);
    const [userNFTCount, setUserNFTCount] = useState(0);
    const [userNFTs, setUserNFTs] = useState([]);
    const [isDiscounted, setIsDiscounted] = useState(false);
    const [discountContractBalance, setDiscountContractBalance] = useState(0);
    // UI Controllers
    const [isMinting, setIsMinting] = useState(false);
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);
    // Toasts
    const {toasts} = useToasterStore();
    const TOAST_LIMIT = 1;
    // Referral
    const [referer, setReferer] = useState("0x0000000000000000000000000000000000000000");
    const [totalRefRewards, setTotalRefRewards] = useState(0);
    const [userRefRewards, setUserRefRewards] = useState(0);
    const [userRefCount, setUserRefCount] = useState(0);

    // Referrer
    useEffect(() => {
        let fullUrl = window.location.href;
        let splitUrl = fullUrl.split('?');
        if (splitUrl.length > 1) {
            let params = splitUrl[1];
            if (params.indexOf("r=") != -1) {
                let referer = params.slice(2, 44);
                setReferer(referer);
            }
        }
    }, []);

    // Web3
    useEffect(() => {
        if (window.ethereum != null) {
            setMetamaskInstalled(true);
            console.log("Metamask installed.");
            window.ethereum.enable();
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");

            // CONTRACTS
            nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider)
            discountedContract = new ethers.Contract(DISCOUNTED_ADDRESS, DISCOUNTED_ABI, provider);
            getNFTData();

            // LISTENERS
            /* TODO: listener disabled
            nftContract.on("Transfer", async (from, to, tokenId, event) => {
                console.log("Inside event.");
                console.log(event);
                if (event.event === "Transfer" && to === await signer.getAddress()) {
                    console.log("Transfer occured.")

                    await getUserNFTData(await signer.getAddress());
                    toast.success("Successfully minted The Easy Club NFTs!");
                    setIsMinting(false);
                }
            })
             */
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
                discountedContractWithSigner = discountedContract.connect(signer);
                let userAddress = await signer.getAddress();
                setWalletAddress(userAddress);
                // Discounted data
                if (typeof userAddress != "undefined") {
                    console.log("Hey, ", await discountedContract.isEligible(userAddress));
                    setIsDiscounted(await discountedContract.isEligible(userAddress));
                    setTotalRefRewards(parseInt(await discountedContract.referralRewardDistributedTotal(), 10) / 10 ** 18);
                    setUserRefRewards(parseInt(await discountedContract.referralRewardDistributed(userAddress), 10) / 10 ** 18);
                    setUserRefCount(parseInt(await discountedContract.referralSaleOccured(userAddress), 10));
                }
                // All NFT Data
                await getUserNFTData(userAddress);
            }
        } catch (e) {
            console.log(e);
        }
    };

    // Contract Methods
    async function mintNFT(count) {
        setIsMinting(true);
        try {
            console.log('Hey');
            setIsMinting(true);
            if (!isDiscounted) {
                const options = {value: ethers.utils.parseEther((100 * count).toString())}
                await discountedContractWithSigner.mintForSelf(count, referer, options);
            } else {
                const options = {value: ethers.utils.parseEther((20 * count).toString())}
                await discountedContractWithSigner.mintForSelf(count, referer, options);
            }
        } catch (e) {
            setIsMinting(false);
            console.log(e);
            toast.error("You don't have enough FTM in your wallet.", {duration: 5000,});
            setIsMinting(false);
        }
    }

    async function getNFTData() {
        try {
            setMinted(parseInt(await nftContract.numTokensMinted(), 10));
            setDiscountContractBalance(parseInt(await nftContract.balanceOf(DISCOUNTED_ADDRESS), 10));
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

    async function getUserNFTData(walletAddress) {
        try {
            // Info about signer
            signer = provider.getSigner();
            let shouldProceed = false;
            try {
                await signer.getAddress();
                shouldProceed = true;
            } catch (e) {
                console.log("User data error.")
            }
            if (signer != null && shouldProceed) {
                // NFT
                let balance = parseInt(await nftContract.balanceOf(walletAddress), 10);
                setUserNFTCount(balance);
                let userNfts = [];
                for (let i = 0; i < balance; i++) {
                    userNfts.push(parseInt(await nftContract.tokenOfOwnerByIndex(walletAddress, i), 10));
                }
                setUserNFTs(userNfts);
            }
        } catch (e) {
            console.log("Get user data error: ");
            console.log(e);
            await getUserNFTData(walletAddress);
        }
    }

    function getUserGiveAwayEligibleNFTCount() {
        let count = 0;
        for (let i = 0; i < userNFTs.length; i++) {
            if (userNFTs[i] > giveAwayCutOffCount) {
                count += 1;
            }
        }
        return count;
    }

    function getWinningChance(userCount, allCount) {
        allCount -= giveAwayCutOffCount;
        allCount -= discountContractBalance;
        return 100 - (((allCount - userCount) / allCount) ** giveAwayRewardCount) * 100;
    }

    return (
        <div className={styles.container}>
            <Toaster/>
            <Head>
                <title>EasyBackup - Never loose your wallet</title>
                <meta name="description" content="Backup your crypto wallets easily"/>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            <main className={styles.main}>
                <NavBar/>
                <p className={styles.description}>
                    <span style={{fontWeight: 'bold'}}>Never loose access to your funds in your crypto wallets</span>
                    <br/>
                    Create backups or assign inheritance wallets with ease
                </p>

                <h2 className={styles.subTitle}>
                    Stats
                </h2>

                <UtilityBox/>

                <h2 className={styles.subTitle}>
                    Mint Now
                </h2>
                <MintBox walletAddress={walletAddress} connectWalletHandler={() => connectWalletHandler()}
                         mintNFT={(count) => mintNFT(count)} minted={minted}
                         isMinting={isMinting} isDiscounted={isDiscounted}/>
                {walletAddress !== "" ?
                    <div className={styles.referralBox}>
                        <h1 style={{color: "#3a70ed", marginBottom: 0}}>Refer Your Friends and Get Rewarded</h1>
                        <p style={{marginTop: 4}}>When your link is used, you <b>automatically earn 10% of
                            minting costs</b>.</p>
                        <p style={{marginTop: 0}}><b>Your Referral
                            Link: </b>{userNFTCount > 0 ?
                            <span style={{wordBreak: "break-all"}}>club.easyblock.finance?r={walletAddress}</span>
                            : <span>Mint 1 NFT to unlock your referral link</span>
                        }
                        </p>
                        <p style={{margin: 2}}><b>Total Referral Rewards: </b><span
                            style={{color: "#3a70ed"}}>{totalRefRewards} $FTM</span></p>
                        <p style={{margin: 2}}><b>Your Referral Rewards: </b><span
                            style={{color: "#3a70ed"}}>{userRefRewards} $FTM</span></p>
                        <p style={{margin: 2}}><b>People Used your Referral Link: </b><span
                            style={{color: "#3a70ed"}}>{userRefCount}</span></p>
                    </div> : null}
                <h2 className={styles.subTitle}>
                    Weekly Giveaway
                </h2>
                <h3>Next Draw: <span style={{color: "#3a70ed"}}>October 16</span></h3>
                {/*
                <div className={styles.mintButton}
                     style={{width: "unset", flexDirection: "column", marginTop: 0, cursor: "unset"}}>
                    <h3>Surprise Giveaway Only For This Week 🎁</h3>
                    <h2 style={{color: "#3a70ed", marginTop: 0, textDecoration: "underline"}}><a
                        href={"https://paintswap.finance/marketplace/assets/0x5d6f546f2357e84720371a0510f64dbc3fbace33/17"}
                        target={"_blank"}
                        rel="noreferrer">
                        Generation 0 Easy Club NFT
                    </a>
                    </h2>
                    <img
                        src={`data:image/svg+xml;base64,PHN2ZyBpZD0ieCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWluWU1pbiBtZWV0IiB2aWV3Qm94PSIwIDAgMzAgMzAiPjxwYXRoIGQ9Ik00IDRoMjJ2MjJINHoiIGZpbGw9IiM3MzNmMTciLz48cGF0aCBkPSJNNCA0LjVoMW01IDBoMW01IDBoMW01IDBoMW0tMTkgMWgxbTIwIDFoMW0tMjIgMmgxbS0xIDFoMW0yMCAxaDFtLTEgMmgxbS0yMiAxaDFtMjAgMGgxbS0xIDJoMW0tMSAxaDFtLTIyIDFoMW0tMSAyaDFtLTEgMWgxbTIwIDBoMW0tMSAxaDFtLTIyIDFoMW0tMSAxaDFtLTEgMWgxbTIgMWgxbTIgMGgxbTIgMGgxbTggMGgxbTIgMGgxTTUgNC41aDFtMiAwaDFtNiAwaDFtLTEwIDIxaDFtNSAwaDFtNSAwaDFtNSAwaDFNNiA0LjVoMW0yIDBoMW04IDBoMW0yIDIxaDFNNyA0LjVoMW00IDBoMm01IDBoM20xIDBoM20tMSAxaDFtLTIyIDFoMW0tMSAxaDFtMjAgMGgxbS0xIDFoMW0tMSAxaDFtLTIyIDFoMW0tMSAxaDFtMjAgMGgxbS0yMiAxaDFtLTEgMmgxbTIwIDBoMW0tMjIgMWgxbS0xIDFoMW0yMCAxaDFtLTIyIDFoMW0yMCAwaDFtLTEgMWgxbS0yMiAyaDFtMjAgMWgxbS0xIDFoMW0tMSAxaDFtLTIyIDFoMm0zIDBoMW00IDBoM20yIDBoMW0zIDBoMW0tMTMtMjFoMW0yIDBoMW0yIDBoMW0tMTAgMjFoMW0yIDBoMW01IDBoMW0yIDBoMSIgc3Ryb2tlPSIjMDAwIi8+PHBhdGggZD0iTTggMTBoM3YzSDh6bTExIDBoM3YzaC0zeiIgZmlsbD0iIzI1YTIyYiIvPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik05IDExaDF2MUg5em0xMSAwaDF2MWgtMXoiLz48cGF0aCBzdHJva2U9IiM0MjI2MTYiIGQ9Ik04IDguNWgxbTExIDBoMW0tOSAzaDFtMTAgMWgxbS0xNiAyaDFtMTEgMGgxbS0xMi02aDJtOCAwaDFtMSAwaDFtLTExIDFoMW01IDFoMW01IDBoMW0tMSAxaDFtLTE4IDFoMW0xMCAwaDFtLTcgMWgxbS0yIDFoMW04IDBoMW0tMTMtNWgxbTE0IDBoMW0tMTYgNGgxbTE0IDBoMW0tNS00aDFtLTcgMWgxbS03IDFoMW0xMCAwaDFtLTEyLTFoMW01IDJoMW01IDFoMW0tMTAgMWgxbTExIDBoMSIvPjxwYXRoIHN0cm9rZT0iIzRmNGY0ZiIgZD0iTTggOS41aDNtMTAgMGgxbS0xNCAxaDFtMSAwaDJtNyAwaDFtMSAwaDJtLTE0IDFoM20xMCAwaDFtLTE0IDFoMW0xIDBoMW03IDBoMW0xIDBoMW0tMyAxaDFtLTEtNGgxbS0xMyAxaDFtLTEgMWgxbTExIDBoMW0tMTMgMWgxbTIgMGgxbTExIDBoMW0tMTMgMWgxbTktNGgxbS0zIDJoMW0tMTEgMWgxbTAgMWgxbTEwIDBoMm0tMTMtM2gxbTggMGgxbTEgMGgxbS0xMyAxaDFtMTEgMGgybS0yIDFoMW0tMTMgMWgxbTAtM2gxbTggMGgxbTEgMGgxbS0xMyAxaDFtMTEgMGgybS0yIDFoMW0tMTMgMWgxbTktMWgxIi8+PHBhdGggc3Ryb2tlPSIjMDAwIiBkPSJNMTMgMTAuNWgxbTIgMWgxbS0xMyAxaDFtOCAwaDFtMTEgMGgxbS0yMSAwaDFtLTItMmgxbTkgMGgzbTggMGgxbS0xMyAxaDFtMSAwaDFtLTEgMWgybS0xMi0yaDFtMTggMGgxbS0xMSAxaDFtLTEgMWgxbTkgMGgxIi8+PHBhdGggc3Ryb2tlPSIjYmI4OTUxIiBkPSJNOCAxNi41aDFtMTIgMGgxIi8+PHBhdGggc3Ryb2tlPSIjOWY2ZjM4IiBkPSJNOSAxNi41aDFtOCAzaDFtLTktM2gxbTggMGgxbS0xMCAzaDFtMiAwaDFtMiAwaDFtMiAwaDFtMC0zaDFtLTMgMWgxbTIgMGgxbS0xIDFoMW0tOCAxaDFtMiAwaDFtLTEwLTJoMW0yIDBoMW0tNCAxaDFtMCAxaDFtMSAwaDFtMyAwaDFtNCAwaDFtLTkgMGgxIi8+PHBhdGggc3Ryb2tlPSIjMDAwIiBkPSJNMTAgMjAuNWgxbTggMGgxbS05IDBoMW01IDBoMW0tNiAwaDFtNSAwaDFtLTYgMGgxbTIgMGgxbS0zIDBoMiIvPjxzdHlsZT4jeHtzaGFwZS1yZW5kZXJpbmc6IGNyaXNwZWRnZXM7fTwvc3R5bGU+PC9zdmc+`}
                        style={{width: 150}}/>
                </div>
                */}
                <p className={styles.description} style={{marginBottom: 16}}>Every week <span
                    style={{fontWeight: 'bold'}}>5 Easy Club NFTs each will be gifted to 2 people.</span><br/>
                    All you need to do is to mint an NFT during the week. Each NFT minted is one entry for the
                    giveaway. <br/>
                    Results announced every <b>Sunday</b>.<br/>
                </p>
                <p className={styles.entryText}><b>Your Minted:</b> {getUserGiveAwayEligibleNFTCount()}</p>
                <p className={styles.entryText}><b>Minted
                    Total:</b> {Math.max((minted - giveAwayCutOffCount - discountContractBalance), 0)}</p>
                <p className={styles.winningChanceText}>Winning Chance</p>
                <div style={{width: 150, height: 150}}>
                    <CircularProgressbar value={getWinningChance(getUserGiveAwayEligibleNFTCount(), minted)}
                                         text={`${getWinningChance(getUserGiveAwayEligibleNFTCount(), minted).toFixed(3)}%`}
                                         styles={buildStyles({
                                             // Colors
                                             pathColor: `#3a70ed`,
                                             textColor: '#3a70ed',
                                             trailColor: '#d6d6d6',
                                             backgroundColor: '#3a70ed',
                                         })}/>;
                </div>

                {walletAddress !== "" ? <>
                    <h2 className={styles.subTitle}>
                        Your NFTs
                    </h2>
                    <h3>VIP Status: {
                        userNFTCount >= 5 ? <span style={{color: "#4caf50"}}>You are a VIP holder!</span> :
                            <span style={{color: "#b71c1c"}}>You need {5 - userNFTCount} more NFTs to become VIP.</span>
                    }</h3>
                    <NFTsContainer userNFTs={userNFTs} userNFTCount={userNFTCount} nftContract={nftContract}/>
                </> : null}
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
        </div>
    )
}
