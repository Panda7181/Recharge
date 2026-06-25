const rechargeButton = document.querySelector("#rechargeButton");
const rechargeHint = document.querySelector("#rechargeHint");
const rechargeNumberInput = document.querySelector("#mobileNumber");
const serviceButtons = document.querySelectorAll(".service-tabs button");
const planButtons = document.querySelectorAll(".plan-toggle button");
const rechargeNumber = document.querySelector("#rechargeNumber");
const offerTimer = document.querySelector("#offerTimer");
const planRechargeButtons = document.querySelectorAll(".plan-recharge-button");
const payAmount = document.querySelector("#payAmount");
const paymentNote = document.querySelector("#paymentNote");
const upiOptions = document.querySelectorAll(".upi-option");

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    if (rechargeHint) {
      rechargeHint.textContent = `${button.dataset.operator} prepaid mobile recharge selected.`;
      rechargeHint.classList.add("demo-message");
    }
  });
});

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

if (rechargeNumberInput) {
  rechargeNumberInput.addEventListener("input", () => {
    rechargeNumberInput.value = rechargeNumberInput.value.replace(/\D/g, "").slice(0, 10);
  });
}

if (rechargeButton) {
  rechargeButton.addEventListener("click", () => {
    const number = rechargeNumberInput?.value.trim() || "";
    const activeOperator = document.querySelector(".service-tabs button.active")?.dataset.operator || "Jio";

    if (number.length !== 10) {
      rechargeHint.textContent = "Please valid 10 digit mobile number daalein.";
      rechargeHint.classList.add("demo-message");
      rechargeNumberInput?.focus();
      return;
    }

    window.location.href = `plans.html?number=${encodeURIComponent(number)}&operator=${encodeURIComponent(activeOperator)}`;
  });
}

if (rechargeNumber) {
  const params = new URLSearchParams(window.location.search);
  const number = params.get("number")?.replace(/\D/g, "").slice(0, 10);
  const operator = params.get("operator") || "Jio";

  rechargeNumber.textContent = number || "8102771005";
  document.title = `${operator} Special Offer Plans`;
}

if (offerTimer) {
  let seconds = 14 * 60 + 55;

  const renderOfferTimer = () => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    offerTimer.textContent = `${minutes}:${secs}`;
    seconds = seconds > 0 ? seconds - 1 : 0;
  };

  renderOfferTimer();
  setInterval(renderOfferTimer, 1000);
}

planRechargeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const number = params.get("number") || "";
    const operator = params.get("operator") || "Jio";
    const amount = button.dataset.amount || "239";

    window.location.href = `payment.html?amount=${encodeURIComponent(amount)}&number=${encodeURIComponent(number)}&operator=${encodeURIComponent(operator)}`;
  });
});

if (payAmount) {
  const params = new URLSearchParams(window.location.search);
  const amount = params.get("amount")?.replace(/\D/g, "") || "239";
  payAmount.textContent = amount;
  document.title = `Pay ₹${amount} using UPI`;
}

upiOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const appName = option.dataset.app === "phonepe" ? "PhonePe" : "Paytm";
    const appUrl = option.dataset.url;

    if (paymentNote) {
      paymentNote.textContent = `${appName} open karne ki koshish ho rahi hai. Real payment request connected nahi hai.`;
    }

    window.location.href = appUrl;
  });
});
