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
const plansBackButton = document.querySelector(".plans-page .back-button");
const plansChangeLink = document.querySelector(".recharging-strip a");
const selectedAmountKey = "selectedRechargeAmount";
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const pageParams = new URLSearchParams(window.location.search);
const pageNumber = pageParams.get("number")?.replace(/\D/g, "").slice(0, 10) || "";

if (currentPage === "plans.html" && pageNumber.length !== 10) {
  window.location.replace("index.html");
}

if (paymentBackButton) {
  const operator = pageParams.get("operator") || "Jio";
  const planType = pageParams.get("type") || "prepaid";
  paymentBackButton.href = pageNumber
    ? `plans.html?number=${encodeURIComponent(pageNumber)}&operator=${encodeURIComponent(operator)}&type=${encodeURIComponent(planType)}`
    : "index.html";
}

if (plansBackButton || plansChangeLink) {
  const operator = pageParams.get("operator") || "Jio";
  const planType = pageParams.get("type") || "prepaid";
  plansBackButton.href = pageNumber
    ? `index.html?number=${encodeURIComponent(pageNumber)}&operator=${encodeURIComponent(operator)}&type=${encodeURIComponent(planType)}#recharge`
    : "index.html#recharge";
  plansChangeLink.href = pageNumber
    ? `index.html?number=${encodeURIComponent(pageNumber)}&operator=${encodeURIComponent(operator)}&type=${encodeURIComponent(planType)}#recharge`
    : "index.html#recharge";
}

if (currentPage === "index.html" || currentPage === "") {
  const savedOperator = pageParams.get("operator");
  const savedType = pageParams.get("type");

  if (savedOperator) {
    const operatorBtn = document.querySelector(`.service-tabs button[data-operator="${savedOperator}"]`);
    if (operatorBtn) {
      serviceButtons.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });
      operatorBtn.classList.add("active");
      operatorBtn.setAttribute("aria-pressed", "true");
    }
  }

  if (savedType) {
    const planBtn = document.querySelector(`.plan-toggle button[data-plan="${savedType}"]`);
    if (planBtn) {
      planButtons.forEach((item) => {
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
      });
      planBtn.classList.add("selected");
      planBtn.setAttribute("aria-pressed", "true");
    }
  }
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

const updateRechargeHint = (message, state = "info") => {
  if (!rechargeHint) {
    return;
  }

  rechargeHint.textContent = message;
  rechargeHint.classList.toggle("demo-message", state !== "default");
  rechargeHint.classList.toggle("error-message", state === "error");
  rechargeHint.classList.toggle("success-message", state === "success");
};

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    updateRechargeHint(button.dataset.hint || `${button.dataset.operator} prepaid recharge selected.`);
  });
});

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("selected");
    button.setAttribute("aria-pressed", "true");
    const activeOperator = document.querySelector(".service-tabs button.active")?.dataset.operator || "Jio";
    const planType = button.dataset.plan === "postpaid" ? "postpaid" : "prepaid";
    updateRechargeHint(`${activeOperator} ${planType} recharge selected. Enter 10 digit mobile number.`);
  });
});

if (rechargeNumberInput) {
  rechargeNumberInput.addEventListener("input", () => {
    const number = rechargeNumberInput.value.replace(/\D/g, "").slice(0, 10);
    rechargeNumberInput.value = number;

    if (number.length === 10) {
      const activeOperator = document.querySelector(".service-tabs button.active")?.dataset.operator || "Jio";
      updateRechargeHint(`${activeOperator} number ready. Tap Recharge to view plans.`, "success");
    } else if (number.length > 0) {
      updateRechargeHint(`${10 - number.length} digit aur daalein.`, "info");
    } else {
      updateRechargeHint("Recharge with ₹239 or above to unlock 5G unlimited.", "default");
    }
  });
}

if (rechargeButton) {
  rechargeButton.addEventListener("click", () => {
    const number = rechargeNumberInput?.value.trim() || "";
    const activeOperator = document.querySelector(".service-tabs button.active")?.dataset.operator || "Jio";
    const activePlanType = document.querySelector(".plan-toggle button.selected")?.dataset.plan || "prepaid";

    if (number.length !== 10) {
      updateRechargeHint("Please valid 10 digit mobile number daalein.", "error");
      rechargeNumberInput?.focus();
      return;
    }

    const params = new URLSearchParams({
      number,
      operator: activeOperator,
      type: activePlanType,
    });

    window.location.href = `plans.html?${params.toString()}`;
  });
}

if (rechargeNumber) {
  const params = new URLSearchParams(window.location.search);
  const number = params.get("number")?.replace(/\D/g, "").slice(0, 10);
  const operator = params.get("operator") || "Jio";
  const planType = params.get("type") || "prepaid";

  rechargeNumber.textContent = number || "8102771005";
  document.title = `${operator} ${planType} Special Offer Plans`;
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
    const planType = params.get("type") || "prepaid";
    const amount = getSelectedPlanAmount(button);

    button.dataset.amount = amount;
    saveSelectedAmount(amount);
    const paymentParams = new URLSearchParams({ amount, number, operator, type: planType });
    window.location.href = `payment.html?${paymentParams.toString()}`;
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
    const vpa = option.dataset.vpa || "Paytm.s2vv2a7@pty";
    const name = option.dataset.name || "Jio Recharge";
    const cleanedAmount = amount.replace(/[^\d.]/g, "");
    const rechargeFor = pageNumber || "selected number";
    const upiParams = new URLSearchParams({
      pa: vpa,
      pn: name,
      am: cleanedAmount,
      cu: "INR",
      tn: `Recharge ${rechargeFor}`,
    });
    const appLink = `${paymentScheme}?${upiParams.toString()}`;
    const fallbackLink = `upi://pay?${upiParams.toString()}`;

    if (paymentNote) {
      paymentNote.textContent = `${appName} open ho raha hai ₹${cleanedAmount} payment ke liye...`;
    }

    window.location.href = appLink;

    window.setTimeout(() => {
      if (document.visibilityState === "visible" && paymentNote) {
        paymentNote.innerHTML = `${appName} open nahi hua? App installed ho to retry karein, ya <a href="${fallbackLink}">default UPI app open karein</a>.`;
      }
    }, 1400);
  });
});
