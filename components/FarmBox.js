import styles from "../styles/Home.module.css";
import ProgressBar from "@ramonak/react-progress-bar";
import {AiOutlineMinusCircle, AiOutlinePlusCircle} from "react-icons/ai";
import {useState} from "react";
import {CircleLoader} from "react-spinners";
import {EASY_ADDRESS} from "../contracts/EasyToken";

import {useTimer} from 'react-timer-hook';

function MyTimer({expiryTimestamp}) {
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart,
    } = useTimer({expiryTimestamp, onExpire: () => console.warn('onExpire called')});


    return (
        <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '100px'}}>
                <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
            </div>
        </div>
    );
}


export default function FarmBox(props) {
    const [preSaleEnabled, setPreSaleEnabled] = useState(true);
    const [toMint, setToMint] = useState(200);
    const [totalMinted, setTotalMinted] = useState(1000000);

    return (
        <>
            <h2 className={styles.subTitle}>
                Farm $EASY-$USDC LP
            </h2>
            <p className={styles.sectionDescription}><b>40% $EASY</b> supply is allocated for <b>$EASY-$USDC
                LP</b> farmers</p>
            <p className={styles.sectionDescription} style={{color: "#424242"}}>(Farming starts after presale ends)</p>
            <div className={styles.stakingCard}>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <img src="/favicon.png" width={50} height={50} style={{borderRadius: 25}}/>
                    <img src="/usdc.png" width={50} height={50} style={{borderRadius: 25, marginLeft: -20}}/>
                </div>
                <p className={styles.stakingTitle}>Staked TVL</p>
                <p className={styles.stakingText}>$1,000,000</p>
                <p className={styles.stakingTitle}>APY</p>
                <p className={styles.stakingText} style={{color: "#424242", fontSize: 12, margin: 0}}>(When daily
                    compounded)</p>
                <p className={styles.stakingText} style={{color: "green", fontWeight: 'bold'}}>130%</p>

                <p className={styles.getTokenText} onClick={() => window.open("https://spooky.fi/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/"+EASY_ADDRESS, "_blank")}>Get $EASY-$USDC LP →</p>
                <div className={styles.stakingInnerCard}>
                    <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>$EASY-$USDC Balance</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p>
                        <img src="/favicon.png"
                             style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                        <img src="/usdc.png"
                             style={{width: 20, height: 20, borderRadius: 10, marginLeft: -8}}/>
                    </div>
                    <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>Claimable Reward</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p><img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div className={styles.stakingButton}>
                            <p className={styles.stakingButtonText}>Claim</p>
                        </div>
                        <div className={styles.stakingButton}>
                            <p className={styles.stakingButtonText}>Stake</p>
                        </div>
                        <div className={styles.stakingButton}>
                            <p className={styles.stakingButtonText}>Unstake</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
