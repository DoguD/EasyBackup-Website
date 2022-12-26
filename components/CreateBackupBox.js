import styles from "../styles/Home.module.css";

export default function CreateBackupBox(props) {
    return (
        <>
            <h2 className={styles.subTitle}>
                Create Backup
            </h2>
            <p className={styles.sectionDescription}>- Select a token, amount, backup wallet, and expiry time.
                <br/>- After the expiry time has passed, the backup wallet can claim those tokens from your wallet. You
                can reset the expiry time by interacting with the contract.
                <br/>- You need to complete two transactions, one for token spending, and the other one for creating the
                backup.</p>
            <div style={{padding: 40, width: '100%'}}>
                <div className={styles.backupCreationCard}>
                    <h2>Total Backed-Up Assets</h2>
                    <p>$1,000,000</p>
                </div>
            </div>
        </>
    );
}
