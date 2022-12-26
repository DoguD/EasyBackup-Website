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


export default function PresaleBox(props) {
    const [toMint, setToMint] = useState(1);
    const [preSaleEnabled, setPreSaleEnabled] = useState(false);

    return (
        preSaleEnabled ?
            null
            :
            <>
                <p>Buy $EASY token, stake it, and earn from protocol revenues.</p>
                <p>Presale starts on 11:59 UTC, January 15</p>
                <MyTimer expiryTimestamp={1673783940000}/>
            </>
    )
}
