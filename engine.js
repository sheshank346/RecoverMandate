// STEP 1: Diagnosis logic - guesses the cause from error fields
function diagnoseCause(payment) {
  if (payment.error_code === "BAD_REQUEST_ERROR" && payment.error_source === "bank") {
    return "mandate_expired";
  }
  if (payment.error_code === "GATEWAY_ERROR") {
    return "card_expired";
  }
  if (payment.error_code === "AUTHENTICATION_ERROR") {
    return "otp_required";
  }
  if (payment.error_code === "SERVER_ERROR") {
    return "bank_transient";
  }
  if (payment.error_code === "BAD_REQUEST_ERROR" && payment.error_reason === "incorrect_pin") {
    return "incorrect_upi_pin";
  }
  if (payment.error_code === "BAD_REQUEST_ERROR" && payment.error_source === "customer") {
    return "insufficient_funds";
  }
  return "unknown";
}

// STEP 2: Intervention mapping - what action + success chance for each cause
const interventions = {
  mandate_expired:     { action: "Send e-mandate re-registration link", channel: "SMS", successRate: 0.55 },
  card_expired:         { action: "Prompt to update card on saved instrument", channel: "Email", successRate: 0.45 },
  otp_required:         { action: "Route through AFA/OTP retry flow", channel: "App notification", successRate: 0.70 },
  bank_transient:       { action: "Smart retry after 2 hours", channel: "Automatic", successRate: 0.50 },
  incorrect_upi_pin:    { action: "Prompt immediate re-entry - one-time input error, high retry success", channel: "App notification", successRate: 0.80 },
  insufficient_funds:   { action: "Delayed retry (48-72 hrs) timed around income cycles, not immediate reminder", channel: "SMS", successRate: 0.35 },
  unknown:              { action: "Manual review", channel: "N/A", successRate: 0.10 }
};

// STEP 3: Baseline comparison - what "generic retry for everyone" would achieve
const baselineSuccessRate = 0.15;