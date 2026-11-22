// WhatsApp order updates via Meta's WhatsApp Cloud API.
//
// Setup: see WHATSAPP_SETUP.md in the project root.
//   WHATSAPP_TOKEN            permanent access token for your WhatsApp Business app
//   WHATSAPP_PHONE_NUMBER_ID  the sender phone number ID from Meta's WhatsApp Manager
//   WHATSAPP_TEMPLATE_NAME    approved Utility template name (default "order_status_update")
//   WHATSAPP_TEMPLATE_LANG    template language code (default "en")
//
// The template must have exactly three body variables, for example:
//   "Hi {{1}}, here's an update on your Cup Culture order {{2}}: {{3}}"
//
// If the variables are not set, nothing is sent and orders keep working normally.

export type OrderUpdate = {
  phone: string;
  name: string;
  orderNumber: string;
  status: string;
  orderType: string;
  table?: string | null;
};

const GRAPH_VERSION = "v21.0";

export function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Turns an Indian mobile number into WhatsApp's international format (e.g. 919876543210). */
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

/** The friendly line sent for each order status. */
export function statusMessage(status: string, orderType: string, table?: string | null) {
  switch (status) {
    case "Order Placed": return "we've received it and the café will confirm it shortly. ☕";
    case "Order Confirmed": return "it's confirmed! We'll let you know as soon as we start preparing it.";
    case "Preparing": return "it's being freshly prepared right now. 👩‍🍳";
    case "Ready for Pickup":
      if (orderType === "Dine In") return `it's ready and on its way to your table${table ? ` (${table})` : ""}. Enjoy! 😊`;
      if (orderType === "Home Delivery") return "it's packed and ready to leave the café. 📦";
      return "it's ready! Please collect it at the counter. 🛍️";
    case "Out for Delivery": return "it's out for delivery and on its way to you. 🛵";
    case "Delivered": return orderType === "Home Delivery" ? "it's been delivered. Enjoy your meal, and thank you for choosing Cup Culture! ❤️" : "it's been served. Enjoy, and thank you for choosing Cup Culture! ❤️";
    case "Cancelled": return "it has been cancelled. If this is unexpected, please call or message the café.";
    default: return `its status is now: ${status}.`;
  }
}

/**
 * Sends one WhatsApp template message. Never throws: failures are logged and
 * reported in the return value so an order or status change is never blocked.
 */
export async function sendOrderUpdate(update: OrderUpdate, fetcher: typeof fetch = fetch): Promise<{ sent: boolean; reason?: string }> {
  if (!isWhatsAppConfigured()) return { sent: false, reason: "not_configured" };
  const to = toWhatsAppNumber(update.phone);
  if (!to) return { sent: false, reason: "invalid_phone" };

  const firstName = update.name.trim().split(/\s+/)[0] || "there";
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME || "order_status_update",
      language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: firstName.slice(0, 60) },
          { type: "text", text: update.orderNumber },
          { type: "text", text: statusMessage(update.status, update.orderType, update.table) },
        ],
      }],
    },
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetcher(`https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("whatsapp_send_failed", response.status, detail.slice(0, 500));
      return { sent: false, reason: `http_${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("whatsapp_send_error", error);
    return { sent: false, reason: "network_error" };
  }
}
