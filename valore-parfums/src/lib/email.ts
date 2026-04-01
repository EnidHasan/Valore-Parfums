// ─── Email Notification System ────────────────────────────
// Supports multiple email providers (SendGrid, Resend, NodeMailer, etc)

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(email: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// ─── Gmail/SMTP Implementation ────────────────────────────
class SMTPEmailProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(email: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email.to }],
              subject: email.subject,
            },
          ],
          from: { email: this.fromEmail },
          content: [
            {
              type: "text/html",
              value: email.html,
            },
            ...(email.text ? [{ type: "text/plain", value: email.text }] : []),
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return { success: true, messageId: response.headers.get("X-Message-Id") || undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
}

// ─── Email Template Generators ────────────────────────────

export function generateOrderConfirmationEmail(orderData: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ perfumeName: string; quantity: number; ml: number; unitPrice: number }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}): EmailNotification {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.perfumeName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}x ${item.ml}ml</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">৳${item.unitPrice}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">৳${item.unitPrice * item.quantity}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #1a1a1a; margin-bottom: 20px;">Order Confirmation</h1>
      
      <p>Dear ${orderData.customerName},</p>
      
      <p>Thank you for your order! Your order has been received and is being processed.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Order ID:</strong> ${orderData.orderId}<br/>
        <strong>Payment Method:</strong> ${orderData.paymentMethod}<br/>
        <strong>Order Date:</strong> ${new Date().toLocaleDateString()}
      </div>
      
      <h3 style="margin-top: 25px; margin-bottom: 15px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right;">
        <p><strong>Subtotal:</strong> ৳${orderData.subtotal}</p>
        ${orderData.discount > 0 ? `<p style="color: green;"><strong>Discount:</strong> -৳${orderData.discount}</p>` : ""}
        ${orderData.deliveryFee > 0 ? `<p><strong>Delivery Fee:</strong> ৳${orderData.deliveryFee}</p>` : ""}
        <p style="font-size: 18px; color: #1a1a1a;"><strong>Total: ৳${orderData.total}</strong></p>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 3px;">
        <p><strong>What's Next?</strong></p>
        <p>We will process your payment and send you a shipment confirmation with tracking information within 24 hours.</p>
      </div>
      
      <p style="margin-top: 25px; font-size: 12px; color: #666;">
        If you have any questions, please contact us at support@valoreparfums.com
      </p>
    </div>
  `;

  return {
    to: orderData.customerEmail,
    subject: `Order Confirmation - ${orderData.orderId.slice(0, 8)}`,
    html,
    text: `Order Confirmation\n\nOrder ID: ${orderData.orderId}\nTotal: ৳${orderData.total}`,
  };
}

export function generateOrderShippedEmail(orderData: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}): EmailNotification {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #1a1a1a; margin-bottom: 20px;">Your Order Has Been Shipped! 🎉</h1>
      
      <p>Dear ${orderData.customerName},</p>
      
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Order ID:</strong> ${orderData.orderId}<br/>
        ${orderData.trackingNumber ? `<strong>Tracking Number:</strong> ${orderData.trackingNumber}<br/>` : ""}
        ${orderData.estimatedDelivery ? `<strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}` : ""}
      </div>
      
      <p>You can track your order status anytime by visiting our tracking page with your order ID.</p>
      
      <p style="margin-top: 25px; font-size: 12px; color: #666;">
        If you have any questions, please contact us at support@valoreparfums.com
      </p>
    </div>
  `;

  return {
    to: orderData.customerEmail,
    subject: `Your Order ${orderData.orderId.slice(0, 8)} Has Been Shipped!`,
    html,
  };
}

export function generatePaymentVerifiedEmail(orderData: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  paymentMethod: string;
  amount: string;
}): EmailNotification {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #1a1a1a; margin-bottom: 20px;">Payment Verified ✓</h1>
      
      <p>Dear ${orderData.customerName},</p>
      
      <p>Your payment has been successfully verified. Your order is now confirmed and will be processed shortly.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Order ID:</strong> ${orderData.orderId}<br/>
        <strong>Payment Method:</strong> ${orderData.paymentMethod}<br/>
        <strong>Amount Paid:</strong> ৳${orderData.amount}<br/>
        <strong>Status:</strong> <span style="color: green;">Confirmed</span>
      </div>
      
      <p>You will receive a shipping confirmation email once your order is dispatched.</p>
      
      <p style="margin-top: 25px; font-size: 12px; color: #666;">
        If you have any questions, please contact us at support@valoreparfums.com
      </p>
    </div>
  `;

  return {
    to: orderData.customerEmail,
    subject: `Payment Verified - Order ${orderData.orderId.slice(0, 8)}`,
    html,
  };
}

// ─── Email Service Initialization ────────────────────────
let emailProvider: EmailProvider | null = null;

export function initializeEmailProvider(provider: EmailProvider): void {
  emailProvider = provider;
}

export async function sendEmail(email: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!emailProvider) {
    console.warn("Email provider not initialized. Email not sent:", email.subject);
    return { success: false, error: "Email provider not initialized" };
  }

  return emailProvider.send(email);
}

// ─── Initialize with SendGrid if API key is available ────────────────────────────
if (process.env.SENDGRID_API_KEY) {
  const provider = new SMTPEmailProvider(
    process.env.SENDGRID_API_KEY,
    process.env.SENDGRID_FROM_EMAIL || "noreply@valoreparfums.com",
  );
  initializeEmailProvider(provider);
}
