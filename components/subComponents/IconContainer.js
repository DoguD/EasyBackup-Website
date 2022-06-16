import styles from "../../styles/Home.module.css";
import {AiFillMediumSquare, AiOutlineTwitter} from "react-icons/ai";
import {FaDiscord} from "react-icons/fa";

export default function IconContainer(props) {
    return (
        <div>
            <img className={styles.paintSwapLogo + " " + styles.navbarIcon} src="/paintSwapLogo.png"
                 onClick={() => window.location = "https://paintswap.finance/marketplace/collections/0x5d6f546f2357e84720371a0510f64dbc3fbace33"}/>
            <AiOutlineTwitter color={"#3f8bd2"} size={32} className={styles.navbarIcon}
                              onClick={() => window.location = "https://twitter.com/easyblock_fin"}/>
            <FaDiscord color={"#5568e3"} size={32} className={styles.navbarIcon}
                       onClick={() => window.location = "http://discord.gg/easyblock"}/>
            <AiFillMediumSquare size={32} className={styles.navbarIcon}
                                onClick={() => window.location = "https://medium.com/easyblock"}/>
        </div>
    )
}
