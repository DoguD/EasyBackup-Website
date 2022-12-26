import styles from "../styles/Home.module.css";

export default function ClaimableBackupsBox(props) {
    return (
        <>
            <h2 className={styles.subTitle}>
                Stats
            </h2>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Total Backed-Up Assets</h2>
                    <p>$1,000,000</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Token Value</h2>
                    <p>$0.01</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Market Cap</h2>
                    <p>$50,000</p>
                </div>
                <div className={styles.card}>
                    <h2>Total Protocol Revenue</h2>
                    <p>$100</p>
                </div>
            </div>
        </>
    );
}
