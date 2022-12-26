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
import PresaleBox from "../components/PresaleBox";
import StakeBox from "../components/StakeBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";
import NFTsContainer from "../components/NFTsContainer";

// Circular Progress Bar
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import FarmBox from "../components/FarmBox";

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

                <PresaleBox walletAddress={walletAddress} connectWalletHandler={() => connectWalletHandler()}
                            mintNFT={(count) => mintNFT(count)} minted={minted}
                            isMinting={isMinting} isDiscounted={isDiscounted}/>
                <StakeBox/>
                <FarmBox/>
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
        </div>
    )
}
