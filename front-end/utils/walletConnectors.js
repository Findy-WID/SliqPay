//Metamask Wallet Connector
export const metamaskConnect = async() => {
    if(!window.ethereum) {
        alert("Metamask no detected");
        return null;
    };
    try {
        const account = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return account[0];

    } catch (error) {
        console.error("Metamask connection error", error);
        return null;
    }
}

//Coinbase Wallet Connector
export const coinbaseConnect = async() => {
    const provider = window.coinbaseWalletExtention;

    if(!provider) {
        alert("Coinbase Wallet not detected");
    };

    try {
        const account = provider.request({
            method: "eth_requestAccounts",
        });
        return account;

    } catch (error) {
        console.error("Error connecting Coinbase Wallet", error);
        return null;
    }
}

//Binance Wallet Connector
export const binanceConnect = async() => {
    const provider = window.BinanceChain;

    if(!provider) {
        alert("Binance wallet not detected");
    };

    try {
        const account = provider.request({
            method: "eth_requestAccounts",
        });
        return account;

    } catch (error) {
        console.error("Error in connecting Binance wallet", error);
        return null;
    };
}