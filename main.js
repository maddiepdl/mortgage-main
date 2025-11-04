// calculate monthly repayment for amortizing loan
function calculateRepayment(principal, years, annualRate) {
  const monthlyRate = annualRate / 100 / 12;          // convert annual % to monthly decimal
  const numberOfPayments = years * 12;                // total months
  if (monthlyRate === 0) return principal / numberOfPayments; // handle 0% interest
  const x = Math.pow(1 + monthlyRate, numberOfPayments);      // (1 + r)^n
  return (principal * monthlyRate * x) / (x - 1);     // amortization formula
}

// interest-only monthly payment
function calculateInterestOnly(principal, annualRate) {
  const monthlyRate = annualRate / 100 / 12;         
  return principal * monthlyRate;                    
}

// show amounts in US Dollars
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// round to two decimal for cents
function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

/* --- grab DOM elements --- */
const form = document.getElementById("mortgageForm");
const amountInput = document.getElementById("amount");
const termInput = document.getElementById("term");
const rateInput = document.getElementById("rate");
const calculateBtn = document.getElementById("calculateBtn");

const resultsEmpty = document.getElementById("resultsEmpty");
const resultsFilled = document.getElementById("resultsFilled");
const monthlyPaymentEl = document.getElementById("monthlyPayment");
const totalPaymentEl = document.getElementById("totalPayment");

const amountError = document.getElementById("amountError");
const termError = document.getElementById("termError");
const rateError = document.getElementById("rateError");

/* validate inputs & return parsed numbers  */
function validateInputs() {
  amountError.textContent = "";    // clear errors
  termError.textContent = "";
  rateError.textContent = "";

  // raw values & numeric parsed values
  const rawAmount = amountInput.value.trim();
  const rawTerm = termInput.value.trim();
  const rawRate = rateInput.value.trim();

  const amountNum = amountInput.valueAsNumber;
  const yearsNum = termInput.valueAsNumber;
  const rateNum = rateInput.valueAsNumber;

  let valid = true;

  // required checks
  if (rawAmount === "") {
    amountError.textContent = "Enter the mortgage amount.";
    valid = false;
  }
  if (rawTerm === "") {
    termError.textContent = "Enter the mortgage term in years.";
    valid = false;
  }
  if (rawRate === "") {
    rateError.textContent = "Enter the interest rate (0 is allowed).";
    valid = false;
  }

  if (rawAmount !== "" && (isNaN(amountNum) || amountNum <= 0)) {
    amountError.textContent = "Enter a valid positive amount.";
    valid = false;
  }
  if (rawTerm !== "" && (isNaN(yearsNum) || yearsNum <= 0)) {
    termError.textContent = "Enter a valid number of years greater than 0.";
    valid = false;
  }
  if (rawRate !== "" && (isNaN(rateNum) || rateNum < 0)) {
    rateError.textContent = "Enter a valid interest rate (0 or positive).";
    valid = false;
  }

  // parsed numbers for the calculations
  return {
    valid,
    parsed: {
      amount: isNaN(amountNum) ? 0 : amountNum,
      years: isNaN(yearsNum) ? 0 : yearsNum,
      rate: isNaN(rateNum) ? 0 : rateNum
    }
  };
}

/* form submission with validate & calculate */
form.addEventListener("submit", function (e) {
  e.preventDefault();           
  calculateBtn.disabled = true;  // prevent double clicks

  const validation = validateInputs();
  if (!validation.valid) {
    if (amountError.textContent) amountInput.focus();
    else if (termError.textContent) termInput.focus();
    else if (rateError.textContent) rateInput.focus();
    calculateBtn.disabled = false;
    return;
  }

  // parsed values
  const principal = validation.parsed.amount;
  const years = validation.parsed.years;
  const rate = validation.parsed.rate;

  // selected mortgage type
  const checked = document.querySelector("input[name='type']:checked");
  const type = checked ? checked.value : "repayment";

  // monthly & total payments based on type
  let monthlyPayment, totalPayment;
  if (type === "repayment") {
    monthlyPayment = calculateRepayment(principal, years, rate);
    totalPayment = monthlyPayment * years * 12;
  } else {
    monthlyPayment = calculateInterestOnly(principal, rate);
    totalPayment = (monthlyPayment * years * 12) + principal;
  }

  // results area & hide the empty illustration
  resultsEmpty.classList.add("hidden");
  resultsFilled.classList.remove("hidden");
  resultsFilled.setAttribute("aria-hidden", "false");
  resultsEmpty.setAttribute("aria-hidden", "true");

  // displays the values
  monthlyPaymentEl.textContent = currencyFormatter.format(roundToCents(monthlyPayment));
  totalPaymentEl.textContent = currencyFormatter.format(roundToCents(totalPayment));

  calculateBtn.disabled = false; // re-enable button
});

/* form reset, clear errors & hide results */
form.addEventListener("reset", function () {
  amountError.textContent = "";
  termError.textContent = "";
  rateError.textContent = "";

  resultsEmpty.classList.remove("hidden");
  resultsFilled.classList.add("hidden");
  resultsFilled.setAttribute("aria-hidden", "true");
  resultsEmpty.setAttribute("aria-hidden", "false");

  monthlyPaymentEl.textContent = "";
  totalPaymentEl.textContent = "";

  setTimeout(function () { amountInput.focus(); }, 0);
});

/* clear inline errors */
[amountInput, termInput, rateInput].forEach(function (input) {
  input.addEventListener("input", function () {
    const targetError = document.getElementById(input.id + "Error");
    if (targetError) targetError.textContent = "";
  });
});

/* shows empty results at start */
resultsEmpty.classList.remove("hidden");
resultsFilled.classList.add("hidden");
resultsFilled.setAttribute("aria-hidden", "true");
resultsEmpty.setAttribute("aria-hidden", "false");