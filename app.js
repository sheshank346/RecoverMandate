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
  row.innerHTML = "<td>" + payment.transaction_id + "</td>" +
    "<td>" + payment.amount + "</td>" +
    "<td>" + payment.error_reason + "</td>" +
    "<td>" + payment.bank + "</td>" +
    "<td>" + payment.payment_method + "</td>" +
    "<td>" + diagnosed + "</td>" +
    "<td>" + intervention.action + "</td>";
  tableBody.appendChild(row);
});

const diagnosisAccuracy = ((correctDiagnoses / failedPayments.length) * 100).toFixed(1);
const engineRecoveryRate = ((totalRecoveredEngine / totalAtRisk) * 100).toFixed(1);
const baselineRecoveryRate = (baselineSuccessRate * 100).toFixed(1);

document.getElementById("summary").innerHTML =
  "<h2>Results</h2>" +
  "<div class='cards'>" +
    "<div class='card'><div class='icon'>\u{1F4B0}</div><div class='label'>Total At Risk</div><div class='value'>\u20B9" + totalAtRisk.toLocaleString() + "</div></div>" +
    "<div class='card'><div class='icon'>\u{1F501}</div><div class='label'>Baseline Recovery</div><div class='value'>" + baselineRecoveryRate + "%</div></div>" +
    "<div class='card highlight'><div class='icon'>\u{1F680}</div><div class='label'>RecoverMandate Recovery</div><div class='value'>" + engineRecoveryRate + "%</div></div>" +
    "<div class='card'><div class='icon'>\u{1F3AF}</div><div class='label'>Diagnosis Accuracy</div><div class='value'>" + diagnosisAccuracy + "%</div></div>" +
  "</div>";

var sampleExplanations = {
  otp_required: "This bank declined the automatic payment because the amount exceeds the limit for seamless auto-debits and requires Additional Factor of Authentication. Prompting the customer to complete an OTP verification will allow the bank to safely approve the transaction.",
  mandate_expired: "The payment failed because the customer's recurring payment authorization (e-mandate) has expired, blocking automatic deductions. Sending a re-registration link allows the customer to set up a new mandate so future payments can process successfully.",
  card_expired: "The payment failed because the card linked to the customer's saved payment instrument has expired, preventing the auto-debit from going through. Prompting the customer to update their card details will restore the mandate so future recurring payments can process successfully.",
  bank_transient: "This failure was caused by a temporary technical glitch on the bank's servers, not an issue with the customer's card. Retrying after 2 hours gives the bank time to resolve the issue, giving the transaction the highest chance of succeeding.",
  insufficient_funds: "The payment failed because the customer's account did not have enough funds to cover the charge. A gentle reminder gives the customer time to top up their account or update their card details before the system automatically retries the charge.",
  unknown: "This transaction's failure pattern didn't match any known cause, so it has been flagged for manual review rather than an automated action."
};

function showSampleExplanations() {
  var container = document.getElementById("explanations");
  var html = "<h2>AI Audit Trail (sample)</h2>";

  for (var i = 0; i < 5; i++) {
    var payment = failedPayments[i];
    var diagnosed = diagnoseCause(payment);
    var explanation = sampleExplanations[diagnosed];

    html += "<div class='explanation-box'>" +
      "<b>" + payment.transaction_id + "</b> (\u20B9" + payment.amount + ") \u2014 " + diagnosed + "<br>" +
      "<i>" + explanation + "</i>" +
      "</div>";
  }

  container.innerHTML = html;
}

showSampleExplanations();
var causeCounts = {};
failedPayments.forEach(function(payment) {
  var cause = diagnoseCause(payment);
  causeCounts[cause] = (causeCounts[cause] || 0) + 1;
});

var maxCount = Math.max.apply(null, Object.values(causeCounts));
var chartHtml = "";
var labelMap = {
  mandate_expired: "Mandate Expired",
  card_expired: "Card Expired",
  otp_required: "OTP Required",
  bank_transient: "Bank Transient",
  insufficient_funds: "Insufficient Funds",
  unknown: "Unknown"
};

Object.keys(causeCounts).forEach(function(cause) {
  var count = causeCounts[cause];
  var widthPct = (count / maxCount) * 100;
  chartHtml += "<div class='bar-row'>" +
    "<div class='bar-label'>" + (labelMap[cause] || cause) + "</div>" +
    "<div class='bar-track'><div class='bar-fill' style='width:" + widthPct + "%'>" + count + "</div></div>" +
    "</div>";
});

document.getElementById("chartBars").innerHTML = chartHtml;