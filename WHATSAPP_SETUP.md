# WhatsApp order updates

Customers who tick **"Send me order updates on WhatsApp"** at checkout get a WhatsApp message:

| When | Message (after "Hi Priya, here's an update on your Cup Culture order CC-XXXX:") |
| --- | --- |
| Order placed | we've received it and the café will confirm it shortly. ☕ |
| Café sets **Order Confirmed** | it's confirmed! We'll let you know as soon as we start preparing it. |
| Café sets **Preparing** | it's being freshly prepared right now. 👩‍🍳 |
| Café sets **Ready for Pickup** | Takeaway: ready to collect at the counter · Dine in: on its way to your table · Delivery: packed and ready to leave |
| Café sets **Out for Delivery** | it's out for delivery and on its way to you. 🛵 |
| Café sets **Delivered** | delivered / served — thank you! ❤️ |
| Café sets **Cancelled** | cancelled — please call or message the café. |

Status changes are made in the admin dashboard (**/admin → Orders**). Each change sends the matching message.

## One-time setup

You need Supabase connected (orders are saved there) plus a WhatsApp Business sender.

1. **Create a Meta app with WhatsApp**
   Go to developers.facebook.com → *My Apps* → *Create app* → *Business* → add the **WhatsApp** product.
   Link your Meta Business account and add the café's WhatsApp business phone number.
   (That number can't be in use on the normal WhatsApp / WhatsApp Business phone app at the same time.)

2. **Create the message template**
   In *WhatsApp Manager → Message templates → Create template*:
   - Category: **Utility**
   - Name: `order_status_update`
   - Language: **English** (`en`)
   - Body: `Hi {{1}}, here's an update on your Cup Culture order {{2}}: {{3}}`
   - Sample values: `Priya`, `CC-M3X9-1A2B`, `it's being freshly prepared right now.`
   Submit it and wait for Meta to approve it (usually minutes to a day).

3. **Get your keys**
   - *Phone number ID*: WhatsApp → API Setup → "Phone number ID".
   - *Access token*: create a **System User** in Business Settings, give it the WhatsApp app, and generate a **permanent** token with `whatsapp_business_messaging` permission. (The temporary token on the API Setup page expires after 24 hours.)

4. **Add them to `.env.local`** (and your hosting provider's environment variables):
   ```
   WHATSAPP_TOKEN=your-permanent-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   WHATSAPP_TEMPLATE_NAME=order_status_update
   WHATSAPP_TEMPLATE_LANG=en
   ```

5. **Run the database update** `supabase/migrations/202611220002_whatsapp_updates.sql`
   (Supabase dashboard → SQL editor → paste → Run). It adds the `whatsapp_updates` column to `orders`.

6. Restart the site, place a test order with your own number ticked, then change its status in /admin.

## Notes

- If the keys are missing, nothing is sent and ordering works exactly as before.
- A failed WhatsApp message never blocks an order or a status change; the error is logged on the server (`whatsapp_send_failed`).
- Indian 10-digit numbers are sent as `91XXXXXXXXXX` automatically.
- Meta charges per message conversation for Utility templates; check current WhatsApp Business pricing for India.
- Customers must opt in (the checkout tick box) — WhatsApp's policy requires consent before business messages.
