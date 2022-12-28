import styles from "../styles/Home.module.css";
import {useState} from "react";
import {Button} from 'semantic-ui-react'

export default function ClaimableBackupsBox(props) {
    const [isClaiming, setIsClaiming] = useState(false);
    return (
        <>
            <h2 className={styles.subTitle}>
                Claimable Backups
            </h2>
            <div className={styles.claimableBackupsContainer}>
                <div className={styles.claimableBackupsRow}>
                    <p className={styles.claimableBackupText}><b>From: </b></p>
                    <p className={styles.claimableBackupText}>0x14453a83131012F4DbB4c9c98830A0DE04B38c10</p>

                    <div style={{width: 16}}/>
                    <p className={styles.claimableBackupText}><b>Token: </b></p>
                    <p className={styles.claimableBackupText}>$ETH</p>

                    <div style={{width: 16}}/>
                    <p className={styles.claimableBackupText}><b>Amount: </b></p>
                    <p className={styles.claimableBackupText}>0.1463</p>

                    <div style={{width: 16}}/>
                    <p className={styles.claimableBackupText}><b>Can Be Claimed In: </b></p>
                    <p className={styles.claimableBackupText}>12 days</p>

                    <div style={{width: 32}}/>
                    <Button primary disabled>Claim</Button>
                </div>
            </div>
        </>
    );
}
