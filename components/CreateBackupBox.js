import styles from "../styles/Home.module.css";
import React, {useEffect, useState} from 'react'
import {Button, Dropdown} from 'semantic-ui-react';
import {EASY_ADDRESS} from "../contracts/InProduction/EasyToken";
import {Radio} from 'semantic-ui-react'
import {ClipLoader} from "react-spinners";
import {ethers} from "ethers";
import {ERC20_ABI} from "../contracts/InProduction/ERC20";
import {BACKUP_ADDRESS} from "../contracts/InProduction/Backup";
import ClaimableBackupsBox from "./ClaimableBackupsBox";
import {TOKEN_MAP} from "./subComponents/Constants";
import {EXPIRY_OPTIONS, MAX_BIG_INT, TOKENS} from "./subComponents/Constants";
import {DISCOUNTED_ORACLE_ABI, DISCOUNTED_ORACLE_ADDRESS} from "../contracts/InProduction/DiscountedUserOracle";

let tokenContract;
let tokenContractWithSigner;

let discountedUserOracle;

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function BackupRow(props) {
    let remainingDays;
    let canBeClaimed = false;
    if (((parseInt(props.backup.expiry) - (Math.floor(Date.now() / 1000) - parseInt(props.backup.lastInteraction)))) < 0) {
        canBeClaimed = true;
        remainingDays = 0;
    } else {
        remainingDays = ((parseInt(props.backup.expiry) - (Math.floor(Date.now() / 1000) - parseInt(props.backup.lastInteraction))) / 60 / 60 / 24).toFixed(0)
    }
    return (
        <div className={styles.claimableBackupsRow}>
            <p className={styles.claimableBackupText}><b>To: </b></p>
            <p className={styles.claimableBackupText}>{props.backup.to}</p>

            <div style={{width: 16}}/>
            <p className={styles.claimableBackupText}><b>Token: </b></p>
            <p className={styles.claimableBackupText}>{typeof TOKEN_MAP[props.backup.token] !== "undefined" ? "$" + TOKEN_MAP[props.backup.token] : props.backup.token.slice(0, 4) + "..." + props.backup.token.slice(39, 42)}</p>

            <div style={{width: 16}}/>
            <p className={styles.claimableBackupText}><b>Amount: </b></p>
            <p className={styles.claimableBackupText}>{BigInt(props.backup.amount) > BigInt(2 ** 250)
                ? "∞"
                : parseFloat(props.backup.amount / (10 ** props.backup.decimals)).toString()}</p>

            <div style={{width: 16}}/>
            <p className={styles.claimableBackupText}><b>Can Be Claimed In: </b></p>
            <p className={styles.claimableBackupText}>{canBeClaimed ? "Now" : remainingDays + " days"}</p>

            <p className={styles.claimableBackupText}><b>Automatic: </b></p>
            <p className={styles.claimableBackupText}>{props.backup.automatic ? "Yes" : "No"}</p>

            <div style={{width: 32}}/>
            {props.backup.isActive ?
                <Button basic color={'red'} onClick={() => props.deleteBackup(props.backup.backupId)}>Delete</Button>
                : <p style={{color: 'red', marginRight: 16, fontWeight: 'bold'}}>Deleted</p>}
        </div>
    )
}

