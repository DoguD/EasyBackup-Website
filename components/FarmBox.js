import styles from "../styles/Home.module.css";
import {useEffect, useState} from "react";
import {EASY_ADDRESS} from "../contracts/EasyToken";

import {FARM_ADDRESS} from "../contracts/Farm";
import {LP_ADDRESS} from "../contracts/LP";
import {USDC_ADDRESS} from "../contracts/USDC";
import {Button, Header, Input, Modal} from "semantic-ui-react";
import {X_EASY_ADDRESS} from "../contracts/xEasy";
import {PRESALE_ADDRESS} from "../contracts/Presale";

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
                    <Header>Stake $EASY-$USDC in Farm</Header>
                    <p>
                        <b>Available:</b> {(props.userLpBalance)}{"\t$EASY-$USDC LP"}
                    </p>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Button onClick={() => setStakeAmount(props.userLpBalance)}>Max</Button>
                        <Input value={stakeAmount} onChange={(b, {value}) => {
                            if (value) setStakeAmount(parseFloat(value))
                            else setStakeAmount(0);
                        }}/>
                        <p style={{marginLeft: 8}}>$EASY-$USDC LP</p>
                    </div>
                    <Button
                        style={{marginTop: 16}} onClick={() => {
                        if (props.lpAllowance < stakeAmount * 10 ** 18) {
                            props.approveLp();
                        } else {
                            props.stakeInFarm(BigInt(parseInt(stakeAmount * 10 ** 18)));
                        }
                    }}>{props.lpAllowance < stakeAmount * 10 ** 18 ? "Approve" : "Stake"}</Button>
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
                    <Header>Withdraw $EASY-$USDC from Farm</Header>
                    <p>
                        <b>Staked:</b> {(props.userFarmBalance)}{"\t$EASY-$USDC LP"}
                    </p>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Button onClick={() => setStakeAmount(props.userFarmBalance)}>Max</Button>
                        <Input value={stakeAmount} onChange={(b, {value}) => {
                            if (value) setStakeAmount(parseFloat(value))
                            else setStakeAmount(0);
                        }}/>
                        <p style={{marginLeft: 8}}>$EASY-$USDC LP</p>
                    </div>
                    <Button
                        style={{marginTop: 16}} onClick={() => {
                        props.withdrawFarm(BigInt(parseInt(stakeAmount * 10 ** 18)));
                    }}>{"Withdraw"}</Button>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    )
}

