import styles from "../styles/Home.module.css";
import React, {useState} from 'react'
import {Dropdown} from 'semantic-ui-react';
import {EASY_ADDRESS} from "../contracts/EasyToken";
import {Radio} from 'semantic-ui-react'
import {CircleLoader} from "react-spinners";

const friendOptions = [
    {
        key: 'EASY',
        text: 'EASY',
        value: EASY_ADDRESS,
        image: {avatar: true, src: '/favicon.png'},
    },
    {
        key: 'ETH',
        text: 'ETH',
        value: 'ETH',
        image: {avatar: true, src: '/favicon.png'},
    },
    {
        key: 'WFTM',
        text: 'WFTM',
        value: 'WFTM',
        image: {avatar: true, src: '/favicon.png'},
    },
]

const expiryOptions = [
    {
        key: '1month',
        text: "1 Month",
        value: 30
    },
    {
        key: '3month',
        text: "3 Months",
        value: 90
    },
    {
        key: '6month',
        text: "6 Months",
        value: 180
    },
    {
        key: '12month',
        text: "1 Year",
        value: 360
    },
    {
        key: 'custom',
        text: "Custom",
        value: 0
    },

]

export default function CreateBackupBox(props) {
    const [token, setToken] = useState("");
    const [isAmountInfinite, setIsAmountInfinite] = useState(true);
    const [amount, setAmount] = useState(0);
    const [backupWallet, setBackupWallet] = useState("");
    const [isExpiryCustom, setIsExpiryCustom] = useState(false);
    const [expiry, setExpiry] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <h2 className={styles.subTitle}>
                Create Backup
            </h2>
            <p className={styles.sectionDescription}>- Select a token, amount, backup wallet, and expiry time.
                <br/>- After the expiry time has passed, the backup wallet can claim those tokens from your wallet. You
                can reset the expiry time by interacting with the contract.
                <br/>- You need to complete two transactions, one for token spending, and the other one for creating the
                backup.</p>
            <div className={styles.backupCreationCard}>
                <div className={styles.backupRow}>
                    <p className={styles.backupTitle}>Token: </p>
                    <Dropdown
                        placeholder='Select Token'
                        fluid
                        selection
                        options={friendOptions}
                        onChange={(e, {value}) => setToken(value)}
                    />
                </div>

                <div className={styles.backupRow}>
                    <p className={styles.backupTitle}>Amount: </p>
                    <Radio
                        label='Infinite'
                        name='radioGroup'
                        value='this'
                        checked={isAmountInfinite}
                        onChange={() => setIsAmountInfinite(true)}
                    />
                    <Radio
                        label='Custom'
                        name='radioGroup'
                        value='that'
                        checked={!isAmountInfinite}
                        onChange={() => setIsAmountInfinite(false)}
                        style={{marginLeft: 16}}
                    />
                </div>
                {!isAmountInfinite ?
                    <div className={styles.backupRow}>
                        <p className={styles.backupTitle}>Custom Amount: </p>
                        <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                               value={amount}
                               onChange={(b) => {
                                   let newValue = parseInt(b.target.value);
                                   if (newValue) {
                                       setAmount(newValue)
                                   } else {
                                       setAmount(0);
                                   }
                               }}>

                        </input>
                    </div>
                    : null}
                <div className={styles.backupRow}>
                    <p className={styles.backupTitle}>Backup Wallet: </p>
                    <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                           value={backupWallet}
                           placeholder={"0x..."}
                           onChange={(b) => {
                               setBackupWallet(b.target.value)
                           }}>

                    </input>
                </div>

                <div className={styles.backupRow}>
                    <p className={styles.backupTitle}>Access Time: </p>
                    <Dropdown
                        placeholder='Select Access Time'
                        fluid
                        selection
                        options={expiryOptions}
                        onChange={(e, {value}) => {
                            if (value == 0) {
                                setIsExpiryCustom(true);
                                setExpiry(value);
                            } else {
                                setIsExpiryCustom(false);
                                setExpiry(value);
                            }
                        }}
                    />
                </div>
                {isExpiryCustom ?
                    <div className={styles.backupRow}>
                        <p className={styles.backupTitle}>Custom Access Time: </p>
                        <input className={styles.walletInput} type={"text"} id={"backup-amount"}
                               value={expiry}
                               onChange={(b) => {
                                   let newValue = parseInt(b.target.value);
                                   if (newValue) {
                                       setExpiry(newValue)
                                   } else {
                                       setExpiry(0);
                                   }
                               }}
                               style={{marginRight: 8}}>

                        </input>
                        <p className={styles.backupTitle}>days</p>
                    </div>
                    : null}
                <div className={styles.backupRow}>
                    <div className={styles.mintButton} onClick={async () => null} style={{width: '100%'}}>
                        {props.isLoading ?
                            <CircleLoader color={"#3a70ed"} size={25}/>
                            :
                            <p className={styles.mintText}>Create Backup</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
