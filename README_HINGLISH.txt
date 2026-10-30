LOCAL STOCK MANAGER — SETUP GUIDE (HINGLISH)

Features:
- Raw material aur finished product stock
- Product list, units, opening stock
- Stock In / Stock Out with movement history
- Low-stock warning
- JSON backup download aur restore
- Local IndexedDB database; barcode scanning nahi

IMPORTANT LIMITATION:
PWA ko Android par install karne aur service worker offline caching enable karne ke liye pehli baar HTTPS website par open karna hota hai (ya localhost). Is ZIP ko seedha file:// se open karne par browser support alag ho sakta hai, aur PWA installation/offline caching kaam na kare. Initial setup ke liye ek baar internet/hosting ya local development server chahiye. Install/cache ho jaane ke baad app offline use ke liye bana hai.

SABSE AASAN INITIAL SETUP:
1. ZIP extract karo.
2. Files ko kisi static HTTPS host par upload karo, jaise GitHub Pages. Iske liye first-time internet aur account setup lagega.
3. Android Chrome mein published HTTPS link kholo.
4. Menu (⋮) > "Install app" ya "Add to Home screen" select karo.
5. App ko ek baar online open karke load hone do.
6. Airplane mode on karke test karo: app open karo, sample product add karo, Stock In/Out try karo.
7. Settings > Backup se JSON backup download karke safe jagah par rakho.

DAILY USE:
- Add product: naam, type, unit, opening stock, minimum alert limit.
- Stock In: naya stock receive hua.
- Stock Out: maal use/sell/dispatch hua.
- Low stock: quantity minimum limit par ya neeche aate hi warning dikhegi.
- Backup: har din/har important stock update ke baad backup lo.

DATA SAFETY:
- Data device/browser ke IndexedDB mein hai; cloud sync nahi hai.
- App ka browser data clear na karein jab tak backup na ho.
- Restore current records ko replace karta hai.
- Notifications push nahi hain; low-stock warning app kholne par dashboard par dikhegi.
- Is starter version mein user login, multiple devices sync, price/profit accounting aur audit log editing nahi hai.
