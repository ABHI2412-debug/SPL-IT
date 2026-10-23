export interface UpiPaymentDetails {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  currency?: string;
  transactionNote?: string;
  referenceId?: string;
}

export const MEMBER_UPI_MAP: Record<string, string> = {
  You: "sourabh.patil@okhdfcbank",
  "Sourabh Patil": "sourabh.patil@okhdfcbank",
  "You (Sourabh Patil)": "sourabh.patil@okhdfcbank",
  Aman: "aman.sharma@okaxis",
  "Aman Sharma": "aman.sharma@okaxis",
  Rhea: "rhea.sen@icici",
  "Rhea Sen": "rhea.sen@icici",
  Vikram: "vikram.malhotra@ybl",
  "Vikram Malhotra": "vikram.malhotra@ybl",
  Kabir: "kabir.singh@oksbi",
};

export function getMemberVpa(name: string): string {
  if (MEMBER_UPI_MAP[name]) return MEMBER_UPI_MAP[name];
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean || "member"}@upi`;
}

export function buildUpiUri(details: UpiPaymentDetails): string {
  const {
    payeeVpa,
    payeeName,
    amount,
    currency = "INR",
    transactionNote = "SPLit Settlement",
    referenceId,
  } = details;

  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: currency,
    tn: transactionNote,
  });

  if (referenceId) {
    params.set("tr", referenceId);
  }

  return `upi://pay?${params.toString()}`;
}

export function getUpiAppLinks(details: UpiPaymentDetails) {
  const baseUri = buildUpiUri(details);
  const encodedBase = encodeURIComponent(baseUri);

  return {
    generic: baseUri,
    gpay: `tez://upi/pay?${baseUri.replace("upi://pay?", "")}`,
    phonepe: `phonepe://pay?${baseUri.replace("upi://pay?", "")}`,
    paytm: `paytmmp://pay?${baseUri.replace("upi://pay?", "")}`,
    bhim: baseUri,
    webFallbackQr: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(baseUri)}`,
  };
}

export function buildWhatsAppShareUrl(
  debtorName: string,
  creditorName: string,
  amount: number,
  vpa: string,
  spaceName: string
): string {
  const upiLink = buildUpiUri({
    payeeVpa: vpa,
    payeeName: creditorName,
    amount,
    transactionNote: `Settlement for ${spaceName}`,
  });

  const message = [
    `Hey ${debtorName} 👋`,
    `Here is the split settlement for *${spaceName}* on SPLit:`,
    ``,
    `💰 *Amount Due*: ₹${amount.toLocaleString("en-IN")}`,
    `💳 *Pay to UPI*: \`${vpa}\``,
    ``,
    `Tap here to pay instantly with GPay / PhonePe / Paytm:`,
    upiLink,
    ``,
    `_Sent via SPLit Travel & Expense Ledger_`,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
