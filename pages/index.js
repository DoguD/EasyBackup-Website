import Head from 'next/head'
import styles from '../styles/Home.module.css'
// Web3
import {NFT_ADDRESS, NFT_ABI, DISCOUNTED_ADDRESS, DISCOUNTED_ABI} from "../contracts/InProduction/EasyClub";
import {ethers} from "ethers";

import React, {useEffect, useState} from "react";
import StatsBox from "../components/StatsBox";
import StakeBox from "../components/StakeBox";
import NavBar from "../components/NavBar";
import IconContainer from "../components/subComponents/IconContainer";

import 'semantic-ui-css/semantic.min.css'

// Circular Progress Bar
import 'react-circular-progressbar/dist/styles.css';
import FarmBox from "../components/FarmBox";
import CreateBackupBox from "../components/CreateBackupBox";
import {PRESALE_ABI, PRESALE_ADDRESS} from "../contracts/InProduction/Presale";
import {USDC_ABI, USDC_ADDRESS} from "../contracts/InProduction/USDC";
import {EASY_ABI, EASY_ADDRESS} from "../contracts/InProduction/EasyToken";
import {X_EASY_ADDRESS, X_EASY_ABI} from "../contracts/InProduction/xEasy";
import {LP_ABI, LP_ADDRESS} from "../contracts/InProduction/LP";
import {FARM_ABI, FARM_ADDRESS} from "../contracts/InProduction/Farm";
import {BACKUP_ABI, BACKUP_ADDRESS} from "../contracts/InProduction/Backup";
import {ORACLE_ABI, ORACLE_ADDRESS} from "../contracts/InProduction/Oracle";

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
    // Referral
    const [easyPrice, setEasyPrice] = useState(0.005);
    const [easySupply, setEasySupply] = useState(0);
    const [totalBackups, setTotalBackups] = useState(0);
    const [discountedBackups, setDiscountedBackups] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [refAddress, setRefAddress] = useState("0x0000000000000000000000000000000000000000");
    const [totalRefs, setTotalRefs] = useState(0);

    const [menuItem, setMenuItem] = useState(0);
    // Referrer
    useEffect(() => {
        let fullUrl = window.location.href;
        let splitUrl = fullUrl.split('?');
        if (splitUrl.length > 1) {
            let params = splitUrl[1];
            if (params.indexOf("r=") !== -1) {
                let referer = params.slice(2, 44);
                console.log("Ref: ", referer);
                setRefAddress(referer);
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
            alert("Please install Metamask to use EasyBackup.");
            return;
        }
        try {
            await window.ethereum.enable();
            let chainId = await provider.getNetwork();
            chainId = chainId['chainId'];

            if (chainId !== 250) {
                if (window.confirm("Please switch to Fantom Network to use EasyBackup.")) {
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
            setTotalBackups(parseInt(await backupContract.backupCount(), 10));
            setDiscountedBackups(parseInt(await backupContract.discountedBackupCount(), 10));
            setTotalUsers(parseInt(await backupContract.totalUsers(), 10));
            setEasyPrice(usdcInLp / easyInLp);
            setTotalRefs(parseInt(await backupContract.referralBackupCount(), 10));
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
            <Head>
                <title>EasyBackup - Never lose your crypto</title>
                <meta name="description" content="Backup your crypto wallet easily"/>
                <link rel="icon" href="/favicon.png"/>
            </Head>

            <main className={styles.main}>
                <NavBar/>
                <img src="/banner.png" alt="Banner" className={styles.bannerImage}/>
                <div className={styles.descriptionContainer}>
                    <img src="/favicon.png" alt="Icon" style={{width: 120, height: 120}}/>
                    <p className={styles.description}>
                        <span style={{fontWeight: 'bold', fontSize: '1.5rem'}}>Never lose access to your coins in your wallet</span>
                        <br/>
                        Create backups or assign inheritance wallets with ease
                    </p>
                </div>

                <div className={styles.mobilePadding}>
                    <div className={styles.backupInfoCard}>
                        <p className={styles.boxTitle}>What is EasyBackup?</p>
                        <p className={styles.sectionDescription}>EasyBackup is a protocol which lets you assign backup
                            wallets
                            for the tokens in your wallet. This way
                            if you lose access to your wallet for any reason, the backup wallet will be able to
                            transfer
                            those
                            tokens to itself. You never need to transfer your tokens to EasyBackup smart contract and
                            only
                            the
                            backup wallet will be able transfer those tokens. Similarly, the backup system can be used
                            for
                            inheritance.</p>
                        <p className={styles.boxTitle}>How to use?</p>
                        <p className={styles.sectionDescription} style={{width: '100%'}}>- Select a token, amount,
                            backup
                            wallet, and access time.
                            <br/></p>
                        <p className={styles.sectionSmallDescription}>
                            <b>Token: </b>The token you want the backup wallet to be able to access. You can choose from
                            the
                            list
                            or use a custom token address.
                            <br/>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            <b>Amount: </b>The amount of tokens the backup wallet can access. If you choose "infinite"
                            the
                            backup
                            will able to access all, or you can limit the amount.
                            <br/>
                            <b>Backup Wallet: </b>The wallet which you want to be able to access your tokens.
                            <br/>
                            <b>Access Time: </b>The time which needs to pass before the backup becomes accessible. For
                            example, choosing 1 year means, the backup wallet can transfer the specified tokens to
                            itself 365 days after your last interaction with the contract.
                            <br/>
                            <b>Automatic Transfer: </b>If this option is enabled the funds will automatically get
                            transferred to the backup wallet. Be extremely careful about enabling this option because
                            loss of access to the backup wallet when automatic transfer is enabled may cause loss of
                            funds.
                            <br/><br/>
                        </p>
                        <p className={styles.sectionDescription}>- After the access time has passed, the backup wallet
                            can
                            claim
                            those tokens from your wallet. You
                            can reset the access time by interacting with the contract.
                            <br/>
                            - You need to complete two transactions, one for token approval, and the other one for
                            creating
                            the backup.
                        </p>
                    </div>
                    <StatsBox easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}
                              totalUsers={totalUsers}/>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: 24
                    }}>
                        <p className={styles.menuText} style={{color: menuItem === 0 ? "#3a70ed" : "#000000"}}
                           onClick={() => setMenuItem(0)}>Backup</p>
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
                                             oracleContract={oracleContract}
                                             easyContract={easyContract}
                                             refAddress={refAddress}
                                             totalRefs={totalRefs}/>
                        </>
                        : menuItem === 2 ?
                            <StakeBox
                                provider={provider}
                                walletAddress={walletAddress}
                                connectWalletHandler={() => connectWalletHandler()}
                                xEasyContract={xEasyContract}
                                xEasyWithSigner={xEasyWithSigner}
                                easyContract={easyContract}
                                easyContractWithSigner={easyContractWithSigner}
                                easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}
                                discountedBackups={discountedBackups}
                                totalRefs={totalRefs}/>
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
                                easyPrice={easyPrice} easySupply={easySupply} totalBackups={totalBackups}
                                discountedBackups={discountedBackups}
                                totalRefs={totalRefs}/>}
                </div>
            </main>

            <footer className={styles.footer}>
                <IconContainer/>
            </footer>
            <p style={{fontSize: 12, color: 'gray', textAlign: 'center', padding: 32}}>Use of backup.easyblock.finance
                (the “Site”) and the EasyBackup protocol (the “Protocol”) is strictly
                at your own risk. Before using the Protocol, users should fully understand and accept the risks
                involved, which include, but are not limited to, front-end errors, bugs, hacks, regulatory and tax
                uncertainty, and total loss of funds. Do not deploy funds you cannot afford to lose. The Protocol is
                unaudited yet and involves a substantial degree of risk. No representations or warranties are made
                as to the safety of funds deployed, and the team will not be liable or responsible
                for any losses incurred. By using the Site or the Protocol, you represent and warrant that your use
                does not violate any law, rule or regulation in your jurisdiction of residence.</p>
        </div>
    )
}
