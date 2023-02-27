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
            <div className={styles.presaleTimer}>
                <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
            </div>
        </div>
    );
}

function SmallTimer({expiryTimestamp}) {
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
        <div style={{textAlign: 'center', marginTop: 16, marginBottom: 32}}>
            <div className={styles.presaleTimer} style={{fontSize: 48}}>
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
    const [toMint, setToMint] = useState(2000);
    const [totalMinted, setTotalMinted] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [usdcAllowance, setUsdcAllowance] = useState(0);
    const [usdcBalance, setUsdcBalance] = useState(0);
    const [easyBalance, setEasyBalance] = useState(0);

    useEffect(() => {
        getPresaleData();
        getUsdcAllowance();
        getEasyBalance();
    }, [props.walletAddress])

    async function getEasyBalance() {
        try {
            setEasyBalance(parseInt(await props.easyContract.balanceOf(props.walletAddress), 10) / 10 ** 18);
        } catch (e) {
            console.log("Backup Box, get allowance error:");
            console.log(e);
        }
    }

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
            if (e.toString().indexOf("Amount is lower than minMintAmount") !== -1) {
                alert("Minimum purchase amount is 2000 $EASY in the presale.");
            } else if (e.toString().indexOf("Sale not active") !== -1) {
                alert("Sale hasn't started yet.");
            } else if (e.toString().indexOf("Presale is only for EasyClub VIPs") !== -1) {
                alert("You need to own at least 5 EasyClub NFTs to buy $EASY during the first 5 days of presale.");
            } else if (e.toString().indexOf("Sale is only for EasyClub members") !== -1) {
                alert("You need to own at least 1 EasyClub NFT to participate in $EASY presale.");
            } else if (e.toString().indexOf("Presale allocation exceeded") !== -1) {
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
                starts on <b>February 24th, 11:59 UTC</b> and will last for <b>10 days.</b><br/>
                You need to have at least 1 <a style={{fontWeight: "bold", color: "#3a70ed"}}
                                               href={"https://club.easyblock.finance"} target={"_blank"}
                                               rel="noreferrer">EasyClub NFT</a> to participate in the sale. <br/>
                First 5 days are reserved for <a style={{fontWeight: "bold", color: "#3a70ed"}}
                                                 href={"https://club.easyblock.finance"}
                                                 target={"_blank"} rel="noreferrer">VIP EasyClub</a> holders.</p>

            <p className={styles.presaleDescription} style={{marginTop: 16}}><b>Why $EASY?</b><br/>90% of EasyBackup
                initial fees will be distributed to $EASY stakers.</p>
            {
                Date.now() > props.presaleStartTime ?
                    <>
                        <p className={styles.presaleDescription} style={{marginTop: 16}}><b>Presale Ends In</b></p>
                        <SmallTimer expiryTimestamp={props.presaleStartTime + 10 * 24 * 60 * 60 * 1000}/>
                        <p className={styles.sectionDescription} style={{marginTop: 16}}><b>Presale
                            Allocation: </b> 3,500,000 $EASY</p>
                        <p className={styles.sectionDescription}>
                            <b>Total Minted: </b> {USDollar.format(totalMinted.toFixed(0)).slice(1, -3)}
                        </p>
                        <p className={styles.sectionDescription}><b>Price per Token: </b> 0.005
                            $USDC</p>
                        <p className={styles.sectionDescription}><b>Minimum Mint Amount: </b>2,000
                            $EASY (=10 $USDC)</p>
                        <p className={styles.mintCostText} style={{marginBottom: 32}}><b>Your EASY
                            Balance: </b>{USDollar.format(easyBalance.toFixed(0)).slice(1,-3)} $EASY</p>
                        <ProgressBar bgColor={"#3a70ed"}
                                     completed={(100 * totalMinted / 3500000).toFixed(0) * 100 / 100}
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
                                    <p className={styles.mintCostText}><b>Total
                                        Cost: </b>{(0.005 * toMint).toFixed(3)} $USDC
                                    </p>
                                    <p className={styles.mintCostText}><b>Your USDC
                                        Balance: </b>{usdcBalance.toFixed(3)} $USDC</p>
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
            <p className={styles.mintCostText} style={{fontSize: 12, marginTop: 32}}><b>$EASY
                Contract Address: </b>0x26A0D46A4dF26E9D7dEeE9107a27ee979935F237</p>
            <p className={styles.mintCostText} style={{fontSize: 12}}><b>Presale Contract
                Address: </b>0x560Ef28eAa34E1166Aff9a7cFEd112840863bA08</p>
        </>
    )
}
