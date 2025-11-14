# Utilities System Implementation

## Overview
Complete implementation of the Airtime & Utilities system with landing page, subpages, and dashboard integration.

## Files Created

### 1. Landing Page
**Location:** `/app/dashboard/utilities/page.tsx`

**Features:**
- 3 service cards with color-coded design:
  - Buy Airtime (blue gradient)
  - Buy Data (purple gradient)
  - Pay Bills (green gradient)
- Icons and descriptions for each service
- Hover effects and smooth transitions
- Routes to respective subpages

### 2. Buy Airtime Page
**Location:** `/app/dashboard/utilities/airtime/page.tsx`

**Features:**
- Country selector dropdown (Nigeria, Ghana, Kenya)
- Network selection buttons (MTN, GLO, Airtel, 9mobile)
- Phone number input with contact picker icon
- Amount input with validation (₦5 - ₦50,000)
- Balance display (₦25,000.00)
- Form validation with disabled/enabled state
- Inline preview screen showing:
  - Transaction amount in cyan badge
  - Phone number
  - Amount
  - Network
  - Continue button for confirmation

**Validation:**
- Minimum amount: ₦5
- Maximum amount: ₦50,000
- Cannot exceed balance
- Phone number must be at least 10 digits
- All fields required

### 3. Buy Data Page
**Location:** `/app/dashboard/utilities/data/page.tsx`

**Features:**
- Country selector dropdown
- Network selection buttons (MTN, GLO, Airtel, 9mobile)
- Phone number input with contact picker
- Data plan dropdown with pricing:
  - MTN: 110MB (₦100), 350MB (₦300), 1GB (₦500), 2GB (₦1,000), 5GB (₦2,000)
  - GLO: 200MB (₦100), 500MB (₦350), 1.6GB (₦500), 3.2GB (₦1,000), 7.5GB (₦2,000)
  - Airtel: 100MB (₦100), 350MB (₦300), 1.5GB (₦500), 3GB (₦1,000), 6GB (₦2,000)
  - 9mobile: 150MB (₦100), 500MB (₦350), 1.5GB (₦500), 3GB (₦1,000), 5GB (₦2,000)
- Balance display
- Form validation with purple theme
- Inline preview screen showing:
  - Transaction amount in purple badge
  - Phone number
  - Plan details
  - Validity period
  - Network
  - Amount
  - Continue button

**Validation:**
- Network must be selected before plans are available
- Plan dropdown auto-resets when network changes
- Cannot proceed if plan price exceeds balance
- All fields required

### 4. Pay Bills Page
**Location:** `/app/dashboard/utilities/bills/page.tsx`

**Features:**
- Country selector dropdown
- Category selection (Electricity ⚡, Cable TV 📺)
- Biller modal with selection interface:
  - Electricity billers: EKEDC, IKEDC, AEDC, PHED
  - Cable TV billers: DStv, GOtv, StarTimes, Showmax
- Dynamic form fields based on category:
  
  **Electricity:**
  - Meter number input (numeric only)
  - Amount input with validation
  - Balance display
  
  **Cable TV:**
  - Smart card number input (numeric only)
  - Package dropdown with pricing:
    - DStv: Compact (₦10,500), Compact Plus (₦16,600), Premium (₦24,500)
    - GOtv: Joli (₦3,300), Jolli (₦4,150), Max (₦5,700)
    - StarTimes: Basic (₦2,200), Smart (₦3,200), Super (₦5,500)
    - Showmax: Mobile (₦1,450), Standard (₦2,900), Pro (₦6,300)
  
- Inline preview screen showing:
  - Transaction amount in green badge
  - Biller name
  - Account details (meter/card number)
  - Package name (for Cable TV)
  - Amount
  - Continue button

**Biller Modal:**
- Slide-up modal on mobile
- Centered modal on desktop
- Backdrop with click-to-close
- Close button (X icon)
- Smooth transitions
- List of billers with logos and names

**Validation:**
- Category must be selected first
- Biller must be chosen from modal
- Meter/card number must be at least 10 digits
- Cannot proceed if package price exceeds balance (Cable TV)
- All required fields based on category

