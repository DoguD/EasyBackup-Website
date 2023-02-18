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
        <div style={{textAlign: 'center', marginTop: 32}}>
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
    const [toMint, setToMint] = useState(2000);
    const [totalMinted, setTotalMinted] = useState(1000000);
    const [isLoading, setIsLoading] = useState(false);
    const [usdcAllowance, setUsdcAllowance] = useState(0);
    const [usdcBalance, setUsdcBalance] = useState(0);

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
        console.log(_amount);
        setIsLoading(true);
        try {
            let transaction = await props.presaleContractWithSigner.buyTokens(_amount);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Buy error: ");
            console.log(e);
            if(e.toString().indexOf("Amount is lower than minMintAmount") !== -1) {
                alert("Minimum purchase amount is 2000 $EASY in the presale.");
            }
            else if(e.toString().indexOf("Sale not active") !== -1) {
                alert("Sale hasn't started yet.");
            }
            else if(e.toString().indexOf("Presale is only for EasyClub VIPs") !== -1) {
                alert("You need to own at least 5 EasyClub NFTs to buy $EASY during the first 5 days of presale.");
            }
            else if(e.toString().indexOf("Sale is only for EasyClub members") !== -1) {
                alert("You need to own at least 1 EasyClub NFT to participate in $EASY presale.");
            } else if(e.toString().indexOf("Presale allocation exceeded") !== -1) {
                alert("The amount you are trying to buy exceeds presale allocation.");
            }
        }
    }

    async function getUsdcAllowance() {
        try {
            if (props.walletAddress !== "") {
                let allowance = parseInt(await props.usdcContract.allowance(props.walletAddress, PRESALE_ADDRESS), 10);
                let balance = parseInt(await props.usdcContract.balanceOf(props.walletAddress), 10) / 10 ** 6;
                console.log(allowance);
                setUsdcAllowance(allowance);
                setUsdcBalance(balance);
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
                starts on <b>February 22nd, 11:59 UTC</b> and will last for <b>10 days.</b><br/>
                You need to have at least 1 <a style={{fontWeight: "bold", color: "#3a70ed"}} href={"https://club.easyblock.finance"} target={"_blank"} rel="noreferrer">EasyClub NFT</a> to participate in the sale. <br/>
                First 5 days are reserved for <a style={{fontWeight: "bold", color: "#3a70ed"}} href={"https://club.easyblock.finance"}
                       target={"_blank"} rel="noreferrer">VIP EasyClub</a> holders.</p>

            <p className={styles.presaleDescription} style={{marginTop: 16}}><b>Why $EASY?</b><br/>90% of EasyBackup protocol revenues will be distributed to $EASY stakers.</p>
            {
                Date.now() > props.presaleStartTime ?
                    <>
                        <p className={styles.sectionDescription} style={{marginTop: 16}}><b>Total Presale
                            Allocation: </b> 3,500,000 $EASY</p>
                        <p className={styles.sectionDescription}><b>Presale Price: </b> 0.005
                            $USDC</p>
                        <p className={styles.sectionDescription}><b>Minimum Mint Amount: </b>2000 $EASY (=10 $USDC)</p>
                        <p className={styles.sectionDescription} style={{marginBottom: 32}}>
                            <b>Minted: </b> {totalMinted}
                        </p>
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
                                               }}
                                               onBlur={() => {
                                                   if (toMint < 2000) setToMint(2000)
                                               }}></input>
                                    </div>
                                    <p className={styles.mintCostText}><b>Total: </b>{(0.005 * toMint).toFixed(3)} $USDC
                                    </p>
                                    <p className={styles.mintCostText}><b>Your Wallet Balance: </b>{usdcBalance.toFixed(3)} $USDC</p>
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
                        <p className={styles.presaleDescription} style={{marginTop: 16}}><b>Presale Starts In</b></p>
                        <MyTimer expiryTimestamp={props.presaleStartTime}/>
                    </>}
        </>
    )
}
