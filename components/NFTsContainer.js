import styles from "../styles/Home.module.css";
import {useEffect, useState} from "react";

export default function NFTsContainer(props) {
    const [parsedNFTs, setParsedNFTs] = useState([]);

    async function parseNFTs() {
        try {
            let tmpParsedNFTs = []
            for (let i = 0; i < props.userNFTs.length; i++) {
                tmpParsedNFTs.push(JSON.parse(atob((await props.nftContract.tokenURI(props.userNFTs[i])).slice(29))));
            }
            setParsedNFTs(tmpParsedNFTs);
        } catch (e) {
            await parseNFTs();
        }
    }

    useEffect(() => {
        parseNFTs();
    }, [props.userNFTs])

    return (
        props.userNFTCount > 0 ?
            <>
                <div className={styles.grid}>
                    {parsedNFTs.map((item) =>
                        <a className={styles.nftBox}
                           style={{
                               width: window.innerWidth < 960 ? 140 : 160,
                               height: window.innerWidth < 960 ? 180 : 200,
                           }}
                           href={'https://paintswap.finance/marketplace/assets/0x5d6f546f2357e84720371a0510f64dbc3fbace33/' + item.name.slice(15)}
                           target={"_blank"}>
                            <img src={`data:image/svg+xml;base64,${item.image.slice(26)}`}
                                 style={{width: '100%'}}/>
                            <p style={{
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: '#000',
                                fontSize: window.innerWidth < 960 ? 12 : 16
                            }}>
                                {item.name}</p>
                        </a>)}
                </div>
                <a className={styles.learnMore} href={"https://paintswap.finance/marketplace/user"}
                   target={"_blank"}>
                    <h3>Browse All on PaintSwap &rarr;</h3>
                </a>
            </> : <p>You don't own any Easy Club NFTs mint one now!</p>
    )
        ;
}