export default function CreateBackupBox(props) {
    const [token, setToken] = useState("");
    const [isAmountInfinite, setIsAmountInfinite] = useState(true);
    const [amount, setAmount] = useState(0);
    const [backupWallet, setBackupWallet] = useState("");
    const [isExpiryCustom, setIsExpiryCustom] = useState(false);
    const [expiry, setExpiry] = useState(0);
    const [isAutomatic, setIsAutomatic] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [fee, setFee] = useState(0);

    const [approvalNeeded, setApprovalNeeded] = useState(true);
    const [createdBackups, setCreatedBackups] = useState([]);
    const [totalCreatedBackups, setTotalCreatedBackups] = useState(0);

    const [balance, setBalance] = useState(0);
    const [decimals, setDecimals] = useState(18);
    const [easyBalance, setEasyBalance] = useState(0);
    const [isDiscounted, setIsDiscounted] = useState(false);

    const [userRefs, setUserRefs] = useState(0);

    useEffect(() => {
        getBackupData();
        getCreatedBackups();
        getEasyBalance();
        discountedUserOracle = new ethers.Contract(DISCOUNTED_ORACLE_ADDRESS, DISCOUNTED_ORACLE_ABI, props.provider);
    }, [props.walletAddress]);

    useEffect(()=> {
        getTokenData(token);
    }, [token]);

    async function getBackupData() {
        if (typeof props.backupContract !== "undefined") {
            setFee(parseInt(await props.backupContract.getInitFee(), 10));
        }
    }

    async function getCreatedBackups() {
        if (props.walletAddress !== "") {
            let createdBackupCount = parseInt(await props.backupContract.createdBackupsCount(props.walletAddress), 10);
            setTotalCreatedBackups(createdBackupCount);
            let parsedBackups = [];
            for (let i = 0; i < createdBackupCount; i++) {
                let backupId = parseInt(await props.backupContract.createdBackups(props.walletAddress, i), 10);
                let backup = await props.backupContract.backups(backupId);
                if (backup[5]) {
                    let parsedBackup = {
                        amount: backup[3],
                        expiry: backup[4],
                        from: backup[0],
                        isActive: backup[5],
                        to: backup[1],
                        token: backup[2],
                        lastInteraction: parseInt(await props.backupContract.lastInteraction(backup[0]), 10),
                        backupId: backupId,
                        automatic: backup[6],
                        decimals: parseInt(await new ethers.Contract(backup[2], ERC20_ABI, props.provider).decimals(), 10),
                    }
                    parsedBackups.push(parsedBackup);
                }
            }
            setCreatedBackups(parsedBackups);
            setUserRefs(parseInt(await props.backupContract.referralCount(props.walletAddress), 10));
        }
    }

    async function deleteBackup(id) {
        await props.backupContractWithSigner.deletBackup(id);
    }

    async function getAllowance() {
        try {
            let allowance = parseInt(await tokenContract.allowance(props.walletAddress, BACKUP_ADDRESS), 10);
            // setApprovalNeeded(BigInt(allowance) < MAX_BIG_INT); // Needs infinite amount of approval to work
            setApprovalNeeded(BigInt(allowance) === BigInt(0)); // Any approval would work
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getBalance(decimal) {
        try {
            setBalance(parseInt(await tokenContract.balanceOf(props.walletAddress), 10) / 10 ** decimal);
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getEasyBalance() {
        try {
            setEasyBalance(parseInt(await props.easyContract.balanceOf(props.walletAddress), 10) / 10 ** 18);
            setIsDiscounted(await discountedUserOracle.isDiscountedUser(props.walletAddress))
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getDecimal() {
        try {
            let decimal = parseInt(await tokenContract.decimals(), 10);
            setDecimals(decimal);
            return decimal;
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getTokenData(tokenAddress) {
        if(typeof props.provider !== "undefined" && props.walletAddress !== "") {
            tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, props.provider);
            tokenContractWithSigner = tokenContract.connect(props.signer);

            await getAllowance();
            let decimal = await getDecimal();
            await getBalance(decimal);
        }
    }

    async function approve() {
        setIsLoading(true);
        try {
            let transaction = await tokenContractWithSigner.approve(BACKUP_ADDRESS, "115792089237316195423570985008687907853269984665640564039457584007913129639935");
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Approve error: ");
            console.log(e);
        }
    }

    async function createBackup() {
        setIsLoading(true);
        try {
            const options = {value: isDiscounted ? 0 : BigInt(fee)}
            let transaction = await props.backupContractWithSigner.createBackup(backupWallet,
                token,
                isAmountInfinite ? "115792089237316195423570985008687907853269984665640564039457584007913129639935" : BigInt(amount * 10 ** decimals),
                expiry * 24 * 60 * 60,
                isAutomatic,
                props.refAddress,
                options);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Create Backup Error: ");
            console.log(e);
        }
    }

    async function heartbeat() {
        setIsLoading(true);
        try {
            let transaction = await props.backupContractWithSigner.heartBeat();
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Heartbeat error: ");
            console.log(e);
        }
    }

    function setListener(txHash) {
        props.provider.once(txHash, (transaction) => {
            setIsLoading(false);
            getCreatedBackups();
            getAllowance();
        })
    }

    return (
        <>
            <h2 className={styles.subTitle}>
                Create Backup
            </h2>
            {
                props.walletAddress === "" ?
                    <div className={styles.mintButton} onClick={() => props.connectWalletHandler()}>
                        <p className={styles.mintText}>Connect</p>
                    </div> : <>
                        <div className={styles.backupCreationCard}>
                            <div className={styles.backupRow}>
                                <p className={styles.backupTitle}>Token: </p>
                                <Dropdown
                                    placeholder='Select Token'
                                    fluid
                                    selection
                                    options={TOKENS}
                                    onChange={(e, {value}) => {
                                        setToken(value);
                                    }}
                                />
                            </div>
                            {token !== "" ?
                                <p><b className={styles.backupTitle}>Balance:</b> {USDollar.format(balance).slice(1, -3)}
                                </p>
                                : null}

                            <div className={styles.backupRow}>
                                <p className={styles.backupTitle}>Amount: </p>
                                <Radio
                                    label='Infinite'
                                    name='radioGroup'
                                    value='this'
                                    checked={isAmountInfinite}
                                    onChange={() => setIsAmountInfinite(true)}
                                />
                                <Radio
                                    label='Custom'
                                    name='radioGroup'
                                    value='that'
                                    checked={!isAmountInfinite}
                                    onChange={() => setIsAmountInfinite(false)}
                                    style={{marginLeft: 16}}
                                />
                            </div>
                            {!isAmountInfinite ?
                                <div className={styles.backupRow}>
                                    <p className={styles.backupTitle}>Custom Amount: </p>
                                    <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                                           value={amount}
                                           onChange={(b) => {
                                               let newValue = b.target.value;
                                               let rgx = /^[0-9]*\.?[0-9]*$/;
                                               if (newValue.match(rgx) != null) {
                                                   setAmount(newValue);
                                               }
                                           }}>

                                    </input>
                                </div>
                                : null}
                            <div className={styles.backupRow}>
                                <p className={styles.backupTitle}>Backup Wallet: </p>
                                <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                                       value={backupWallet}
                                       placeholder={"0x..."}
                                       onChange={(b) => {
                                           setBackupWallet(b.target.value)
                                       }}>

                                </input>
                            </div>

                            <div className={styles.backupRow}>
                                <p className={styles.backupTitle}>Access Time: </p>
                                <Dropdown
                                    placeholder='Select Access Time'
                                    fluid
                                    selection
                                    options={EXPIRY_OPTIONS}
                                    onChange={(e, {value}) => {
                                        if (value == 0) {
                                            setIsExpiryCustom(true);
                                            setExpiry(value);
                                        } else {
                                            setIsExpiryCustom(false);
                                            setExpiry(value);
                                        }
                                    }}
                                />
                            </div>
                            {isExpiryCustom ?
                                <div className={styles.backupRow}>
                                    <p className={styles.backupTitle}>Custom Access Time: </p>
                                    <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                                           value={expiry}
                                           onChange={(b) => {
                                               let newValue = parseInt(b.target.value);
                                               if (newValue) {
                                                   setExpiry(newValue)
                                               } else {
                                                   setExpiry(0);
                                               }
                                           }}
                                           style={{marginRight: 8}}>

                                    </input>
                                    <p className={styles.backupTitle}>days</p>
                                </div>
                                : null}
                            <div className={styles.backupRow}>
                                <p className={styles.backupTitle}>Automatic Transfer: </p>
                                <Radio toggle onClick={(evt, data) => setIsAutomatic(data.checked)}/>
                            </div>
                            {isAutomatic ?
                                <p className={styles.backupTitle} style={{color: 'red'}}>If automatic transfer is enabled
                                    the tokens will transfer to your backup wallet
                                    automaticaly when the time comes. Be careful! This means if you lose access to your
                                    backup wallet, the tokens will be lost forever.</p> : null}
                            <div className={styles.backupRow}>
                                <div className={styles.mintButton} onClick={() => {
                                    if (approvalNeeded) {
                                        approve();
                                    } else {
                                        createBackup();
                                    }
                                }} style={{width: '100%'}}>
                                    {
                                        isLoading ? <ClipLoader color={"#3a70ed"} size={15}/> :
                                            <p className={styles.mintText}>
                                                {
                                                    approvalNeeded ?
                                                        "Approve" :
                                                        "Create Backup"
                                                }</p>}
                                </div>
                            </div>
                        </div>
                        <p className={styles.sectionDescription}><b>Fee: </b>Creating a backup costs $10 in $FTM, if you
                            hold more
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            than 10,000 $EASY in your wallet you get a full discount on this fee. There is also a 1% fee
                            applied only when a backup is claimed.</p>
                        <p className={styles.sectionDescription}><b>Your $EASY
                            Balance: </b>{USDollar.format(easyBalance.toFixed(0)).slice(1, -3)}
                            <br/>
                            {isDiscounted ?
                                <b style={{color: "green"}}>You are eligible to use EasyBackup without paying the $10
                                    fee.</b> :
                                <b style={{color: "darkred"}}>You need {(10000 - easyBalance).toFixed(0)} more $EASY to use EasyBackup
                                    without the $10 initial fee.</b>}
                        </p>

                        {props.walletAddress !== "" ?
                            <div className={styles.referralBox}>
                                <h1 style={{color: "#3a70ed", marginBottom: 0, textAlign: 'center'}}>1st Month Special: Refer and Get Rewarded</h1>
                                <p style={{marginTop: 4, textAlign: "center"}}>If you are using EasyBackup and loving it, share it with your friends for more people to benefit.<br/>
                                <b>You will get 50% of backup creation fee ($5) in $FTM directly to your wallet for every backup created with your link.</b></p>
                                <p style={{marginTop: 0}}><b>Your Referral
                                    Link: </b>{totalCreatedBackups > 0 ?
                                    <span style={{wordBreak: "break-all"}}>backup.easyblock.finance?r={props.walletAddress}</span>
                                    : <span>You need to create at least 1 backup to get your referral link</span>
                                }
                                </p>
                                <p style={{margin: 2}}><b>Total Referral Rewards: </b><span
                                    style={{color: "#3a70ed"}}>{props.totalRefs * 5} USD</span></p>
                                <p style={{margin: 2}}><b>Your Referral Rewards: </b><span
                                    style={{color: "#3a70ed"}}>{userRefs * 5} USD</span></p>
                            </div> : null}


                        <h2 className={styles.subTitle}>
                            My Backups
                        </h2>
                        <div className={styles.claimableBackupsContainer}>
                            {createdBackups.length !== 0 ? <>
                                    <p className={styles.sectionDescription} style={{fontSize: 16, textAlign: 'center'}}>These
                                        are the backups you have created.
                                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                                        <br/>You can use "Reset Access Time" button to restart the time it needs to pass before
                                        your backups become availabe.</p>
                                    <div className={styles.mintButton} style={{width: 300}} onClick={() => {
                                        heartbeat();
                                    }}>
                                        {
                                            isLoading ? <ClipLoader color={"#3a70ed"} size={15}/> :
                                                <p className={styles.mintText}>Reset Access Time</p>}
                                    </div>
                                    {/* eslint-disable-next-line react/jsx-key */}
                                    {createdBackups.map((item) => <BackupRow backup={item}
                                                                             deleteBackup={(id) => deleteBackup(id)}/>)}
                                </>
                                :
                                // eslint-disable-next-line react/no-unescaped-entities
                                <p className={styles.sectionDescription} style={{fontSize: 16}}>You don't have any active
                                    backups.</p>}
                        </div>
                        <ClaimableBackupsBox walletAddress={props.walletAddress}
                                             backupContract={props.backupContract}
                                             backupContractWithSigner={props.backupContractWithSigner}
                                             provider={props.provider}/>
                    </>
            }
        </>
    )
        ;
}
