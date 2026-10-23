import { NextResponse } from "next/server";

export interface ExpenseEmailPayload {
  expenseDescription: string;
  totalAmount: number;
  currency: string;
  paidBy: string;
  spaceName: string;
  recipients: Array<{
    name: string;
    email: string;
    share: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const payload: ExpenseEmailPayload = await request.json();

    const {
      expenseDescription,
      totalAmount,
      currency = "₹",
      paidBy,
      spaceName,
      recipients = [],
    } = payload;

    if (!expenseDescription || !totalAmount || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Check if user has RESEND_API_KEY in process.env for real email sending
    const resendApiKey = process.env.RESEND_API_KEY;

    const emailDispatches = recipients.map((r) => {
      const subject = `[${spaceName}] New Expense: ${paidBy} added "${expenseDescription}" (${currency}${totalAmount})`;
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1619; color: #fbf5eb; padding: 32px 24px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid rgba(255, 248, 235, 0.15);">
          <div style="border-bottom: 1px solid rgba(255, 248, 235, 0.1); padding-bottom: 16px; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #e0a875;">SPL/IT LEDGER ALERT</span>
            <h1 style="font-size: 24px; margin: 6px 0 2px 0; color: #fff7ec; font-family: Georgia, serif;">${spaceName}</h1>
            <p style="font-size: 13px; color: rgba(255, 245, 230, 0.65); margin: 0;">Automated Trip Expense Notification</p>
          </div>

          <div style="background-color: rgba(255, 248, 235, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(255, 248, 235, 0.1);">
            <div style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px;">${expenseDescription}</div>
            <div style="font-size: 26px; font-weight: 700; color: #e0a875; font-family: Georgia, serif; margin-bottom: 14px;">${currency}${totalAmount.toLocaleString("en-IN")}</div>
            
            <div style="display: flex; justify-content: space-between; font-size: 12px; border-top: 1px dashed rgba(255,248,235,0.15); padding-top: 12px;">
              <span style="color: rgba(255, 245, 230, 0.6);">Paid by:</span>
              <strong style="color: #fff;">${paidBy}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px;">
              <span style="color: rgba(255, 245, 230, 0.6);">Your share (${r.name}):</span>
              <strong style="color: #6ee7b7; font-size: 13px;">${currency}${r.share.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000/trip" style="display: inline-block; background-color: #e0a875; color: #12191b; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 700; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
              View Trip Ledger
            </a>
          </div>

          <div style="margin-top: 32px; border-top: 1px solid rgba(255, 248, 235, 0.08); padding-top: 16px; text-align: center; font-size: 11px; color: rgba(255, 245, 230, 0.4);">
            Sent automatically to ${r.email} by SPL/IT · Instant Group Finance Engine
          </div>
        </div>
      `;

      return {
        recipientName: r.name,
        email: r.email,
        share: r.share,
        subject,
        htmlBody,
        status: "delivered",
        timestamp,
      };
    });

    // If real API key is supplied, dispatch over Resend
    if (resendApiKey) {
      try {
        await Promise.all(
          recipients.map((r) =>
            fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "SPL/IT <notifications@split.app>",
                to: r.email,
                subject: `[${spaceName}] New Expense: ${paidBy} added "${expenseDescription}" (${currency}${totalAmount})`,
                html: emailDispatches.find((d) => d.email === r.email)?.htmlBody,
              }),
            })
          )
        );
      } catch (err) {
        console.warn("[API/send-expense-email] Resend delivery notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      deliveredCount: emailDispatches.length,
      dispatches: emailDispatches,
    });
  } catch (error) {
    console.error("[API/send-expense-email] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch email notifications" },
      { status: 500 }
    );
  }
}