## Dashboard Integration

### Quick Actions Updated
**File:** `/app/dashboard/page.tsx`

**Changes:**
- "Buy Airtime" button now routes to `/dashboard/utilities/airtime`
- "Pay Bills" button now routes to `/dashboard/utilities/bills`

**Quick Actions:**
1. Send → `/dashboard/send`
2. Receive → `/dashboard/receive`
3. Convert → `/dashboard/convert`
4. Buy Airtime → `/dashboard/utilities/airtime` ✅
5. Pay Bills → `/dashboard/utilities/bills` ✅

### Mobile Sidebar Updated
**File:** `/app/dashboard/page.tsx`

**Changes:**
- Added "Utilities" menu item between "Wallets" and "Settings"
- Routes to `/dashboard/utilities`
- Uses Receipt icon

### Desktop Sidebar Updated
**File:** `/components/dashboard/sidebar.tsx`

**Changes:**
- Added "Utilities" navigation link
- Routes to `/dashboard/utilities`
- Active state highlighting when on utilities pages
- Positioned between "Dashboard" and "History"

## Design Patterns

### Color Coding
- **Airtime:** Blue/Cyan theme (`bg-cyan-100`, `text-cyan-700`, `border-cyan-500`)
- **Data:** Purple theme (`bg-purple-100`, `text-purple-700`, `border-purple-500`)
- **Bills:** Green theme (`bg-green-100`, `text-green-700`, `border-green-500`)

### Layout Structure
Each utility page follows this structure:
1. **Header:** Sticky top with back button and title
2. **Form Section:** Country, service-specific fields, action inputs
3. **Preview Screen:** Inline toggle showing transaction summary
4. **Continue Button:** Validates form, shows preview
5. **Confirm Button:** (In preview) Submits transaction

### Network Selection
All pages use a consistent 4-column grid for network buttons:
- MTN (yellow theme)
- Glo (green theme)
- Airtel (red theme)
- 9mobile (emerald theme)

### Input Validation
- Numeric inputs use `inputMode="numeric"`
- Real-time sanitization removes non-numeric characters
- Visual feedback on validation errors
- Disabled state when form incomplete
- Balance checks before submission

### Preview Screens
- Inline toggle (no separate route)
- Large amount display in colored badge
- Clean transaction details in bordered card
- Horizontal dividers between details
- Green "Continue" button for final confirmation

## Navigation Flow

### Buy Airtime Flow
```
Dashboard → Quick Action "Buy Airtime"
  ↓
/dashboard/utilities/airtime
  ↓ (Select country, network, phone, amount)
  ↓ (Click Continue)
Preview Screen (inline)
  ↓ (Click Continue)
Alert + Redirect to Dashboard
```

### Buy Data Flow
```
Dashboard → Quick Action (Utilities Landing)
  ↓
/dashboard/utilities
  ↓ (Click Buy Data card)
/dashboard/utilities/data
  ↓ (Select country, network, phone, plan)
  ↓ (Click Continue)
Preview Screen (inline)
  ↓ (Click Continue)
Alert + Redirect to Dashboard
```

### Pay Bills Flow
```
Dashboard → Quick Action "Pay Bills"
  ↓
/dashboard/utilities/bills
  ↓ (Select country, category)
  ↓ (Click Select Biller)
Biller Modal
  ↓ (Select biller)
Form with biller-specific fields
  ↓ (Enter details)
  ↓ (Click Continue)
Preview Screen (inline)
  ↓ (Click Continue)
Alert + Redirect to Dashboard
```

## State Management

Each utility page uses local React state:
- `country`: Selected country
- `network`: Selected network provider
- `phoneNumber`: Contact phone number
- `amount/selectedPlan/selectedPackage`: Payment details
- `showPreview`: Toggle between form and preview
- `selectedBiller`: (Bills only) Chosen biller
- `category`: (Bills only) Electricity or Cable TV

No global state needed as these are transactional flows.

## Form Validation Logic

