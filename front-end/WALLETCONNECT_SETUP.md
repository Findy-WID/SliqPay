# WalletConnect Integration Setup

## Overview
This implementation uses WalletConnect (Web3Modal) with wagmi to enable wallet connections in the SliqPay signup flow.

## Features Implemented
- ✅ WalletConnect integration with Web3Modal
- ✅ Support for multiple wallets (MetaMask, Coinbase Wallet, Trust Wallet, etc.)
- ✅ Connection state management
- ✅ Success state with wallet address display
- ✅ Disconnect functionality
- ✅ Session persistence (stores wallet address in sessionStorage)
- ✅ Multi-chain support (Ethereum, Polygon, Arbitrum, Base, Optimism)

## Setup Instructions

### 1. Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment Variables
Create a `.env.local` file in the `front-end` directory:

```bash
cp .env.local.example .env.local
```

Then add your WalletConnect Project ID:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

### 3. Dependencies Installed
The following packages have been installed:
- `@web3modal/wagmi` - WalletConnect modal UI
- `wagmi` - React hooks for Ethereum
- `viem` - TypeScript interface for Ethereum
- `@tanstack/react-query` - Data fetching library

## How It Works

### File Structure
```
front-end/
├── lib/
│   └── web3.ts                 # Web3Modal & wagmi config
├── components/
│   └── Web3Provider.tsx        # Web3 context provider
├── app/
│   ├── layout.tsx              # Root layout with Web3Provider
│   └── auth/signup/connect-wallet/
│       └── page.tsx            # Connect wallet page
```

### User Flow
1. User clicks any wallet button
2. Web3Modal opens with available wallet options
3. User connects their wallet via WalletConnect or browser extension
4. Connected state shows success message with wallet address
5. Wallet address is saved to sessionStorage
6. User can continue to next signup step or disconnect

### Key Components

#### `Web3Provider` (components/Web3Provider.tsx)
Wraps the app with wagmi and react-query providers, enabling wallet functionality throughout the app.

#### Connect Wallet Page (app/auth/signup/connect-wallet/page.tsx)
- Uses `useAccount()` to track connection state
- Uses `useWeb3Modal()` to open the modal
- Shows different UI based on connection state
- Formats and displays wallet address when connected
- Allows disconnect and saves address to session

## Usage in Other Components

To use wallet connection in other parts of your app:

```tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function MyComponent() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect()}>Connect</button>
      )}
    </div>
  );
}
```

## Supported Wallets
- MetaMask
- Coinbase Wallet
- Trust Wallet
- Rainbow
- WalletConnect compatible wallets (300+)
- Any browser extension wallet

## Chains Supported
- Ethereum Mainnet
- Polygon
- Arbitrum
- Base
- Optimism

To add more chains, edit `front-end/lib/web3.ts` and import from `wagmi/chains`.

## Testing
1. Make sure you have the `.env.local` file with valid Project ID
2. Run `npm run dev`
3. Navigate to `/auth/signup/connect-wallet`
4. Click any wallet button to test connection
5. Use MetaMask browser extension or WalletConnect mobile app

## Next Steps
- [ ] Store wallet address in database after signup completion
- [ ] Add wallet balance display on dashboard
- [ ] Implement transaction signing for crypto transfers
- [ ] Add network switching UI
- [ ] Add ENS name resolution for wallet addresses

## Troubleshooting

### Modal doesn't open
- Check that NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set correctly
- Verify project ID is valid in WalletConnect Cloud

### Connection fails
- Ensure wallet app/extension is installed
- Check browser console for errors
- Try different wallet option

### Type errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` cache and rebuild: `rm -rf .next && npm run dev`

## Resources
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [wagmi Docs](https://wagmi.sh/)
- [Web3Modal Docs](https://docs.walletconnect.com/web3modal/about)
