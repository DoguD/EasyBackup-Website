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
                    <p>${props.easyPrice}</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Market Cap</h2>
                    <p>${(props.easySupply * props.easyPrice / 10 ** 18).toFixed(0)}</p>
                </div>
                <div className={styles.card}>
                    <h2>Total Protocol Revenue</h2>
                    <p>$100</p>
                </div>
            </div>
        </>
    );
}
