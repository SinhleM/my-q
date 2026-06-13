import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentRequestEmail({
    toEmail,
    toName,
    fromName,
    amount,
    description,
    paymentId,
}: {
    toEmail: string;
    toName?: string;
    fromName: string;
    amount: number;
    description: string;
    paymentId: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const paymentUrl = `${siteUrl}/payments/${paymentId}`;

    return resend.emails.send({
        from: "MY-Q Payments <payments@my-q.co.za>",
        to: toEmail,
        subject: `${fromName} sent you a payment request for R${amount}`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f5f5f5; padding: 40px 0;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">

    <div style="background: #022c22; padding: 28px 32px;">
      <p style="color: #6ee7b7; margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.05em;">MY-Q</p>
      <h1 style="color: white; margin: 8px 0 0; font-size: 22px;">Payment Request</h1>
    </div>

    <div style="padding: 32px;">
      <p style="color: #374151; margin: 0 0 8px;">
        ${toName ? `Hi ${toName},` : "Hi there,"}
      </p>
      <p style="color: #374151; margin: 0 0 24px;">
        <strong>${fromName}</strong> has sent you a payment request.
      </p>

      <div style="background: #f9fafb; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
        <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Amount</p>
        <p style="margin: 0 0 16px; font-size: 28px; font-weight: 900; color: #022c22;">R ${amount}</p>
        <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">Description</p>
        <p style="margin: 0; color: #111827; font-size: 15px;">${description}</p>
      </div>

      <a href="${paymentUrl}"
         style="display: block; background: #022c22; color: white; text-align: center; padding: 14px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">
        Pay Now →
      </a>

      <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
        Or copy this link: ${paymentUrl}
      </p>
    </div>

  </div>
</body>
</html>`,
    });
}
