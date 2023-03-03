import styles from "../../styles/Home.module.css";
import {AiFillMediumSquare, AiOutlineTwitter} from "react-icons/ai";
import {FaDiscord} from "react-icons/fa";
import {EASY_ADDRESS} from "../../contracts/EasyToken";

export default function IconContainer(props) {
    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <p className={styles.getTokenText} style={{margin: 0}}
               onClick={() => window.open("https://spooky.fi/#/swap?inputCurrency=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&outputCurrency=" + EASY_ADDRESS, "_blank")}>Buy
                $EASY</p>
            <AiOutlineTwitter color={"#3f8bd2"} size={32} className={styles.navbarIcon}
                              onClick={() => window.open("https://twitter.com/easyblock_fin", "_blank")}/>
            <FaDiscord color={"#5568e3"} size={32} className={styles.navbarIcon}
                       onClick={() => window.open("https://discord.gg/kcShzPgxT9", "_blank")}/>
            <AiFillMediumSquare size={32} className={styles.navbarIcon}
                                onClick={() => window.open("https://medium.com/easyblock", "_blank")}/>
        </div>
    )
}
