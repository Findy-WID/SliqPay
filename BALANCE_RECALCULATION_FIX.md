# Balance Recalculation Fix

## Problem
The balance was not being recalculated after each transaction because:
1. All pages used **hardcoded mock balances** (`const balance = 25000`)
2. No centralized balance state existed
3. No API calls were made to fetch the real balance from the backend
4. Balance was not refreshed after transactions completed

## Solution Overview
Implemented a centralized balance management system using React Context that:
1. Fetches real balance from the backend API
2. Shares balance state across all dashboard pages
3. Automatically refreshes balance after each transaction
4. Refreshes balance when returning to the dashboard

## Changes Made

### 1. Extended UserContext (`front-end/contexts/UserContext.tsx`)

**Added to interface:**
```typescript
interface UserData {
  sliqId: string;
  email: string;
  name: string;
  initials: string;
  userId?: string; // Added to fetch accounts
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUser: (updates: Partial<UserData>) => void;
  clearUser: () => void;
  account: Account | null;           // NEW
  balance: number;                   // NEW
  isLoadingAccount: boolean;         // NEW
  refreshAccount: () => Promise<void>; // NEW
}
```

**Added state management:**
```typescript
const [account, setAccount] = useState<Account | null>(null);
const [balance, setBalance] = useState<number>(0);
const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(false);
```

**Added refresh function:**
```typescript
const refreshAccount = async () => {
  if (!user?.userId) return;
  
  setIsLoadingAccount(true);
  try {
    const { accounts } = await getAccountsByUser(user.userId);
    if (accounts && accounts.length > 0) {
      const ngnAccount = accounts.find(acc => acc.currency === 'NGN') || accounts[0];
      setAccount(ngnAccount);
      setBalance(ngnAccount.balance);
    }
  } catch (error) {
    console.error("Failed to fetch account balance:", error);
    setBalance(25000); // Fallback to default
  } finally {
    setIsLoadingAccount(false);
  }
};
```

**Auto-fetch on user login:**
```typescript
useEffect(() => {
  if (user?.userId) {
    refreshAccount();
  }
}, [user?.userId]);
```

### 2. Dashboard Page (`front-end/app/dashboard/page.tsx`)

**Before:**
```typescript
const balance = useMemo(() => 25000, []);
```

**After:**
```typescript
const { user, balance, isLoadingAccount, refreshAccount } = useUser();

useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 1500);
  
  // Refresh account balance when returning to dashboard
  refreshAccount();
  
  return () => clearTimeout(timer);
}, [refreshAccount]);
```

### 3. Transaction Pages Updated

All transaction pages now:
1. Import `useUser` hook
2. Use context balance instead of hardcoded value
3. Call `refreshAccount()` before redirecting to dashboard

#### Convert Page (`front-end/app/dashboard/convert/page.tsx`)
```typescript
import { useUser } from "@/contexts/UserContext";

const { balance, refreshAccount } = useUser();

const handleConvert = async () => {
  if (!isFormValid) return;
  
  // ... conversion logic ...
  
  await refreshAccount(); // NEW
  router.push("/dashboard");
};
```

#### Airtime Page (`front-end/app/dashboard/utilities/airtime/page.tsx`)
```typescript
import { useUser } from "@/contexts/UserContext";

const { balance, refreshAccount } = useUser();

<AirtimeSuccessScreen
  amount={Number(amount || 0)}
  phone={phoneNumber}
  networkName={networks.find(n => n.code === network)?.name || network}
  networkLogo={networks.find(n => n.code === network)?.logo}
  onDone={async () => {
    await refreshAccount(); // NEW
    router.push('/dashboard');
  }}
/>
```

#### Data Page (`front-end/app/dashboard/utilities/data/page.tsx`)
Same pattern as Airtime - replaced hardcoded balance and added refresh on completion.

#### Bills Page (`front-end/app/dashboard/utilities/bills/page.tsx`)
Same pattern as Airtime - replaced hardcoded balance and added refresh on completion.

#### Send Money Page (`front-end/app/dashboard/send/recipient/page.tsx`)
```typescript
import { useUser } from "@/contexts/UserContext";

const { refreshAccount } = useUser();

<button
  onClick={async () => {
    await refreshAccount(); // NEW
    router.push('/dashboard');
  }}
  className="h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
>
  Done
</button>
```

#### Receive Money Page (`front-end/app/dashboard/receive/page.tsx`)
```typescript
const { user, refreshAccount } = useUser();

<button
  onClick={async () => {
    await refreshAccount(); // NEW
    router.push("/dashboard");
  }}
  className="w-full bg-white text-green-600 font-semibold py-3 rounded-xl border-2 border-green-600 hover:bg-green-50 transition-colors"
>
  Back home
</button>
```

## Flow Diagram

```
User completes transaction
        ↓
Transaction succeeds
        ↓
refreshAccount() called
        ↓
API: GET /account/user/{userId}
        ↓
Context updates balance state
        ↓
Router navigates to /dashboard
        ↓
Dashboard mounts
        ↓
refreshAccount() called again (ensures fresh data)
        ↓
Display updated balance
```

## Testing Checklist

- [ ] **Initial Load**: Dashboard displays correct balance on first load
- [ ] **Airtime Purchase**: Balance decrements after airtime purchase
- [ ] **Data Purchase**: Balance decrements after data purchase
- [ ] **Bills Payment**: Balance decrements after bills payment
- [ ] **Send Money**: Balance decrements after sending money
- [ ] **Convert**: Balance changes after currency conversion
- [ ] **Receive Money**: Returning from receive page shows current balance
- [ ] **Multiple Transactions**: Balance continues to update correctly after multiple transactions
- [ ] **Error Handling**: Falls back to 25,000 if API fails
- [ ] **Loading State**: `isLoadingAccount` shows loading indicator

## API Requirements

The backend must:
1. Provide `GET /api/v1/account/user/{userId}` endpoint
2. Return accounts array with balance information
3. Update account balance atomically during transactions
4. Return updated balance in transaction response

## User Data Requirements

For the balance system to work, the `UserContext` must have:
- `user.userId` - Used to fetch accounts from the API

This should be set during login/signup:
```typescript
setUser({
  sliqId: "...",
  email: "...",
  name: "...",
  initials: "...",
  userId: "..." // Required for balance fetching
});
```

## Known Issues

1. **TypeScript Warning**: There's a harmless TypeScript warning in UserContext about React.ReactNode types. This is a known issue with React 18/19 type definitions and doesn't affect runtime behavior.

2. **Fallback Balance**: If the API fails, the balance falls back to 25,000. Consider showing an error message to the user instead.

3. **Currency Support**: Currently only fetches NGN accounts. If multiple currencies are supported, you may need to add currency selection UI.

## Future Enhancements

1. **Optimistic Updates**: Update balance immediately in UI, then sync with backend
2. **WebSocket Updates**: Real-time balance updates via WebSocket
3. **Transaction History**: Show recent transactions on dashboard with balance changes
4. **Balance Animations**: Animate balance changes for better UX
5. **Error Notifications**: Show toast messages if balance fetch fails
6. **Retry Logic**: Add retry mechanism for failed API calls
7. **Caching**: Cache balance with short TTL to reduce API calls