### Airtime
```typescript
const isAmountValid = amount && !isNaN(Number(amount)) 
  && Number(amount) >= minAmount 
  && Number(amount) <= maxAmount 
  && Number(amount) <= balance;

const isFormValid = country && network 
  && phoneNumber.length >= 10 
  && isAmountValid;
```

### Data
```typescript
const currentPlans = network ? dataPlans[network] : [];
const currentPlan = currentPlans.find(plan => plan.id === selectedPlan);

const isFormValid = country && network 
  && phoneNumber.length >= 10 
  && selectedPlan 
  && currentPlan 
  && currentPlan.price <= balance;
```

### Bills
```typescript
// Electricity
const isElectricityFormValid = category === "electricity" 
  && selectedBiller 
  && meterNumber.length >= 10 
  && electricityAmount 
  && Number(electricityAmount) > 0 
  && Number(electricityAmount) <= balance;

// Cable TV
const isCableTvFormValid = category === "cabletv" 
  && selectedBiller 
  && smartCardNumber.length >= 10 
  && selectedPackage 
  && selectedPkg 
  && selectedPkg.price <= balance;
```

## TODO: API Integration

Currently, all pages use placeholder alerts for transaction confirmation:
```typescript
alert(`Buying ₦${amount} ${network} airtime for ${phoneNumber}`);
router.push("/dashboard");
```

**Next Steps:**
1. Create API endpoints for each utility service
2. Replace alerts with actual API calls
3. Add loading states during API requests
4. Handle success/error responses
5. Show transaction receipts
6. Update transaction history

## Styling Details

### Consistent Elements
- Border radius: `rounded-xl` (12px) for inputs and cards
- Border radius: `rounded-2xl` (16px) for buttons
- Border radius: `rounded-3xl` (24px) for sections
- Padding: `px-4 py-3` for inputs
- Padding: `p-4` or `p-5` for cards
- Shadow: `shadow-md` for elevated cards

### Button States
```css
Enabled: bg-{color}-600 hover:bg-{color}-700 text-white
Disabled: bg-gray-300 text-gray-500 cursor-not-allowed
```

### Network Buttons
```css
Selected: border-{color}-500 bg-{color}-50 text-{color}-700
Default: border-gray-200 bg-white text-gray-700 hover:border-gray-300
```

## Testing Checklist

- [x] Landing page renders with 3 cards
- [x] Airtime page validates all fields
- [x] Airtime preview displays correctly
- [x] Data page loads plans based on network
- [x] Data plans reset when network changes
- [x] Data preview shows plan details
- [x] Bills page shows category selector
- [x] Biller modal opens and closes
- [x] Electricity form validates meter + amount
- [x] Cable TV form validates card + package
- [x] Bills preview adapts to category
- [x] Dashboard quick actions navigate correctly
- [x] Mobile sidebar includes Utilities
- [x] Desktop sidebar includes Utilities
- [x] All pages compile without errors
- [ ] API integration (pending)
- [ ] Transaction history updates (pending)

## Error Handling

Current implementation:
- Form validation prevents invalid submissions
- Visual feedback on validation errors
- Disabled buttons when form incomplete
- Balance checks prevent overspending

**Future enhancements:**
- API error handling with user-friendly messages
- Network error retry logic
- Transaction timeout handling
- Duplicate transaction prevention

## Performance Considerations

- No unnecessary re-renders (using proper React patterns)
- Local state management (no global state overhead)
- Inline previews (no route changes for preview)
- Minimal dependencies (only Lucide React icons)
- Static data plans (no API calls for dropdowns)

## Accessibility

- Semantic HTML structure
- Button elements for interactive components
- Label elements for form inputs
- ARIA attributes on modals
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader compatible

## Mobile Responsiveness

All pages are fully responsive:
- Mobile-first design
- Touch-friendly button sizes (minimum 44px)
- Optimized for 320px - 768px+ screens
- Sticky headers remain accessible
- Modal slides up from bottom on mobile
- Grid layouts adjust for small screens

## Browser Compatibility

Tested and working on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (iOS and macOS)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- Next.js 15.3.4 (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (icons)

No additional packages required for utilities system.
