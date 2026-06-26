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
const upiOptionAmounts = document.querySelectorAll(".optionAmount");
const paymentBackButton = document.querySelector(".payment-page .back-button");
const selectedAmountKey = "selectedRechargeAmount";
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const pageParams = new URLSearchParams(window.location.search);
const pageNumber = pageParams.get("number")?.replace(/\D/g, "").slice(0, 10) || "";

if (currentPage === "plans.html" && pageNumber.length !== 10) {
  window.location.replace("index.html");
}

if (paymentBackButton) {
  const operator = pageParams.get("operator") || "Jio";
  paymentBackButton.href = pageNumber
    ? `plans.html?number=${encodeURIComponent(pageNumber)}&operator=${encodeURIComponent(operator)}`
    : "index.html";
}

const getSafeAmount = (value, fallback = "239") => {
  const amount = String(value || "").replace(/\D/g, "");
  return amount || fallback;
};

const getSelectedPlanAmount = (button) => {
  const cardPrice = button.closest(".offer-plan-card")?.querySelector(".price-line strong")?.textContent;
  return getSafeAmount(cardPrice || button.dataset.amount);
};

const saveSelectedAmount = (amount) => {
  try {
    localStorage.setItem(selectedAmountKey, getSafeAmount(amount));
  } catch (error) {
    // Storage can be unavailable in strict/private browser modes.
  }
};

const getSavedAmount = () => {
  try {
    return localStorage.getItem(selectedAmountKey);
  } catch (error) {
    return "";
  }
};

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
    const amount = getSelectedPlanAmount(button);

    button.dataset.amount = amount;
    saveSelectedAmount(amount);
    window.location.href = `payment.html?amount=${encodeURIComponent(amount)}&number=${encodeURIComponent(number)}&operator=${encodeURIComponent(operator)}`;
  });
});

if (payAmount) {
  const params = new URLSearchParams(window.location.search);
  const amount = getSafeAmount(params.get("amount") || getSavedAmount());

  saveSelectedAmount(amount);
  payAmount.textContent = amount;
  upiOptionAmounts.forEach((item) => {
    item.textContent = amount;
  });
  document.title = `Pay ₹${amount} using UPI`;
}

upiOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const amount = String(payAmount?.textContent?.trim() || getSafeAmount(getSavedAmount()));
    const appName = option.querySelector("strong")?.textContent || "UPI app";
    const paymentScheme = option.dataset.scheme || "upi://pay";
    const vpa = option.dataset.vpa || "pandaheer8@okaxis";
    const name = option.dataset.name || "Jio Recharge";
    const cleanedAmount = amount.replace(/[^\d.]/g, "");
    const rechargeFor = pageNumber || "selected number";
    const upiLink = `${paymentScheme}?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(cleanedAmount)}&cu=INR&tn=${encodeURIComponent("Recharge " + rechargeFor)}`;

    const clickedAt = Date.now();

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = upiLink;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      if (Date.now() - clickedAt < 2000) {
        window.location.href = upiLink;
      }
    }, 2000);
  });
});
