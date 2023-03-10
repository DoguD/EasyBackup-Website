import {EASY_ADDRESS} from "../../contracts/InProduction/EasyToken";

export const MAX_BIG_INT = BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639935);

export const EXPIRY_OPTIONS = [
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
        value: 365
    },
    {
        key: 'custom',
        text: "Custom",
        value: 0
    },

]

export const TOKENS = [
    {
        key: 'wETH',
        text: 'wETH',
        value: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        image: {avatar: true, src: '/weth.webp'},
    },
    {
        key: 'wFTM',
        text: 'wFTM',
        value: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
        image: {avatar: true, src: '/wftm.webp'},
    },
    {
        key: 'USDC',
        text: 'USDC',
        value: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
        image: {avatar: true, src: '/usdc.png'},
    },
    {
        key: 'DAI',
        text: 'DAI',
        value: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
        image: {avatar: true, src: '/dai.png'},
    },
    {
        key: 'fUSDT',
        text: 'fUSDT',
        value: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
        image: {avatar: true, src: '/fUSDT.png'},
    },
    {
        key: 'BOO',
        text: 'BOO',
        value: '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE',
        image: {avatar: true, src: '/boo.png'},
    },
    {
        key: 'BNB',
        text: 'BNB',
        value: '0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454',
        image: {avatar: true, src: '/bnb.png'},
    },
    {
        key: 'AVAX',
        text: 'AVAX',
        value: '0x511D35c52a3C244E7b8bd92c0C297755FbD89212',
        image: {avatar: true, src: '/AVAX.png'},
    },
    {
        key: 'BRUSH',
        text: 'BRUSH',
        value: '0x85dec8c4B2680793661bCA91a8F129607571863d',
        image: {avatar: true, src: '/brush.webp'},
    },
    {
        key: "EASY",
        text: "EASY",
        value: EASY_ADDRESS,
        image: {avatar: true, src: '/favicon.png'},
    },
]

export const TOKEN_MAP = {
    '0x74b23882a30290451A17c44f4F05243b6b58C76d': 'wETH',
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83': 'wFTM',
    '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75': 'USDC',
    '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E': 'DAI',
    '0x049d68029688eAbF473097a2fC38ef61633A3C7A': 'fUSDT',
    '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE': 'BOO',
    '0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454': 'BNB',
    '0x511D35c52a3C244E7b8bd92c0C297755FbD89212': 'AVAX',
    '0x85dec8c4B2680793661bCA91a8F129607571863d': 'BRUSH',
    EASY_ADDRESS: 'EASY'
}
