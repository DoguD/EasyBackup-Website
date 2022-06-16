import styles from "../styles/Home.module.css";
import IconContainer from "./subComponents/IconContainer";

export default function NavBar(props) {
    return (
        <div className={styles.navbar}>
            <div className={styles.navbarTitleContainer}
                 onClick={() => window.location = "https://easyblock.finance"}>
                <img src="/favicon.png" alt="Icon" width={40} height={40}/>
                <p className={styles.navbarTitle}>EasyBlock</p>
            </div>

            <div className={styles.iconContainer}>
                <IconContainer/>
            </div>
        </div>
    );
}
