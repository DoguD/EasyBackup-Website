import styles from "../styles/Home.module.css";
import {EASY_ADDRESS} from "../contracts/EasyToken";
import React, {useEffect, useState} from "react";
import {X_EASY_ADDRESS} from "../contracts/xEasy";
import {Button, Header, Image, Input, Modal} from "semantic-ui-react";
import {ClipLoader} from "react-spinners";
import {MAX_BIG_INT} from "./subComponents/Constants";
import CoinStatBox from "./CoinStats";

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function StakeModal(props) {
    const [stakeAmount, setStakeAmount] = useState(0);
    return (
        <Modal
            onClose={() => props.setOpen(false)}
            onOpen={() => props.setOpen(true)}
            open={props.open}
        >
            <Modal.Content>
                <Modal.Description>
                    <Header>Stake in xEASY</Header>
                    <p>
                        <b>Available:</b> {USDollar.format(props.easyBalance.toFixed(2))} EASY
                    </p>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Button onClick={() => setStakeAmount(props.easyBalance)}>Max</Button>
                        <Input value={stakeAmount} onChange={(b, {value}) => {
                            if (value) setStakeAmount(parseFloat(value))
                            else setStakeAmount(0);
                        }}/>
                        <p style={{marginLeft: 8}}>$EASY</p>
                    </div>
                    <Button
                        style={{marginTop: 16}} onClick={() => {
                        if (props.easyAllowance < stakeAmount * 10 ** 18) {
                            props.approveEasy();
                        } else {
                            props.stakeEasy(BigInt(stakeAmount * 10 ** 18));
                        }
                    }}>{props.isLoading ? <ClipLoader
                        size={15}/> : props.easyAllowance < stakeAmount * 10 ** 18 ? "Approve" : "Stake"}</Button>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    )
}

function WithdrawModal(props) {
    const [stakeAmount, setStakeAmount] = useState(0);
    return (
        <Modal
            onClose={() => props.setOpen(false)}
            onOpen={() => props.setOpen(true)}
            open={props.open}
        >
            <Modal.Content>
                <Modal.Description>
                    <Header>Withdraw xEASY</Header>
                    <p>
                        <b>Available:</b> {USDollar.format(props.xEasyBalance.toFixed(2))} xEASY
                    </p>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Button onClick={() => setStakeAmount(props.xEasyBalance)}>Max</Button>
                        <Input value={stakeAmount} onChange={(b, {value}) => {
                            if (value) setStakeAmount(parseFloat(value))
                            else setStakeAmount(0);
                        }}/>
                        <p style={{marginLeft: 8}}>$xEASY</p>
                    </div>
                    <Button
                        style={{marginTop: 16}} onClick={() => {
                        props.withdrawEasy(BigInt(stakeAmount * 10 ** 18));
                    }}>{props.isLoading ? <ClipLoader
                        size={15}/> : "Withdraw"}</Button>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    )
}


