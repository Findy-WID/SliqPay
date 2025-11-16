/send/page.tsx:
"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { publicClient } from "@/utils/client";
import { CURRENCY_TOKENS } from "@/lib/currencies";
import fxOracleAbi from "@/utils/fxOracleAbi.json";


export default function SendMoneyPage() {
    const router = useRouter();
    const [sendAmount, setSendAmount] = useState("");
    const [sendCurrency, setSendCurrency] = useState("NGN");
    const [receiveCurrency, setReceiveCurrency] = useState("GHS");
    const [remark, setRemark] = useState("");

    const [exchRate, setExchRate] = useState(null);


    // Exchange rate calculation
    const exchangeRate = 1500; // 1 USD = 1500 NGN (example)
    const transactionFee = 100;
    const ourFee = 100;
    const totalDeducted = transactionFee + ourFee;
    const feePercentage = 0.69;

    // recipientAmount will be derived from sendAmount and exchange rate
    const recipientAmount = (() => {
    const amt = parseFloat(sendAmount || "0");
    if (!amt || exchRate === null) return "0.00";
    return (amt * exchRate).toFixed(2);
    })();
   
    const currencyFlag = (code: string) => {
        switch (code) {
            case "NGN":
                return "🇳🇬";
            case "USD":
                return "🇺🇸";
            case "GHS":
                return "🇬🇭";
            case "EUR":
                return "🇪🇺";
            default:
                return "🏳️";
        }
    };

    useEffect(() => {
        async function fetchRate() {
            try {
                const tokenAddress = CURRENCY_TOKENS[sendCurrency as keyof typeof CURRENCY_TOKENS];
                const rate = publicClient.readContract({
                    address: process.env.NEXT_PUBLIC_FX_ORACLE_ADDRESS,
                    abi: fxOracleAbi,
                    functionName: "getRate",
                    args: [tokenAddress],
                });
                setExchRate(Number(rate));
            } catch (error) {
                console.error("Rate fetch failed:", error);
            }
        }
        fetchRate();
    }, [sendCurrency]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 ml-12 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Send Money</h1>
                </div>
            </header>

            <div className="px-4 py-6 max-w-md mx-auto">
                {/* Rate Guaranteed Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Lock size={18} className="text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">Rate guaranteed</span>
                </div>

                {/* Exchange Rate Display */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-cyan-100 px-6 py-3 rounded-full">
                        <span className="text-sm font-semibold text-cyan-900">
                            1 USD = 1500 NGN
                        </span>
                    </div>
                </div>

                {/* Send Amount Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Send amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            className="w-full px-4 py-4 pr-32 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <span className="text-base">{currencyFlag(sendCurrency)}</span>
                                <select
                                    value={sendCurrency}
                                    onChange={(e) => setSendCurrency(e.target.value)}
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 cursor-pointer"
                                >
                                    <option value="NGN">NGN</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GHS">GHS</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipient Gets Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Recipient gets
                    </label>
                    <div className="relative">
                        <div className="w-full px-4 py-4 pr-32 bg-gray-200 border border-gray-300 rounded-xl text-gray-600 font-medium">
                            {recipientAmount}
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <span className="text-base">{currencyFlag(receiveCurrency)}</span>
                                <select
                                    value={receiveCurrency}
                                    onChange={(e) => setReceiveCurrency(e.target.value)}
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 cursor-pointer"
                                >
                                    <option value="GHS">GHS</option>
                                    <option value="NGN">NGN</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remark Section */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Remark
                    </label>
                    <textarea
                        placeholder="Whats this for?"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>

                {/* Fee Breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Transaction Fee</span>
                            <span className="font-semibold text-gray-900">₦{transactionFee.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Our Fee</span>
                            <span className="font-semibold text-gray-900">₦{ourFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">
                                    Total deducted fee ({feePercentage}%)
                                </span>
                                <span className="text-base font-bold text-gray-900">
                                    ₦{totalDeducted.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={() => {
                        const url = new URL(window.location.origin + "/dashboard/send/recipient");
                        url.searchParams.set("sendAmount", sendAmount || "0");
                        url.searchParams.set("sendCurrency", sendCurrency);
                        url.searchParams.set("receiveAmount", recipientAmount || "0.00");
                        url.searchParams.set("receiveCurrency", receiveCurrency);
                        router.push(url.pathname + "?" + url.searchParams.toString());
                    }}
                    className={`w-full font-semibold py-4 rounded-xl transition-all ${
                        sendAmount && parseFloat(sendAmount) > 0 && remark.trim()
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!sendAmount || parseFloat(sendAmount) <= 0 || !remark.trim()}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

#TreasuryVault
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ISliqIDRegistry.sol";
import "./interfaces/IMockFxOracle.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TreasuryVault {
    address public constant NATIVE_TOKEN = address(0);

    ISliqIDRegistry public sliqIDRegistry;
    IMockFxOracle public fxOracle;

    mapping(string => mapping(address => uint256)) public sliqBalances;

    address public owner;

    mapping(address => bool) public operators;
    bool public paused;
    event PaymentRouted(
        address indexed sender,
        string indexed recipientSliqId,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event BalanceUpdated(
        string indexed sliqId,
        address indexed token,
        uint256 newBalance,
        uint256 timestamp
    );

    event AssetConverted(
        string indexed fromSliqId,
        string indexed toSliqId,
        address fromToken,
        address toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 rate,
        uint256 timestamp
    );

    event Withdrawn(
        address indexed token,
        uint256 amount,
        address indexed to,
        uint256 timestamp
    );

    event OperatorAdded(address indexed operator, uint256 timestamp);
    event OperatorRemoved(address indexed operator, uint256 timestamp);
    event RegistryUpdated(address indexed newRegistry, uint256 timestamp);
    event OracleUpdated(address indexed newOracle, uint256 timestamp);
    event Paused(uint256 timestamp);
    event Unpaused(uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "TreasuryVault: caller is not owner");
        _;
    }

    modifier onlyOperator() {
        require(
            operators[msg.sender] || msg.sender == owner,
            "TreasuryVault: caller is not operator"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "TreasuryVault: contract is paused");
        _;
    }

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "TreasuryVault: reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    constructor(address _sliqIDRegistry, address _fxOracle) {
        require(
            _sliqIDRegistry != address(0),
            "TreasuryVault: registry cannot be zero address"
        );

        sliqIDRegistry = ISliqIDRegistry(_sliqIDRegistry);
        fxOracle = IMockFxOracle(_fxOracle);  // Can be address(0) if not using conversions
        owner = msg.sender;
        paused = false;

        // Note: Owner is implicitly an operator (checked in onlyOperator modifier)
    }

    receive() external payable {
        // Accept native tokens without routing
        // Could emit event for tracking if needed
    }

    function routePayment(
        string memory recipientSliqId,
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        // Input validation
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(recipientSliqId).length > 0, "TreasuryVault: empty SliqID");
        require(token != address(0), "TreasuryVault: use routePaymentNative for native token");

        // Resolve and validate recipient
        address recipientWallet = sliqIDRegistry.resolveAddress(recipientSliqId);
        require(
            recipientWallet != address(0),
            "TreasuryVault: recipient SliqID not registered"
        );

        // Transfer tokens from sender to this contract
        // Note: Caller must have approved this contract for at least `amount`
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "TreasuryVault: token transfer failed");

        // Credit recipient's internal ledger
        _creditSliqID(recipientSliqId, token, amount);

        // Emit routing event for backend tracking
        emit PaymentRouted(msg.sender, recipientSliqId, token, amount, block.timestamp);
    }

    function routePaymentNative(string memory recipientSliqId)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        // Input validation
        require(msg.value > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(recipientSliqId).length > 0, "TreasuryVault: empty SliqID");

        // Resolve and validate recipient
        address recipientWallet = sliqIDRegistry.resolveAddress(recipientSliqId);
        require(
            recipientWallet != address(0),
            "TreasuryVault: recipient SliqID not registered"
        );

        // Credit recipient's internal ledger
        // Note: address(0) is used as identifier for native token
        _creditSliqID(recipientSliqId, NATIVE_TOKEN, msg.value);

        // Emit routing event for backend tracking
        emit PaymentRouted(msg.sender, recipientSliqId, NATIVE_TOKEN, msg.value, block.timestamp);
    }

    function _creditSliqID(string memory sliqId, address token, uint256 amount) internal {
        sliqBalances[sliqId][token] += amount;
        emit BalanceUpdated(sliqId, token, sliqBalances[sliqId][token], block.timestamp);
    }

    function _debitSliqID(string memory sliqId, address token, uint256 amount) internal {
        require(
            sliqBalances[sliqId][token] >= amount,
            "TreasuryVault: insufficient balance"
        );
        sliqBalances[sliqId][token] -= amount;
        emit BalanceUpdated(sliqId, token, sliqBalances[sliqId][token], block.timestamp);
    }

    function getBalance(string memory sliqId, address token)
        external
        view
        returns (uint256 balance)
    {
        return sliqBalances[sliqId][token];
    }

    function getBalances(string memory sliqId, address[] memory tokens)
        external
        view
        returns (uint256[] memory balances)
    {
        balances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = sliqBalances[sliqId][tokens[i]];
        }
        return balances;
    }

    function convertAsset(
        string memory fromSliqId,
        string memory toSliqId,
        address fromToken,
        address toToken,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyOperator {
        // Input validation
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(bytes(fromSliqId).length > 0, "TreasuryVault: empty from SliqID");
        require(bytes(toSliqId).length > 0, "TreasuryVault: empty to SliqID");
        require(address(fxOracle) != address(0), "TreasuryVault: oracle not configured");

        // Validate both SliqIDs exist
        address fromWallet = sliqIDRegistry.resolveAddress(fromSliqId);
        address toWallet = sliqIDRegistry.resolveAddress(toSliqId);
        require(fromWallet != address(0), "TreasuryVault: from SliqID not registered");
        require(toWallet != address(0), "TreasuryVault: to SliqID not registered");

        // Check sender has sufficient balance
        require(
            sliqBalances[fromSliqId][fromToken] >= amount,
            "TreasuryVault: insufficient balance for conversion"
        );

        // Get conversion rate from Oracle
        uint256 convertedAmount = fxOracle.convertAmount(fromToken, toToken, amount);
        require(convertedAmount > 0, "TreasuryVault: conversion resulted in zero");

        // Get rate for event emission
        uint256 fromRate = fxOracle.getRate(fromToken);

        // Atomically update both balances
        _debitSliqID(fromSliqId, fromToken, amount);
        _creditSliqID(toSliqId, toToken, convertedAmount);

        // Emit conversion event
        emit AssetConverted(
            fromSliqId,
            toSliqId,
            fromToken,
            toToken,
            amount,
            convertedAmount,
            fromRate,
            block.timestamp
        );
    }

    function withdraw(address token, uint256 amount, address to)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "TreasuryVault: cannot withdraw to zero address");
        require(amount > 0, "TreasuryVault: amount must be greater than 0");

        // Check contract has sufficient balance
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance >= amount, "TreasuryVault: insufficient contract balance");

        // Transfer tokens
        bool success = IERC20(token).transfer(to, amount);
        require(success, "TreasuryVault: token transfer failed");

        emit Withdrawn(token, amount, to, block.timestamp);
    }

    function withdrawNative(uint256 amount, address payable to)
        external
        onlyOwner
        nonReentrant
    {
        require(to != address(0), "TreasuryVault: cannot withdraw to zero address");
        require(amount > 0, "TreasuryVault: amount must be greater than 0");
        require(address(this).balance >= amount, "TreasuryVault: insufficient balance");

        // Transfer native tokens using call (recommended over transfer/send)
        (bool success, ) = to.call{value: amount}("");
        require(success, "TreasuryVault: native transfer failed");

        emit Withdrawn(NATIVE_TOKEN, amount, to, block.timestamp);
    }

    function pause() external onlyOwner {
        require(!paused, "TreasuryVault: already paused");
        paused = true;
        emit Paused(block.timestamp);
    }

    function unpause() external onlyOwner {
        require(paused, "TreasuryVault: not paused");
        paused = false;
        emit Unpaused(block.timestamp);
    }

    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "TreasuryVault: operator cannot be zero address");
        require(!operators[operator], "TreasuryVault: already an operator");

        operators[operator] = true;
        emit OperatorAdded(operator, block.timestamp);
    }

    function removeOperator(address operator) external onlyOwner {
        require(operators[operator], "TreasuryVault: not an operator");

        operators[operator] = false;
        emit OperatorRemoved(operator, block.timestamp);
    }

    function setSliqIDRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "TreasuryVault: registry cannot be zero address");

        sliqIDRegistry = ISliqIDRegistry(newRegistry);
        emit RegistryUpdated(newRegistry, block.timestamp);
    }

    function setFxOracle(address newOracle) external onlyOwner {
        fxOracle = IMockFxOracle(newOracle);
        emit OracleUpdated(newOracle, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TreasuryVault: new owner cannot be zero address");
        owner = newOwner;
    }

    function isOperator(address account) external view returns (bool) {
        return operators[account] || account == owner;
    }
}


#/send/recipient/page.tsx
"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function RecipientInner() {
    const router = useRouter();
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankName, setBankName] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Values from previous page (query params) - parsed on client to avoid Suspense requirement
    const [sendAmountParam, setSendAmountParam] = useState<string>("0");
    const [sendCurrencyParam, setSendCurrencyParam] = useState<string>("NGN");
    const [receiveAmountParam, setReceiveAmountParam] = useState<string>("0.00");
    const [receiveCurrencyParam, setReceiveCurrencyParam] = useState<string>("GHS");

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const url = new URL(window.location.href);
            const sp = url.searchParams;
            const sendAmt = sp.get("sendAmount") || "0";
            const sendCur = sp.get("sendCurrency") || "NGN";
            const recvAmt = sp.get("receiveAmount") || "0.00";
            const recvCur = sp.get("receiveCurrency") || "GHS";
            setSendAmountParam(sendAmt);
            setSendCurrencyParam(sendCur);
            setReceiveAmountParam(recvAmt);
            setReceiveCurrencyParam(recvCur);
        } catch (e) {
            // ignore malformed URL
        }
    }, []);

    const formatAmount = (val: string) => {
        const num = Number(val.replace(/,/g, ""));
        if (Number.isNaN(num)) return "0.00";
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const recentRecipients = [
        { id: 1, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
        { id: 2, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
        { id: 3, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
    ];

    // Validation rules
    const isAccountNumberValid = accountNumber.trim().length > 0 && /^\d+$/.test(accountNumber);
    const isAccountNameValid = accountName.trim().length > 0 && /^[A-Za-z ]+$/.test(accountName.trim());
    const isBankNameValid = bankName.trim().length > 0 && /^[A-Za-z ]+$/.test(bankName.trim());
    const isFormValid = isAccountNumberValid && isAccountNameValid && isBankNameValid;

    const handleSendMoney = () => {
        if (!isFormValid) return;
        // Open confirmation sheet/modal
        setShowConfirm(true);
    };

    const handleConfirmTransfer = () => {
        // TODO: integrate real transfer submission
        console.log("Transfer confirmed", { accountNumber, accountName, bankName });
        setShowConfirm(false);
        setShowSuccess(true);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 ml-12 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Send Money</h1>
                </div>
            </header>

            <div className="px-4 py-6 max-w-md mx-auto">
                {/* Rate Guaranteed Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Lock size={18} className="text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">Rate guaranteed</span>
                </div>

                {/* Exchange Rate Display */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-cyan-100 px-6 py-3 rounded-full">
                        <span className="text-sm font-semibold text-cyan-900">
                            1 USD = 1500 NGN
                        </span>
                    </div>
                </div>

                {/* Account Number */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Account Number
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="234567890"
                        value={accountNumber}
                        onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setAccountNumber(digitsOnly);
                        }}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>

                {/* Account Name and Bank Name Row */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Account Name
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={accountName}
                            onChange={(e) => {
                                const alphaOnly = e.target.value.replace(/[^A-Za-z ]/g, "");
                                setAccountName(alphaOnly);
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            placeholder="United Bank Limited"
                            value={bankName}
                            onChange={(e) => {
                                const alphaOnly = e.target.value.replace(/[^A-Za-z ]/g, "");
                                setBankName(alphaOnly);
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Send Money Button */}
                <button
                    onClick={handleSendMoney}
                    disabled={!isFormValid}
                    className={`w-full font-semibold py-4 rounded-xl transition-all shadow-md mb-8 ${
                        isFormValid
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Send Money
                </button>

                {/* Recents Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recents</h2>
                        <button className="text-sm font-semibold text-green-600 hover:text-green-700">
                            View All
                        </button>
                    </div>

                    {/* Recent Recipients List */}
                    <div className="space-y-3">
                        {recentRecipients.map((recipient) => (
                            <button
                                key={recipient.id}
                                onClick={() => {
                                    setAccountNumber(recipient.account);
                                    setAccountName(recipient.name);
                                    setBankName(recipient.bank);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {recipient.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {recipient.account} • {recipient.bank}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <Image
                                            src="/Sliqpay visual icon.png"
                                            alt="SliqPay logo"
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 object-contain"
                                            priority
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        
        {/* Confirmation Overlay: mobile bottom sheet, desktop centered modal */}
        <div className={`fixed inset-0 z-50 ${showConfirm ? '' : 'pointer-events-none'}`} aria-hidden={!showConfirm}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showConfirm ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setShowConfirm(false)}
            />

            {/* Panel: mobile bottom, desktop centered */}
            <div
                className={[
                    'absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-xl',
                    'rounded-t-2xl md:rounded-2xl',
                    'transition-all duration-300',
                    showConfirm ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95',
                    'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                ].join(' ')}
                role="dialog"
                aria-modal="true"
            >
                {/* Grab handle for mobile */}
                <div className="md:hidden flex justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="p-5 md:p-6">
                    <h2 className="text-center text-xl font-bold text-gray-900">Confirmation</h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Review all transfer details before you continue.<br className="hidden md:block" />
                        Transfers are final once completed and cannot be reversed.
                    </p>

                    {/* Details card */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 md:p-5 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>

                        <dl className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900">{accountName || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Account No.</dt>
                                <dd className="text-sm font-semibold text-gray-900 tracking-wider">{accountNumber || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Bank</dt>
                                <dd className="text-sm font-semibold text-gray-900">{bankName || '—'}</dd>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Amount</dt>
                                <dd className="relative space-y-2">
                                    {/* Top: Send amount */}
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-200 px-3 py-2 shadow-sm min-w-[220px]">
                                        <span className="font-extrabold text-gray-900">{formatAmount(sendAmountParam)}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                                            <span className="text-base leading-none">
                                                {sendCurrencyParam === 'NGN' ? '🇳🇬' : sendCurrencyParam === 'GHS' ? '🇬🇭' : '🏳️'}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700">{sendCurrencyParam}</span>
                                        </span>
                                    </div>

                                    {/* Switch icon between amounts */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                        <div className="h-7 w-7 grid place-items-center rounded-lg bg-gray-700 text-white shadow">
                                            <ArrowUpDown size={14} />
                                        </div>
                                    </div>

                                    {/* Bottom: Receive amount */}
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-200 px-3 py-2 shadow-sm min-w-[220px]">
                                        <span className="font-extrabold text-gray-900">{formatAmount(receiveAmountParam)}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                                            <span className="text-base leading-none">
                                                {receiveCurrencyParam === 'GHS' ? '🇬🇭' : receiveCurrencyParam === 'NGN' ? '🇳🇬' : '🏳️'}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700">{receiveCurrencyParam}</span>
                                        </span>
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Fee note */}
                    <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-700">
                        You will be charged a total of <span className="font-semibold">{sendCurrencyParam} {formatAmount(sendAmountParam)}</span> including transaction fee
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmTransfer}
                            className="h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                        >
                            Send Money
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Success Overlay: mobile bottom sheet, desktop centered modal */}
        <div className={`fixed inset-0 z-50 ${showSuccess ? '' : 'pointer-events-none'}`} aria-hidden={!showSuccess}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setShowSuccess(false)}
            />

            {/* Panel */}
            <div
                className={[
                    'absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-xl',
                    'rounded-t-2xl md:rounded-2xl',
                    'transition-all duration-300',
                    showSuccess ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95',
                    'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                ].join(' ')}
                role="dialog"
                aria-modal="true"
            >
                {/* Grab handle for mobile */}
                <div className="md:hidden flex justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="p-6">
                    {/* Success emblem */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ring */}
                                <circle cx="48" cy="48" r="30" stroke="#16A34A" strokeWidth="6"/>
                                {/* Check */}
                                <path d="M36 50l9 9 16-20" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                                {/* Orbital dots (8 positions) */}
                                <circle cx="48" cy="8" r="3" fill="#A7F3D0"/>
                                <circle cx="76.3" cy="19.7" r="2.5" fill="#22C55E"/>
                                <circle cx="88" cy="48" r="3" fill="#A7F3D0"/>
                                <circle cx="76.3" cy="76.3" r="2.5" fill="#22C55E"/>
                                <circle cx="48" cy="88" r="3" fill="#A7F3D0"/>
                                <circle cx="19.7" cy="76.3" r="2.5" fill="#22C55E"/>
                                <circle cx="8" cy="48" r="3" fill="#A7F3D0"/>
                                <circle cx="19.7" cy="19.7" r="2.5" fill="#22C55E"/>
                            </svg>
                        </div>
                    </div>

                    {/* Amount and status */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-emerald-600 font-extrabold text-xl">{formatAmount(sendAmountParam)}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                            <span className="text-base leading-none">{sendCurrencyParam === 'NGN' ? '🇳🇬' : sendCurrencyParam === 'GHS' ? '🇬🇭' : '🏳️'}</span>
                            <span className="text-xs font-semibold text-gray-700">{sendCurrencyParam}</span>
                        </span>
                    </div>
                    <p className="mt-2 text-center text-base font-semibold text-gray-900">Sent Successfully</p>

                    {/* Details card */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>
                        <dl className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900">{accountName || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Account No.</dt>
                                <dd className="text-sm font-semibold text-gray-900 tracking-wider">{accountNumber || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Bank</dt>
                                <dd className="text-sm font-semibold text-gray-900">{bankName || '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-1">
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default function SendMoneyRecipientPage() {
    return <RecipientInner />;
}

