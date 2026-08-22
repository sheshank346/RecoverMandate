// Possible values for each field
const causes = ["mandate_expired", "card_expired", "otp_required", "bank_transient", "insufficient_funds"];
const banks = ["HDFC", "ICICI", "SBI", "Axis", "Kotak"];
const methods = ["upi", "card"];

// Maps each cause to a realistic error_code and error_source
const causeDetails = {
  mandate_expired:   { error_code: "BAD_REQUEST_ERROR", error_source: "bank" },
  card_expired:      { error_code: "GATEWAY_ERROR", error_source: "gateway" },
  otp_required:      { error_code: "AUTHENTICATION_ERROR", error_source: "bank" },
  bank_transient:     { error_code: "SERVER_ERROR", error_source: "bank" },
  insufficient_funds: { error_code: "BAD_REQUEST_ERROR", error_source: "customer" }
};

// Weights control how common each cause is (mirrors realistic distribution)
const causeWeights = {
  mandate_expired: 30,
  card_expired: 20,
  otp_required: 15,
  bank_transient: 15,
  insufficient_funds: 20
};

// Picks a random cause based on weights above
function pickWeightedCause() {
  const total = Object.values(causeWeights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const cause in causeWeights) {
    rand -= causeWeights[cause];
    if (rand <= 0) return cause;
  }
}

// Generates one fake failed payment record
function generateRecord(index) {
  const cause = pickWeightedCause();
  const details = causeDetails[cause];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const bank = banks[Math.floor(Math.random() * banks.length)];
  const amount = Math.floor(Math.random() * 20000) + 500;

  return {
    transaction_id: "txn_" + String(index).padStart(4, "0"),
    subscription_id: "sub_" + String(100 + index),
    amount: amount,
    error_code: details.error_code,
    error_reason: cause,
    error_source: details.error_source,
    payment_method: method,
    bank: bank,
    timestamp: new Date(2026, 7, Math.floor(Math.random() * 28) + 1).toISOString(),
    true_cause: cause
  };
}

// Generate 200 records
const failedPayments = [];
for (let i = 1; i <= 200; i++) {
  failedPayments.push(generateRecord(i));
}
// Edge case: malformed record with unrecognized error code (tests graceful handling)
failedPayments.push({
  transaction_id: "txn_9999",
  subscription_id: "sub_999",
  amount: 9999,
  error_code: "UNKNOWN_WEIRD_ERROR",
  error_reason: "unclassified",
  error_source: "unknown",
  payment_method: "upi",
  bank: "N/A",
  timestamp: new Date().toISOString(),
  true_cause: "unknown"
});