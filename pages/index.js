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
import StatsBox from "../components/StatsBox";
import PresaleBox from "../components/PresaleBox";
import StakeBox from "../components/StakeBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";
import NFTsContainer from "../components/NFTsContainer";

import 'semantic-ui-css/semantic.min.css'

// Circular Progress Bar
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import FarmBox from "../components/FarmBox";
import CreateBackupBox from "../components/CreateBackupBox";
import ClaimableBackupsBox from "../components/ClaimableBackupsBox";
import {PRESALE_ABI, PRESALE_ADDRESS} from "../contracts/Presale";
import {USDC_ABI, USDC_ADDRESS} from "../contracts/USDC";
import {EASY_ABI, EASY_ADDRESS} from "../contracts/EasyToken";

// Web3 Global Vars
let provider;
let nftContract;
let discountedContract;
let nftContractWithSigner;
let discountedContractWithSigner;
let signer;

let presaleContract;
let presaleContractWithSigner;
let usdcContract;
let usdcContractWithSigner;
let easyContract;
export default function Home() {
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

    const [usdcAllowance, setUsdcAllowance] = useState(0);
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

            presaleContract = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, provider);
            usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
            easyContract = new ethers.Contract(EASY_ADDRESS, EASY_ABI, provider);
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
                usdcContractWithSigner = usdcContract.connect(signer);
                presaleContractWithSigner = presaleContract.connect(signer);
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
                await getUsdcAllowance();
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

    async function getUsdcAllowance() {
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
                let allowance = parseInt(await usdcContract.allowance(await signer.getAddress(), PRESALE_ADDRESS), 10);
                setUsdcAllowance(allowance);
            }
        } catch (e) {
            console.log("USDC allowance error: ");
            console.log(e);
            await getUsdcAllowance(walletAddress);
        }
    }

    async function approveUsdc() {
        try {
            await usdcContractWithSigner.approve(PRESALE_ADDRESS, BigInt(1000000000000000000000000000));
        } catch (e) {
            console.log("Approve error: ");
            console.log(e);
        }
    }

    async function presaleMint(_amount) {
        try {
            await presaleContractWithSigner.buyTokens(_amount);
        } catch (e) {
            console.log("Buy error: ");
            console.log(e)
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

    const [menuItem, setMenuItem] = useState(0);

    return (
        <div className={styles.container}>
            <Toaster/>
            <Head>
                <title>EasyBackup - Never lose your wallet</title>
                <meta name="description" content="Backup your crypto wallets easily"/>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            <main className={styles.main}>
                <NavBar/>
                <p className={styles.description}>
                    <span style={{fontWeight: 'bold'}}>Never lose access to your funds in your crypto wallets</span>
                    <br/>
                    Create backups or assign inheritance wallets with ease
                </p>

                <StatsBox/>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: 24
                }}>
                    <p className={styles.menuText} style={{color: menuItem === 0 ? "#3a70ed" : "#000000"}}
                       onClick={() => setMenuItem(0)}>Backup</p>
                    <p className={styles.menuText} style={{color: menuItem === 1 ? "#3a70ed" : "#000000"}}
                       onClick={() => setMenuItem(1)}>Presale</p>
                    <p className={styles.menuText} style={{color: menuItem === 2 ? "#3a70ed" : "#000000"}}
                       onClick={() => setMenuItem(2)}>Stake</p>
                    <p className={styles.menuText} style={{color: menuItem === 3 ? "#3a70ed" : "#000000"}}
                       onClick={() => setMenuItem(3)}>Farm</p>
                </div>

                {menuItem === 0 ?
                    <>
                        <CreateBackupBox/>

                        <ClaimableBackupsBox/>
                    </>
                    : menuItem === 1 ?
                        <PresaleBox walletAddress={walletAddress} connectWalletHandler={() => connectWalletHandler()}
                                    easyContract={easyContract} usdcAllowance={usdcAllowance}
                                    approveUsdc={async () => await approveUsdc()}
                                    presaleMint={async (amount) => await presaleMint(amount)}/>
                        : menuItem === 2 ?
                            <StakeBox/>
                            :
                            <FarmBox/>}
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
        </div>
    )
}
