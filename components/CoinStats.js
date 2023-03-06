import styles from "../styles/Home.module.css";

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function CoinStatBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>$EASY Token Value</h2>
                    <p>${props.easyPrice.toFixed(4)}</p>
                </div>
                <div className={styles.card}>
                    <h2>$EASY Market Cap</h2>
                    <p>{USDollar.format((props.easySupply * props.easyPrice))}</p>
                </div>
                <div className={styles.card}>
                    <h2>Protocol Revenue</h2>
                    <p>{USDollar.format((props.totalBackups - props.discountedBackups) * 10)}</p>
                </div>
            </div>
        </>
    );
}