export default function FarmBox(props) {
    const [userLpBalance, setUserLpBalance] = useState(0);
    const [lpAllowance, setLpAllowance] = useState(0);
    const [userFarmBalance, setUserFarmBalance] = useState(0);
    const [userReward, setUserReward] = useState(0);

    const [apr, setApr] = useState(0);
    const [apy, setApy] = useState(0);
    const [tvl, setTvl] = useState(0);

    const [open, setOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    useEffect(() => {
        if (props.walletAddress !== "") getFarmData();
    }, [props.walletAddress]);

    async function getFarmData() {
        if (typeof props.easyContract != "undefined" && typeof props.walletAddress != "undefined") {
            let lockedLp = parseInt(await props.lpContract.balanceOf(FARM_ADDRESS), 10) / 10 ** 18;
            let usdcInLp = parseInt(await props.usdcContract.balanceOf(LP_ADDRESS), 10) / 10 ** 6;
            let lpSupply = parseInt(await props.lpContract.totalSupply(), 10) / 10 ** 18;
            let userInfo;

            setUserLpBalance(parseInt(await props.lpContract.balanceOf(props.walletAddress), 10) / 10 ** 18);
            userInfo = await props.farmContract.userInfo(0, props.walletAddress);
            setUserFarmBalance(parseInt(userInfo[0], 10) / 10 ** 18);
            setUserReward(parseInt(await props.farmContract.pendingEASY(0, props.walletAddress), 10) / 10 ** 18);
            setLpAllowance(parseInt(await props.lpContract.allowance(props.walletAddress, FARM_ADDRESS)));

            let tvl = (lockedLp / lpSupply) * usdcInLp * 2
            let apr = props.easyPrice * 4000000 / tvl;
            let dailyApr = apr / 365;
            let apy = (1 + dailyApr) ** 365;

            setTvl(tvl);
            console.log(tvl);
            setApr(apr);
            console.log(dailyApr);
            setApy(apy);
        }
    }

    async function stakeInFarm(amount) {
        try {
            await props.farmContractWithSigner.deposit(0, amount);
        } catch (e) {
            console.log("Stake Error: ");
            console.log(e);
        }
    }

    async function withdrawFarm(amount) {
        try {
            await props.farmContractWithSigner.withdraw(0, amount);
        } catch (e) {
            console.log("Stake Error: ");
            console.log(e);
        }
    }

    async function approveLp() {
        try {
            await props.lpContractWithSigner.approve(FARM_ADDRESS, BigInt(1000000000000000000000000000));
        } catch (e) {
            console.log("Approve error: ");
            console.log(e);
        }
    }

    async function harvest() {
        try {
            await props.farmContractWithSigner.harvest(0);
        } catch (e) {
            console.log("Harvest error: ");
            console.log(e);
        }
    }

    return (
        <>
            <StakeModal setOpen={(v) => setOpen(v)} open={open} userLpBalance={userLpBalance}
                        lpAllowance={lpAllowance} approveEasy={async () => props.approveEasy(X_EASY_ADDRESS)}
                        stakeInFarm={async (amount) => stakeInFarm(amount)}
                        approveLp={() => approveLp()}/>

            <WithdrawModal
                setOpen={(v) => setWithdrawOpen(v)} open={withdrawOpen} userFarmBalance={userFarmBalance}
                lpAllowance={lpAllowance} approveEasy={async () => props.approveEasy(X_EASY_ADDRESS)}
                withdrawFarm={(amount) => withdrawFarm(amount)}
            />
            <h2 className={styles.subTitle}>
                Farm $EASY-$USDC LP
            </h2>
            <p className={styles.sectionDescription}><b>40% $EASY</b> supply is allocated for <b>$EASY-$USDC
                LP</b> farmers</p>
            <p className={styles.sectionDescription} style={{color: "#424242"}}>(Farming starts after presale ends)</p>
            {
                props.walletAddress === "" ?
                    <div className={styles.mintButton} onClick={() => props.connectWalletHandler()}>
                        <p className={styles.mintText}>Connect</p>
                    </div> :
                    <div className={styles.stakingCard}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <img src="/favicon.png" width={50} height={50} style={{borderRadius: 25}}/>
                            <img src="/usdc.png" width={50} height={50} style={{borderRadius: 25, marginLeft: -20}}/>
                        </div>
                        <p className={styles.stakingTitle}>Staked TVL</p>
                        <p className={styles.stakingText}>${tvl.toFixed(0)}</p>
                        <p className={styles.stakingTitle}>APY</p>
                        <p className={styles.stakingText} style={{color: "#424242", fontSize: 12, margin: 0}}>(When
                            daily
                            compounded)</p>
                        <p className={styles.stakingText}
                           style={{color: "green", fontWeight: 'bold'}}>{(apy * 100).toFixed(4)}%</p>

                        <p className={styles.getTokenText}
                           onClick={() => window.open("https://spooky.fi/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/" + EASY_ADDRESS, "_blank")}>Get
                            $EASY-$USDC LP →</p>
                        <div className={styles.stakingInnerCard}>
                            <p style={{marginBottom: 0, color: '#424242', fontWeight: 'semi-bold'}}>$EASY-$USDC
                                Balance</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <p className={styles.balanceText}>{userLpBalance}</p>
                                <img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                                <img src="/usdc.png"
                                     style={{width: 20, height: 20, borderRadius: 10, marginLeft: -8}}/>
                            </div>
                            <p style={{
                                marginBottom: 0,
                                color: '#424242',
                                fontWeight: 'semi-bold',
                                marginTop: 16
                            }}>Staked
                                $EASY-$USDC</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <p className={styles.balanceText}>{userFarmBalance}</p>
                                <img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                                <img src="/usdc.png"
                                     style={{width: 20, height: 20, borderRadius: 10, marginLeft: -8}}/>
                            </div>
                            <p style={{
                                marginBottom: 0,
                                color: '#424242',
                                fontWeight: 'semi-bold',
                                marginTop: 16
                            }}>Claimable
                                Reward</p>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <p className={styles.balanceText}>{userReward}</p>
                                <img src="/favicon.png"
                                     style={{width: 20, height: 20, marginLeft: 8, borderRadius: 10}}/>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div className={styles.stakingButton} onClick={() => harvest()}>
                                    <p className={styles.stakingButtonText}>Claim</p>
                                </div>
                                <div className={styles.stakingButton} onClick={() => setOpen(true)}>
                                    <p className={styles.stakingButtonText}>Stake</p>
                                </div>
                                <div className={styles.stakingButton} onClick={() => setWithdrawOpen(true)}>
                                    <p className={styles.stakingButtonText}>Unstake</p>
                                </div>
                            </div>
                        </div>
                    </div>}
        </>
    )
}
