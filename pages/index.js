import Head from 'next/head'
import styles from '../styles/Home.module.css'
// Web3
import {NFT_ADDRESS, NFT_ABI, DISCOUNTED_ADDRESS, DISCOUNTED_ABI} from "../contracts/EasyClub";
import {ethers} from "ethers";
// Toast
import toast, {Toaster, useToasterStore} from 'react-hot-toast';

import {useEffect, useState} from "react";
import StatsBox from "../components/StatsBox";
import PresaleBox from "../components/PresaleBox";
import StakeBox from "../components/StakeBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";

import 'semantic-ui-css/semantic.min.css'

// Circular Progress Bar
import 'react-circular-progressbar/dist/styles.css';
import FarmBox from "../components/FarmBox";
import CreateBackupBox from "../components/CreateBackupBox";
import {PRESALE_ABI, PRESALE_ADDRESS} from "../contracts/Presale";
import {USDC_ABI, USDC_ADDRESS} from "../contracts/USDC";
import {EASY_ABI, EASY_ADDRESS} from "../contracts/EasyToken";
import {X_EASY_ADDRESS, X_EASY_ABI} from "../contracts/xEasy";
import {LP_ABI, LP_ADDRESS} from "../contracts/LP";
import {FARM_ABI, FARM_ADDRESS} from "../contracts/Farm";
import {BACKUP_ABI, BACKUP_ADDRESS} from "../contracts/Backup";
import {ORACLE_ABI, ORACLE_ADDRESS} from "../contracts/Oracle";

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
let easyContractWithSigner;
let xEasyContract;
let xEasyWithSigner;
let lpContract;
let lpContractWithSigner;
let farmContract;
let farmContractWithSigner;
let backupContract;
let backupContractWithSigner;
let oracleContract;

export default function Home() {
    const [walletAddress, setWalletAddress] = useState("");
    // UI Controllers
    const [metamaskInstalled, setMetamaskInstalled] = useState(false);
    // Toasts
    const {toasts} = useToasterStore();
    const TOAST_LIMIT = 1;
    // Referral
    const [easyPrice, setEasyPrice] = useState(0.005);
    const [easySupply, setEasySupply] = useState(0);
    const [totalBackups, setTotalBackups] = useState(0);

    const [menuItem, setMenuItem] = useState(0);
    // Referrer
    useEffect(() => {
        let fullUrl = window.location.href;
        let splitUrl = fullUrl.split('?');
        if (splitUrl.length > 1) {
            let params = splitUrl[1];
            if (params.indexOf("r=") != -1) {
                let referer = params.slice(2, 44);
                // REFERRAL SYSTEM
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
            xEasyContract = new ethers.Contract(X_EASY_ADDRESS, X_EASY_ABI, provider);
            lpContract = new ethers.Contract(LP_ADDRESS, LP_ABI, provider);
            farmContract = new ethers.Contract(FARM_ADDRESS, FARM_ABI, provider);
            backupContract = new ethers.Contract(BACKUP_ADDRESS, BACKUP_ABI, provider);
            oracleContract = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);

            getGeneralData();
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
                let userAddress = await signer.getAddress();
                setWalletAddress(userAddress);

                nftContractWithSigner = nftContract.connect(signer);
                discountedContractWithSigner = discountedContract.connect(signer);
                usdcContractWithSigner = usdcContract.connect(signer);
                presaleContractWithSigner = presaleContract.connect(signer);
                easyContractWithSigner = easyContract.connect(signer);
                xEasyWithSigner = xEasyContract.connect(signer);
                lpContractWithSigner = lpContract.connect(signer);
                farmContractWithSigner = farmContract.connect(signer);
                backupContractWithSigner = backupContract.connect(signer);
            }
        } catch (e) {
            console.log(e);
        }
    };

    async function getGeneralData() {
        try {
            let supply = parseInt(await easyContract.totalSupply(), 10) / 10 ** 18;

            let reserves = await lpContract.getReserves();
            let usdcInLp = parseInt(reserves[0], 10) / 10 ** 6;
            let easyInLp = parseInt(reserves[1], 10) / 10 ** 18;

            setEasySupply(supply);
            // TODO: Before Release
            setEasyPrice(usdcInLp / easyInLp);
            setTotalBackups(parseInt(await backupContract.backupCount(), 10));
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
                await getGeneralData();
            }
        }
    }

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
                <p className={styles.description} style={{marginTop: 128}}>
                    <span style={{fontWeight: 'bold'}}>Never lose access to your funds in your crypto wallets</span>
                    <br/>
                    Create backups or assign inheritance wallets with ease
                </p>

                <StatsBox easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}/>

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
                        <CreateBackupBox walletAddress={walletAddress}
                                         connectWalletHandler={() => connectWalletHandler()}
                                         backupContract={backupContract}
                                         backupContractWithSigner={backupContractWithSigner}
                                         provider={provider}
                                         signer={signer}
                                         oracleContract={oracleContract}/>
                    </>
                    : menuItem === 1 ?
                        <PresaleBox walletAddress={walletAddress}
                                    easyContract={easyContract}
                                    usdcContract={usdcContract}
                                    usdcContractWithSigner={usdcContractWithSigner}
                                    presaleContractWithSigner={presaleContractWithSigner}
                                    connectWalletHandler={() => connectWalletHandler()}
                                    provider={provider}/>
                        : menuItem === 2 ?
                            <StakeBox
                                provider={provider}
                                walletAddress={walletAddress}
                                connectWalletHandler={() => connectWalletHandler()}
                                xEasyContract={xEasyContract}
                                xEasyWithSigner={xEasyWithSigner}
                                easyContract={easyContract}
                                easyContractWithSigner={easyContractWithSigner}

                                easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}/>
                            :
                            <FarmBox
                                walletAddress={walletAddress}
                                lpContract={lpContract}
                                lpContractWithSigner={lpContractWithSigner}
                                usdcContract={usdcContract}
                                easyContract={easyContract}
                                farmContract={farmContract}
                                farmContractWithSigner={farmContractWithSigner}
                                connectWalletHandler={() => connectWalletHandler()}
                                provider={provider}

                                easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}/>}
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
        </div>
    )
}