export default function StakeBox(props) {
    const [lockedEasy, setLockedEasy] = useState(0);
    const [easyForXEasy, setEasyForXEasy] = useState(0);
    const [easyBalance, setEasyBalance] = useState(0);
    const [easyAllowance, setEasyAllowance] = useState(0);
    const [xEasyBalance, setXEasyBalance] = useState(0);
    const [stakedEasyBalance, setStakedEasyBalance] = useState(0);

    const [open, setOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (props.walletAddress !== "") getStakeData();
    }, [props.walletAddress])

    async function getStakeData() {
        if (typeof props.easyContract != "undefined" && typeof props.walletAddress != "undefined") {
            setLockedEasy(parseInt(await props.easyContract.balanceOf(X_EASY_ADDRESS), 10) / 10 ** 18);
            setEasyBalance(parseInt(await props.easyContract.balanceOf(props.walletAddress), 10) / 10 ** 18);
            setEasyAllowance(parseInt(await props.easyContract.allowance(props.walletAddress, X_EASY_ADDRESS), 10));
            setXEasyBalance(parseInt(await props.xEasyContract.balanceOf(props.walletAddress), 10) / 10 ** 18);
            setStakedEasyBalance(parseInt(await props.xEasyContract.EASYBalance(props.walletAddress), 10) / 10 ** 18);
            setEasyForXEasy(parseInt(await props.xEasyContract.xEasyForEasy(BigInt(10 ** 18)), 10) / 10 ** 18);
        }
    }

    function setListener(txHash) {
        props.provider.once(txHash, (transaction) => {
            console.log(transaction);
            setIsLoading(false);
            getStakeData();
        })
    }

    async function stakeEasy(amount) {
        setIsLoading(true);
        try {
            let transaction = await props.xEasyWithSigner.enter(amount);
            console.log(transaction.hash);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Stake Error: ");
            console.log(e);
        }
    }

    async function withdrawEasy(amount) {
        setIsLoading(true);
        try {
            let transaction = await props.xEasyWithSigner.leave(amount);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Unstake Error: ");
            console.log(e);
        }
    }

    async function approveEasy(target) {
        setIsLoading(true);
        try {
            let transaction = await props.easyContractWithSigner.approve(target, MAX_BIG_INT);
            setListener(transaction.hash);
        } catch (e) {
            setIsLoading(false);
            console.log("Easy Approve Error: ");
            console.log(e);
        }
    }

    return (
        <>
            <StakeModal setOpen={(v) => setOpen(v)} open={open} easyBalance={easyBalance}
                        easyAllowance={easyAllowance} approveEasy={async () => approveEasy(X_EASY_ADDRESS)}
                        stakeEasy={async (amount) => stakeEasy(amount)}
                        isLoading={isLoading}/>
            <WithdrawModal setOpen={(v) => setWithdrawOpen(v)} open={withdrawOpen} xEasyBalance={xEasyBalance}
                           withdrawEasy={async (amount) => withdrawEasy(amount)}
                           isLoading={isLoading}/>
            <h2 className={styles.subTitle}>
                Stake $EASY
            </h2>
            <p className={styles.sectionDescription}>Stake <b>$EASY</b> as <b>$xEASY</b> and earn 90% of initial fees weekly</p>
            <p className={styles.sectionDescription} style={{color: "#424242"}}>(Staking starts when presale
                ends)</p>
            <CoinStatBox easyPrice={props.easyPrice} easySupply={props.easySupply} totalBackups={props.totalBackups}/>

            {props.walletAddress === "" ?
                <div className={styles.mintButton} onClick={() => props.connectWalletHandler()}>
                    <p className={styles.mintText}>Connect</p>
                </div> :
                <>
                    <div className={styles.stakingCard}>
                        <img src="/favicon.png" width={50} height={50} style={{borderRadius: 25}}/>
                        <p className={styles.stakingTitle}>Staked TVL</p>
                        <p className={styles.stakingText}>{USDollar.format(props.easyPrice * lockedEasy)}</p>
                        <p className={styles.stakingTitle}>APR Estimate</p>
                        <p className={styles.stakingText} style={{color: "green", fontWeight: 'bold'}}>1.13%</p>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: 32,
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
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
                            <p style={{fontWeight: 'bold', fontSize: 16, height: 20, margin: 0}}>=</p>
                            <div style={{
                                margin: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img src="/favicon.png" style={{width: 30, height: 30, borderRadius: 15}}/>
                                <p style={{
                                    width: '100%',
                                    textAlign: 'center',
                                    marginTop: 8,
                                    marginBottom: 8
                                }}>{easyForXEasy.toFixed(4)}</p>
                                <p style={{margin: 0}}>EASY</p>
                            </div>
                        </div>

                        <p className={styles.getTokenText}
                           onClick={() => window.open("https://spooky.fi/#/swap?inputCurrency=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&outputCurrency=" + EASY_ADDRESS, "_blank")}>Buy
                            $EASY →</p>
                        <div className={styles.stakingInnerCard}>
                            <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>xEASY Balance</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <p className={styles.balanceText}>{xEasyBalance}</p>
                                <img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                            </div>
                            <p style={{
                                marginBottom: 0,
                                color: '#424242',
                                fontWeight: 'semi-bold',
                                marginTop: 16
                            }}>Claimable
                                EASY</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <p className={styles.balanceText}>{stakedEasyBalance}</p>
                                <img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                            </div>
                            {Date.now() > props.presaleEndTime ?
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <div className={styles.stakingButton} onClick={() => {
                                        setOpen(true);
                                    }}>
                                        <p className={styles.stakingButtonText}>{isLoading ?
                                            <ClipLoader color={"#424242"} size={15}/> : "Stake"}</p>
                                    </div>
                                    <div className={styles.stakingButton} onClick={() => {
                                        setWithdrawOpen(true);
                                    }}>
                                        <p className={styles.stakingButtonText}>{isLoading ?
                                            <ClipLoader color={"#424242"} size={15}/> : "Withdraw"}</p>
                                    </div>
                                </div> :
                                <p className={styles.sectionDescription} style={{color: "#424242"}}>(Staking starts
                                    when presale
                                    ends)</p>}
                        </div>
                    </div>
                </>}
        </>
    )
}
