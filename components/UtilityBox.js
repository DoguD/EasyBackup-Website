import styles from "../styles/Home.module.css";

export default function UtilityBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Discord Benefits</h2>
                    <p>Get a special role in Discord and join an exclusive channel to be in close contact with the
                        EasyBlock
                        team.</p>
                </div>

                <div className={styles.card}>
                    <h2>Whitelist</h2>
                    <p>Have early access and whitelist spots on our future projects.</p>
                </div>

                <div
                    className={styles.card}
                >
                    <h2>Fee Reductions</h2>
                    <p>Pay less fees and earn more on our future projects.</p>
                </div>

                <div
                    className={styles.card}
                >
                    <h2>Governance</h2>
                    <p>
                        We are planning to implement a governance structure for our projects with Easy Club NFTs.
                    </p>
                </div>
            </div>
            <a className={styles.learnMore} href={"https://medium.com/easyblock/easyblock-nfts-are-coming-bcae95ae34a0"}
               >
                <h3>Learn More &rarr;</h3>
            </a>
        </>
    );
}
