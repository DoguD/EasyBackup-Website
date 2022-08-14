import styles from "../styles/Home.module.css";
import ProgressBar from "@ramonak/react-progress-bar";
import {AiOutlineMinusCircle, AiOutlinePlusCircle} from "react-icons/ai";
import {useState} from "react";
import {CircleLoader} from "react-spinners";

export default function MintBox(props) {
    const [toMint, setToMint] = useState(1);

    return (
        <>
            <p className={styles.generationText} style={{textDecoration: "line-through"}}>
                <b>Generation 0:</b> Sold-out
            </p>
            <p className={styles.generationText}>
                <b>Generation {Math.floor(props.minted / 1000) + 1} left:</b> {1000 - props.minted % 1000} /
                900
            </p>
            <div style={{height: 16}}/>
            <ProgressBar bgColor={"#3a70ed"}
                         completed={(props.minted % 1000) * 100 / 1000}
                         width={300}/>
            {props.walletAddress === "" ?
                <div className={styles.mintButton} onClick={() => props.connectWalletHandler()}>
                    <p className={styles.mintText}>Connect</p>
                </div> :
                <>
                    <div className={styles.mintCountController}>
                        <p className={styles.mintCountTitle}><b>Mint Count: </b></p>
                        <AiOutlineMinusCircle size={32} className={styles.mintCountButton} onClick={() => {
                            if (toMint > 1) setToMint(toMint - 1)
                        }}/>
                        <p className={styles.mintCount}>{toMint}</p>
                        <AiOutlinePlusCircle size={32} className={styles.mintCountButton}
                                             onClick={() => {
                                                 if (toMint < 20) setToMint(toMint + 1)
                                             }}/>
                    </div>
                    {props.isDiscounted ?
                        <>
                        <p className={styles.mintCostText}>Cost: <span
                            style={{textDecoration: "line-through"}}>{100 * toMint} <b>$FTM</b></span><br/>
                            {20 * toMint} <b>$FTM</b></p>
                            <p className={styles.discountNotificationText}>You can mint with 80% discount because you are an EasyBlock shareholder.</p>
                        </>:
                        <p className={styles.mintCostText}>Cost: {100 * toMint} <b>$FTM</b></p>
                    }
                    <div className={styles.mintButton} onClick={async () => props.mintNFT(toMint)}>
                        {props.isMinting ?
                            <CircleLoader color={"#3a70ed"} size={25}/>
                            :
                            <p className={styles.mintText}>Mint</p>}
                    </div>
                </>}
        </>
    )
}
