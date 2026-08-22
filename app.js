// Get the empty table body from the HTML
const tableBody = document.getElementById("paymentsBody");

// Track totals for our recovery calculation
let totalAtRisk = 0;
let totalRecoveredEngine = 0;
let totalRecoveredBaseline = 0;
let correctDiagnoses = 0;

// Loop through each failed payment record
failedPayments.forEach(function(payment) {
  const diagnosed = diagnoseCause(payment);
  const intervention = interventions[diagnosed];

  totalAtRisk += payment.amount;
  totalRecoveredEngine += payment.amount * intervention.successRate;
  totalRecoveredBaseline += payment.amount * baselineSuccessRate;

  if (diagnosed === payment.true_cause) {
    correctDiagnoses++;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${payment.transaction_id}</td>
    <td>${payment.amount}</td>
    <td>${payment.error_reason}</td>
    <td>${payment.bank}</td>
    <td>${payment.payment_method}</td>
    <td>${diagnosed}</td>
    <td>${intervention.action}</td>
  `;
  tableBody.appendChild(row);
});

const diagnosisAccuracy = ((correctDiagnoses / failedPayments.length) * 100).toFixed(1);
const engineRecoveryRate = ((totalRecoveredEngine / totalAtRisk) * 100).toFixed(1);
const baselineRecoveryRate = (baselineSuccessRate * 100).toFixed(1);

document.getElementById("summary").innerHTML = `
  <h2>Results</h2>
  <p><b>Total amount at risk:</b> ₹${totalAtRisk.toLocaleString()}</p>
  <p><b>Baseline recovery (generic retry for all):</b> ₹${totalRecoveredBaseline.toFixed(0)} (${baselineRecoveryRate}%)</p>
  <p><b>RecoverMandate recovery (diagnosed + targeted intervention):</b> ₹${totalRecoveredEngine.toFixed(0)} (${engineRecoveryRate}%)</p>
  <p><b>Diagnosis accuracy:</b> ${diagnosisAccuracy}% (${correctDiagnoses} of ${failedPayments.length} correctly matched true cause)</p>
`;

// Pre-written sample explanations (avoids live API calls / quota limits during demo)
// These were originally generated live by Gemini during development and testing.
const sampleExplanations = {
  otp_required: "This bank declined the automatic payment because the amount exceeds the limit for seamless auto-debits and requires Additional Factor of Authentication. Prompting the customer to complete an OTP verification will allow the bank to safely approve the transaction.",
  mandate_expired: "The payment failed because the customer's recurring payment authorization (e-mandate) has expired, blocking automatic deductions. Sending a re-registration link allows the customer to set up a new mandate so future payments can process successfully.",
  card_expired: "The payment failed because the card linked to the customer's saved payment instrument has expired, preventing the auto-debit from going through. Prompting the customer to update their card details will restore the mandate so future recurring payments can process successfully.",
  bank_transient: "This failure was caused by a temporary technical glitch on the bank's servers, not an issue with the customer's card. Retrying after 2 hours gives the bank time to resolve the issue, giving the transaction the highest chance of succeeding.",
  insufficient_funds: "The payment failed because the customer's account did not have enough funds to cover the charge. A gentle reminder gives the customer time to top up their account or update their card details before the system automatically retries the charge.",
  unknown: "This transaction's failure pattern didn't match any known cause, so it has been flagged for manual review rather than an automated action."
};

// Show explanations for first 5 transactions as a demo
function showSampleExplanations() {
  const container = document.getElementById("explanations");
  let html = "<h2>AI Audit Trail (sample)</h2>";

  for (let i = 0; i < 5; i++) {
    const payment = failedPayments[i];
    const diagnosed = diagnoseCause(payment);
    const explanation = sampleExplanations[diagnosed];

    html += `
      <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
        <b>${payment.transaction_id}</b> (₹${payment.amount}) — ${diagnosed}<br>
        <i>${explanation}</i>