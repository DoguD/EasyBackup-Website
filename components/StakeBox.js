import styles from "../styles/Home.module.css";
import ProgressBar from "@ramonak/react-progress-bar";
import {AiOutlineMinusCircle, AiOutlinePlusCircle} from "react-icons/ai";
import {useState} from "react";
import {CircleLoader} from "react-spinners";

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


export default function StakeBox(props) {
    const [preSaleEnabled, setPreSaleEnabled] = useState(true);
    const [toMint, setToMint] = useState(200);
    const [totalMinted, setTotalMinted] = useState(1000000);

    return (
        <>
            <p className={styles.sectionDescription}>Stake <b>$EASY</b> as <b>$xEASY</b> and earn 90% of protocol revenues weekly</p>
            <p className={styles.sectionDescription} style={{color: "#424242"}}>(Staking starts after presale ends)</p>
            <div className={styles.stakingCard}>
                <img src="/favicon.png" width={50} height={50} style={{borderRadius: 25}}/>
                <p className={styles.stakingTitle}>Staked TVL</p>
                <p className={styles.stakingText}>$1,000,000</p>
                <p className={styles.stakingTitle}>APR Estimate</p>
                <p className={styles.stakingText} style={{color: "green", fontWeight: 'bold'}}>1.13%</p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 32,
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        margin: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img src="/favicon.png" style={{width: 30, height: 30, borderRadius: 15}}/>
                        <p style={{width: '100%', textAlign: 'center', marginTop: 8, marginBottom: 8}}>1</p>
                        <p style={{margin: 0}}>xEASY</p>
                    </div>
                    <p style={{fontWeight: 'bold', fontSize: 16, height: 20}}>=</p>
                    <div style={{
                        margin: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img src="/favicon.png" style={{width: 30, height: 30, borderRadius: 15}}/>
                        <p style={{width: '100%', textAlign: 'center', marginTop: 8, marginBottom: 8}}>1.12</p>
                        <p style={{margin: 0}}>EASY</p>
                    </div>
                </div>

                <div className={styles.stakingInnerCard}>
                    <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>xEASY Balance</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p><img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                    </div>
                    <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>Claimable EASY</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p><img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
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
