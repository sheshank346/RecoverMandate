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