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
            <p>Stake $EASY and earn 90% of protocol revenues weekly</p>
            <p>(Staking starts after presale ends)</p>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: "center"}}>
                <img style={{width: 50, height: 50}}/>
                <p>Staked TVL</p>
                <p>$1,000,000</p>
                <p>APR Estimate</p>
                <p>1.13%</p>
                <div>
                    <div>
                        <img style={{width: 50, height: 50}}/>
                        <p>1</p>
                        <p>xEASY</p>
                    </div>
                    <p>=</p>
                    <div>
                        <img style={{width: 50, height: 50}}/>
                        <p>1.1</p>
                        <p>EASY</p>
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                    <p>xEASY Balance</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p><img style={{width: 20, height: 20, marginLeft: 8}}/>
                    </div>
                    <p>Claimable EASY</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p>0</p><img style={{width: 20, height: 20, marginLeft: 8}}/>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div>
                            <p>Stake</p>
                        </div>
                        <div>
                            <p>Unstake</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
