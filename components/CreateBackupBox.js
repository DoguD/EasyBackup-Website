import styles from "../styles/Home.module.css";
import React, {useEffect, useState} from 'react'
import {Button, Dropdown} from 'semantic-ui-react';
import {EASY_ADDRESS} from "../contracts/EasyToken";
import {Radio} from 'semantic-ui-react'
import {ClipLoader} from "react-spinners";
import {ethers} from "ethers";
import {ERC20_ABI} from "../contracts/ERC20";
import {BACKUP_ADDRESS} from "../contracts/Backup";
import ClaimableBackupsBox from "./ClaimableBackupsBox";
import {TOKEN_MAP} from "./subComponents/Constants";
import {EXPIRY_OPTIONS, MAX_BIG_INT, TOKENS} from "./subComponents/Constants";

let tokenContract;
let tokenContractWithSigner;

function BackupRow(props) {
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
                ? "Infinite"
                : parseInt(props.backup.amount / 10 ** props.backup.decimals).toFixed(4)}</p>

            <div style={{width: 16}}/>
            <p className={styles.claimableBackupText}><b>Can Be Claimed In: </b></p>
            <p className={styles.claimableBackupText}>{Math.max(0, ((parseInt(props.backup.expiry) - (Math.floor(Date.now() / 1000) - parseInt(props.backup.lastInteraction))) / 60 / 60 / 24)).toFixed(0)} days</p>

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
    const [isLoading, setIsLoading] = useState(false);
    const [fee, setFee] = useState(0);

    const [approvalNeeded, setApprovalNeeded] = useState(true);
    const [createdBackups, setCreatedBackups] = useState([]);

    const [balance, setBalance] = useState(0);
    const [decimals, setDecimals] = useState(18);

    useEffect(() => {
        getBackupData();
        getCreatedBackups();
    }, [props.walletAddress]);

    async function getBackupData() {
        await getAllowance(EASY_ADDRESS);
        if (typeof props.backupContract !== "undefined") {
            setFee(parseInt(await props.backupContract.getInitFee(), 10).toString());
        }
    }

    async function getCreatedBackups() {
        if (props.walletAddress !== "") {
            let createdBackupCount = parseInt(await props.backupContract.createdBackupsCount(props.walletAddress), 10);
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
                        decimals: parseInt(await new ethers.Contract(backup[2], ERC20_ABI, props.provider).decimals(), 10)
                    }
                    parsedBackups.push(parsedBackup);
                }
            }
            setCreatedBackups(parsedBackups);
        }
    }

    async function deleteBackup(id) {
        await props.backupContractWithSigner.deletBackup(id);
    }

    async function getAllowance() {
        try {
            let allowance = parseInt(await tokenContract.allowance(props.walletAddress, BACKUP_ADDRESS), 10);
            setApprovalNeeded(BigInt(allowance) < MAX_BIG_INT);
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getBalance(decimal) {
        try {
            let balance = parseInt(await tokenContract.balanceOf(props.walletAddress), 10) / 10 ** decimal;
            setBalance(balance);
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getDecimal() {
        try {
            let decimal = parseInt(await tokenContract.decimals(), 10);
            setBalance(decimal);
            return decimal;
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

    async function getTokenData(tokenAddress) {
        tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, props.provider);
        tokenContractWithSigner = tokenContract.connect(props.signer);

        await getAllowance();
        let decimal = await getDecimal();
        await getBalance(decimal);
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
            const options = {value: fee}
            let transaction = await props.backupContractWithSigner.createBackup(backupWallet, token, isAmountInfinite ? "115792089237316195423570985008687907853269984665640564039457584007913129639935" : BigInt(amount * 10 ** decimals), expiry * 24 * 60 * 60, options);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Create Backup Error: ");
            console.log(e);
        }
    }

    function setListener(txHash) {
        props.provider.once(txHash, (transaction) => {
            console.log(transaction);
            setIsLoading(false);
            getCreatedBackups();
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
                                        getTokenData(value);
                                    }}
                                />
                            </div>
                            {token !== "" ?
                                <p><b className={styles.backupTitle}>Balance:</b> {balance}</p>
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
                                               let newValue = parseInt(b.target.value);
                                               if (newValue) {
                                                   setAmount(newValue)
                                               } else {
                                                   setAmount(0);
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
                        <p className={styles.sectionDescription}><b>Fee: </b>Creating a backup costs $1, if you hold more
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            than 2000 $EASY in your wallet you don't pay this fee. There is also a 1% fee applied only on
                            backup claims.</p>


                        <h2 className={styles.subTitle}>
                            My Backups
                        </h2>
                        <div className={styles.claimableBackupsContainer}>
                            {createdBackups.length !== 0 ? <>
                                    <p className={styles.sectionDescription} style={{fontSize: 16}}>These are the backups you
                                        have created</p>
                                    {/* eslint-disable-next-line react/jsx-key */}
                                    {createdBackups.map((item) => <BackupRow backup={item}
                                                                             deleteBackup={(id) => deleteBackup(id)}/>)}
                                </>
                                :
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
