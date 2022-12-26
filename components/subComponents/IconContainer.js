import styles from "../../styles/Home.module.css";
import {AiFillMediumSquare, AiOutlineTwitter} from "react-icons/ai";
import {FaDiscord} from "react-icons/fa";

export default function IconContainer(props) {
    return (
        <div>
            <AiOutlineTwitter color={"#3f8bd2"} size={32} className={styles.navbarIcon}
                              onClick={() => window.location = "https://twitter.com/easyblock_fin"}/>
            <FaDiscord color={"#5568e3"} size={32} className={styles.navbarIcon}
                       onClick={() => window.location = "https://discord.gg/kcShzPgxT9"}/>
            <AiFillMediumSquare size={32} className={styles.navbarIcon}
                                onClick={() => window.location = "https://medium.com/easyblock"}/>
        </div>
    )
}
