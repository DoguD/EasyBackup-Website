import styles from "../styles/Home.module.css";
import React, {useEffect, useState} from "react";
import {Button} from 'semantic-ui-react'
import {TOKEN_MAP} from "./subComponents/Constants";
import {ethers} from "ethers";
import {ERC20_ABI} from "../contracts/InProduction/ERC20";

function ClaimableBackupRow(props) {
    let remainingDays;
    let canBeClaimed = false;
    if (((parseInt(props.backup.expiry) - (Math.floor(Date.now() / 1000) - parseInt(props.backup.lastInteraction)))) < 0) {
        canBeClaimed = true;
        remainingDays = 0;
    } else {
        remainingDays = ((parseInt(props.backup.expiry) - (Math.floor(Date.now() / 1000) - parseInt(props.backup.lastInteraction))) / 60 / 60 / 24).toFixed(0)
    }
    return (
        props.backup.isActive ?
            <div className={styles.claimableBackupsRow}>
                <p className={styles.claimableBackupText}><b>From: </b></p>
                <p className={styles.claimableBackupText}>{props.backup.from}</p>

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
                <Button primary disabled={!canBeClaimed}
                        onClick={() => props.claimBackup(props.backup.backupId)}>Claim</Button>
            </div> : null
    )
}

export default function ClaimableBackupsBox(props) {
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimableBackups, setClaimableBackups] = useState([]);

    useEffect(() => {
        getClaimableBackups();
    }, [props.walletAddress]);

    async function getClaimableBackups() {
        if (props.walletAddress !== "") {
            let claimableBackupCount = parseInt(await props.backupContract.claimableBackupsCount(props.walletAddress), 10);
            let parsedBackups = [];
            for (let i = 0; i < claimableBackupCount; i++) {
                let backupId = parseInt(await props.backupContract.claimableBackups(props.walletAddress, i), 10);
                let backup = await props.backupContract.backups(backupId);
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
            setClaimableBackups(parsedBackups);
        }
    }

    async function claimBackup(id) {
        try {
            let transaction = await props.backupContractWithSigner.claimBackup(id);
            setListener(transaction.hash);
        } catch (e) {
            console.log("Claim Error: ");
            console.log(e);
        }
    }

    function setListener(txHash) {
        props.provider.once(txHash, (transaction) => {
            getClaimableBackups();
        })
    }

    return (
        <>
            <h2 className={styles.subTitle}>
                Claimable Backups
            </h2>
            <div className={styles.claimableBackupsContainer}>
                {claimableBackups.length !== 0 ? <>
                        <p className={styles.sectionDescription} style={{fontSize: 16}}>These are the backups assigned to your wallet</p>
                        {/* eslint-disable-next-line react/jsx-key */}
                        {claimableBackups.map((item) => <ClaimableBackupRow
                            backup={item} claimBackup={(id) => claimBackup(id)}/>)}
                    </> :
                    // eslint-disable-next-line react/no-unescaped-entities
                    <p className={styles.sectionDescription} style={{fontSize: 16}}>You don't have any backups assigned to your wallet, if
                        someone assigns a backup, you will be able to see it here.</p>}
            </div>
        </>
    );
}
