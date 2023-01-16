import styles from "../styles/Home.module.css";


export default function StatsBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Backed-Up Assets</h2>
                    <p>$1,000,000</p>
                </div>
                <div className={styles.card}>
                    <h2>Total Backups</h2>
                    <p>{props.totalBackups}</p>
                </div>
                <div className={styles.card}>
                    <h2>Total Users</h2>
                    <p>0</p>{/*TODO:*/}
                </div>
            </div>
        </>
    );
}
