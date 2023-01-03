import styles from "../styles/Home.module.css";

export default function StatsBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Total Backed-Up Assets</h2>
                    <p>$1,000,000</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Token Value</h2>
                    <p>${props.easyPrice.toFixed(4)}</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Market Cap</h2>
                    <p>${((props.easySupply * props.easyPrice).toFixed(0)).toLocaleString("en-US")}</p>
                </div>
                <div className={styles.card}>
                    <h2>Total Protocol Revenue</h2>
                    <p>$100</p>
                </div>
            </div>
        </>
    );
}
