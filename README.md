# SliqPay 💸

**SliqPay** is a modern trendy fintech MVP for seamless bill payments — starting with airtime, data, electricity, and cable TV.

---

## 🔧 Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **VTPass API** (for bill payments)
- **Planned Web3 support** (e.g. stablecoin payments)

---

## 🚀 Roadmap (MVP1)

- [ ] Branding (Logo, Colors)
- [ ] Airtime Purchase via VTPass
- [ ] TV, Electricity, and Data services
- [ ] Admin Dashboard

---

## 🛠️ Local Setup

```bash
git clone https://github.com/your-username/sliqpay.git
cd sliqpay

# Install dependencies
cd front-end
npm install

# Create .env file with the following content:
# VTPASS_API_KEY=your_api_key
# VTPASS_PUBLIC_KEY=your_public_key
# VTPASS_SECRET_KEY=your_secret_key
# VTPASS_BASE_URL=https://sandbox.vtpass.com/api  # Use https://vtpass.com/api for production
npm install
npm run dev
