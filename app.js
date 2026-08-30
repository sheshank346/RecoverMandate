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

const