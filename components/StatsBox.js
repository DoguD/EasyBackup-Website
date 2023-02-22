import styles from "../styles/Home.module.css";


export default function StatsBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2 className={styles.statsTitle}>Backed-Up Assets</h2>
                    <p>$0</p> {/*TODO: Make automatic somehow*/}
                </div>
                <div className={styles.card}>
                    <h2 className={styles.statsTitle}>Total Backups</h2>
                    <p>{props.totalBackups}</p>
                </div>
                <div className={styles.card}>
                    <h2 className={styles.statsTitle}>Total Users</h2>
                    <p>0</p>{/*TODO:*/}
                </div>
            </div>
        </>
    );
}
