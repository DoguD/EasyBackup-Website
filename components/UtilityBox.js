import styles from "../styles/Home.module.css";

export default function UtilityBox(props) {
    return (
        <>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h2>Passive Income</h2>
                    <p>10% of our protocol fees from <a href={"https://horde.easyblock.finance"} target={"_blank"}
                                                        rel="noreferrer"
                                                        style={{textDecoration: "underline"}}>EasyBlock Horde</a> is
                        distributed to VIP holders monthly. You can
                        start earning passive income by purchasing at least 5 NFTs.</p>
                </div>
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
                    <p>Pay less fees and earn more on our projects. Easy Club holders can get up to 9% discount on <a
                        href={"https://horde.easyblock.finance"} target={"_blank"} rel="noreferrer"
                        style={{textDecoration: "underline"}}>Easy Block Horde</a>.</p>
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
