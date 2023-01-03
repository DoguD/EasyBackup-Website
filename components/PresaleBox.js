import styles from "../styles/Home.module.css";
import ProgressBar from "@ramonak/react-progress-bar";
import {AiOutlineMinusCircle, AiOutlinePlusCircle} from "react-icons/ai";
import React, {useEffect, useState} from "react";
import {CircleLoader, ClipLoader} from "react-spinners";

import {useTimer} from 'react-timer-hook';
import {PRESALE_ADDRESS} from "../contracts/Presale";

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
            <div style={{fontSize: '100px', color: "#3a70ed"}}>
                <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
            </div>
        </div>
    );
}

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function PresaleBox(props) {
    const [preSaleEnabled, setPreSaleEnabled] = useState(true);
    const [toMint, setToMint] = useState(200);
    const [totalMinted, setTotalMinted] = useState(1000000);
    const [isLoading, setIsLoading] = useState(false);
    const [usdcAllowance, setUsdcAllowance] = useState(0);

    useEffect(() => {
        getPresaleData();
        getUsdcAllowance();
    }, [props.walletAddress])

    async function getPresaleData() {
        console.log("Minted Tokens");
        if (typeof props.easyContract != "undefined") {
            setTotalMinted(parseInt(await props.easyContract.mintedPresaleTokens(), 10) / 10 ** 18);
        }
    }

    async function approveUsdc() {
        setIsLoading(true);
        try {
            let transaction = await props.usdcContractWithSigner.approve(PRESALE_ADDRESS, BigInt(1000000000000000000000000000));
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Approve error: ");
            console.log(e);
        }
    }

    async function presaleMint(_amount) {
        setIsLoading(true);
        try {
            let transaction = await props.presaleContractWithSigner.buyTokens(_amount);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Buy error: ");
            console.log(e)
        }
    }

    async function getUsdcAllowance() {
        try {
            if (props.walletAddress !== "") {
                let allowance = parseInt(await props.usdcContract.allowance(props.walletAddress, PRESALE_ADDRESS), 10);
                console.log(allowance);
                setUsdcAllowance(allowance);
            }
        } catch (e) {
            console.log("USDC allowance error: ");
            console.log(e);
        }
    }

    function setListener(txHash) {
        props.provider.once(txHash, (transaction) => {
            console.log(transaction);
            setIsLoading(false);
            getPresaleData();
            getUsdcAllowance();
        })
    }

    return (
        <>
            <h2 className={styles.subTitle}>
                Presale
            </h2>
            <p className={styles.presaleDescription}><b>35%</b> of EasyBlock token is allocated for presale. Presale
                starts on <b>January 15th, 11:59</b> and will last for <b>2 weeks.</b><br/>First 24-hours is reserved
                for <a style={{fontWeight: "bold", color: "#3a70ed"}} href={"https://club.easyblock.finance"}
                       target={"_blank"} rel="noreferrer">VIP EasyClub</a> holders.</p>
            {
                preSaleEnabled ?
                    <>
                        <p className={styles.sectionDescription} style={{marginTop: 16}}><b>Total Presale
                            Allocation: </b> 3,500,000 $EASY</p>
                        <p className={styles.sectionDescription}><b>Minted: </b> {totalMinted}
                        </p>
                        <p className={styles.sectionDescription} style={{marginBottom: 32}}><b>Presale Price: </b> 0.005
                            $USDC</p>
                        <ProgressBar bgColor={"#3a70ed"}
                                     completed={(100 * totalMinted / 3500000).toFixed(2)}
                                     width={300}/>
                        {
                            props.walletAddress === "" ?
                                <div className={styles.mintButton} onClick={() => props.connectWalletHandler()}>
                                    <p className={styles.mintText}>Connect</p>
                                </div> :
                                <>
                                    <div className={styles.mintCountController}>
                                        <p className={styles.mintCountTitle}><b>Mint: </b></p>
                                        <input className={styles.input} type={"text"} id={"mintCount"}
                                               value={toMint}
                                               onChange={(b) => {
                                                   let newValue = parseInt(b.target.value);
                                                   if (newValue) {
                                                       console.log(newValue)
                                                       console.log(newValue + totalMinted)
                                                       if (newValue + totalMinted > 3500000) {
                                                           setToMint(3500000 - totalMinted);
                                                       } else {
                                                           setToMint(newValue);
                                                       }
                                                   } else {
                                                       setToMint(0);
                                                   }
                                               }}></input>
                                    </div>
                                    <p className={styles.mintCostText}>{(0.005 * toMint)}
                                        <b> $USDC</b></p>
                                    <div className={styles.mintButton} onClick={async () => {
                                        if (usdcAllowance < toMint * 0.05 * 1 ** 6) {
                                            console.log("test");
                                            approveUsdc();
                                        } else {
                                            presaleMint(BigInt(toMint * 10 ** 18));
                                        }
                                    }}>
                                        {props.isMinting ?
                                            <CircleLoader color={"#3a70ed"} size={25}/>
                                            :
                                            <p className={styles.mintText}>
                                                {isLoading ?
                                                    <ClipLoader color={"#3a70ed"}
                                                                size={25}/> : usdcAllowance < toMint * 0.05 * 1 ** 6 ? "Approve" : "Mint"}</p>}
                                    </div>
                                </>
                        }
                    </>
                    :
                    <>
                        <p className={styles.sectionDescription} style={{marginTop: 16}}>Buy $EASY, stake it, and earn
                            from protocol revenues.</p>
                        <MyTimer expiryTimestamp={1673783940000}/>
                    </>}
        </>
    )
}
