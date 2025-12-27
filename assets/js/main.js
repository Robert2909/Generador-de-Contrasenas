"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS UI DEL GENERADOR ---
  // Modos
  const modeBtns = document.querySelectorAll(".mode-btn");
  const configChars = document.getElementById("configChars");
  const configPhrase = document.getElementById("configPhrase");

  // Config Caracteres
  const presetButtonsContainer = document.getElementById("presetButtons");
  const presetDescription = document.getElementById("presetDescription");
  const charTypeButtonsContainer = document.getElementById("charTypeButtons");
  const lengthInput = document.getElementById("length");
  const lengthValue = document.getElementById("lengthValue");
  const lengthQuickContainer = document.getElementById("lengthQuick");
  const useLower = document.getElementById("useLower");
  const useUpper = document.getElementById("useUpper");
  const useNumbers = document.getElementById("useNumbers");
  const useSymbols = document.getElementById("useSymbols");

  // Config Frase
  const phraseOptionsButtonsContainer = document.getElementById("phraseOptionsButtons");
  const phraseSeparatorCheckboxes = document.querySelectorAll(".sep-btn");
  const phraseSeparatorInput = document.getElementById("phraseSeparator");
  const wordCountInput = document.getElementById("wordCount");
  const wordCountValue = document.getElementById("wordCountValue");

  // Common
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passwordOutput = document.getElementById("passwordOutput");
  const resultCard = document.getElementById("resultCard");
  const resultPanel = document.getElementById("resultPanel"); // NEW PANEL REF
  const strengthLabel = document.getElementById("strengthLabel");
  const strengthBarFill = document.getElementById("strengthBarFill");
  const requirementsText = document.getElementById("requirementsText");
  const crackTimeValue = document.getElementById("crackTimeValue");
  const entropyValue = document.getElementById("entropyValue");
  const errorBox = document.getElementById("errorBox");
  const copyStatus = document.getElementById("copyStatus");

  // Tabs & Validator
  const tabGenerator = document.getElementById("tabGenerator");
  const tabValidator = document.getElementById("tabValidator");
  const viewGenerator = document.getElementById("viewGenerator");
  const viewValidator = document.getElementById("viewValidator");
  const manualInput = document.getElementById("manualInput");
  const validatorResult = document.getElementById("validatorResult");
  const valCrackTime = document.getElementById("valCrackTime");
  const valStrengthBar = document.getElementById("valStrengthBar");
  const valStrengthLabel = document.getElementById("valStrengthLabel");
  const valEntropy = document.getElementById("valEntropy");
  const valFeedback = document.getElementById("valFeedback");
  const toggleManualVisibility = document.getElementById("toggleManualVisibility");

  // History
  const historySection = document.getElementById("historySection");
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  // STATE
  const state = {
    mode: "chars", // 'chars' | 'phrase'
    currentPresetId: "estandar",
    customConfig: {
      length: 16,
      useLower: true, useUpper: true, useNumbers: true, useSymbols: true
    },
    phraseConfig: {
      wordCount: 5,
      separator: "-",
      capitalize: true,
      includeNumber: true
    }
  };

  /* ----------------------
   *   PERSISTENCIA UTILS
   * ---------------------- */
  function loadPreferences() {
    try {
      const stored = localStorage.getItem("pg_prefs");
      if (stored) {
        const p = JSON.parse(stored);
        state.mode = p.mode || "chars";
        lengthInput.value = p.length || DEFAULT_LENGTH;
        useLower.checked = !!p.useLower;
        useUpper.checked = !!p.useUpper;
        useNumbers.checked = !!p.useNumbers;
        useSymbols.checked = !!p.useSymbols;
        state.currentPresetId = p.presetId || "estandar";
        if (p.phraseConfig) state.phraseConfig = p.phraseConfig;
      }
      const storedCustom = localStorage.getItem("pg_custom_config");
      if (storedCustom) state.customConfig = JSON.parse(storedCustom);
      updateUIFromState();
    } catch (e) { console.warn("No se pudieron cargar preferencias", e); }
  }

  function savePreferences() {
    try {
      state.phraseConfig.wordCount = parseInt(wordCountInput.value);
      state.phraseConfig.separator = phraseSeparatorInput.value;
      const p = {
        mode: state.mode,
        presetId: state.currentPresetId,
        length: lengthInput.value,
        useLower: useLower.checked,
        useUpper: useUpper.checked,
        useNumbers: useNumbers.checked,
        useSymbols: useSymbols.checked,
        phraseConfig: state.phraseConfig
      };
      localStorage.setItem("pg_prefs", JSON.stringify(p));
      if (state.currentPresetId === "personalizado") {
        state.customConfig = {
          length: lengthInput.value,
          useLower: useLower.checked,
          useUpper: useUpper.checked,
          useNumbers: useNumbers.checked,
          useSymbols: useSymbols.checked
        };
        localStorage.setItem("pg_custom_config", JSON.stringify(state.customConfig));
      }
    } catch (e) { console.warn("No se pudieron guardar preferencias", e); }
  }

  function updatePhraseButtonsUI() {
    const buttons = phraseOptionsButtonsContainer.querySelectorAll(".char-btn");
    buttons.forEach(btn => {
      const type = btn.dataset.toggle;
      let active = false;
      if (type === "capitalize") active = state.phraseConfig.capitalize;
      else if (type === "number") active = state.phraseConfig.includeNumber;
      if (active) btn.classList.add("active"); else btn.classList.remove("active");
    });
  }

  function updateUIFromState() {
    // Mode Buttons
    modeBtns.forEach(btn => {
      if (btn.dataset.mode === state.mode) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Config Views Visibility
    if (state.mode === "chars") {
      configChars.classList.remove("hidden"); configPhrase.classList.add("hidden");
    } else {
      configChars.classList.add("hidden"); configPhrase.classList.remove("hidden");
    }

    // Update Presets UI State
    const presetBtns = presetButtonsContainer.querySelectorAll(".preset-btn");
    let presetFound = false;
    presetBtns.forEach(btn => {
      if (btn.dataset.id === state.currentPresetId) {
        btn.classList.add("active");
        const preset = SECURITY_PRESETS.find(p => p.id === state.currentPresetId);
        if (preset) presetDescription.textContent = preset.description;
        presetFound = true;
      } else {
        btn.classList.remove("active");
      }
    });

    // RESTORE CUSTOM CONFIG
    if (state.currentPresetId === "personalizado" && state.customConfig) {
      lengthInput.value = state.customConfig.length || DEFAULT_LENGTH;
      if (state.customConfig.useLower !== undefined) useLower.checked = state.customConfig.useLower;
      if (state.customConfig.useUpper !== undefined) useUpper.checked = state.customConfig.useUpper;
      if (state.customConfig.useNumbers !== undefined) useNumbers.checked = state.customConfig.useNumbers;
      if (state.customConfig.useSymbols !== undefined) useSymbols.checked = state.customConfig.useSymbols;
    }

    // Chars UI Sync
    updateLengthLabel();
    updateLengthQuickButtonsFromSlider();
    syncCharButtonsFromCheckboxes();

    // Phrase UI Sync
    if (state.phraseConfig) {
      wordCountInput.value = state.phraseConfig.wordCount || 5;
      phraseSeparatorInput.value = state.phraseConfig.separator || "-";
    }
    updateWordCountLabel();
    updateSeparatorButtons();
    updatePhraseButtonsUI();
  }

  /* ----------------------
   *   MODE LOGIC
   * ---------------------- */
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      updateUIFromState(); savePreferences(); handleGenerate();
    });
  });

  /* ----------------------
   *   PHRASE UI LOGIC
   * ---------------------- */
  function updateWordCountLabel() { wordCountValue.textContent = `${wordCountInput.value} palabras`; }
  wordCountInput.addEventListener("input", () => { updateWordCountLabel(); savePreferences(); });

  phraseOptionsButtonsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".char-btn");
    if (!btn) return;
    const type = btn.dataset.toggle;
    if (type === "capitalize") state.phraseConfig.capitalize = !state.phraseConfig.capitalize;
    else if (type === "number") state.phraseConfig.includeNumber = !state.phraseConfig.includeNumber;
    updatePhraseButtonsUI(); savePreferences();
  });

  function updateSeparatorButtons() {
    const current = phraseSeparatorInput.value;
    phraseSeparatorCheckboxes.forEach(btn => {
      if (btn.dataset.sep === current) btn.classList.add("active"); else btn.classList.remove("active");
    });
  }
  phraseSeparatorCheckboxes.forEach(btn => {
    btn.addEventListener("click", () => {
      phraseSeparatorInput.value = btn.dataset.sep;
      updateSeparatorButtons(); savePreferences();
    });
  });

  /* ----------------------
   *   GENERATOR LOGIC
   * ---------------------- */
  function getCurrentOptions() {
    if (state.mode === "phrase") {
      return {
        mode: "phrase",
        wordCount: parseInt(wordCountInput.value),
        separator: phraseSeparatorInput.value,
        capitalize: state.phraseConfig.capitalize,
        includeNumber: state.phraseConfig.includeNumber
      };
    } else {
      return {
        mode: "chars",
        length: parseInt(lengthInput.value, 10) || DEFAULT_LENGTH,
        useLower: useLower.checked,
        useUpper: useUpper.checked,
        useNumbers: useNumbers.checked,
        useSymbols: useSymbols.checked,
      };
    }
  }

  /* ---------------------
   *   SOUND SYSTEM (Synth)
   * ------------------- */
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'generate') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'copy') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'delete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    }
  }

  /* ---------------------
   *   HISTORY & VALIDATOR & TABS
   * ------------------- */
  function loadHistory() { try { const stored = localStorage.getItem("pg_history"); if (!stored) return []; return JSON.parse(stored); } catch { return []; } }

  function addToHistory(password) {
    if (!password) return;
    try {
      let history = loadHistory();
      if (history.length > 0 && history[0] === password) return;
      history.unshift(password); if (history.length > 20) history.pop();
      localStorage.setItem("pg_history", JSON.stringify(history));
      renderHistory();

      // Animation for new item
      const firstItem = historyList.firstElementChild;
      if (firstItem && !firstItem.classList.contains("history-empty-msg")) {
        firstItem.classList.add("entering");
      }
    } catch (e) { }
  }

  function deleteFromHistory(index) {
    // Find the actual DOM element to animate out
    const items = historyList.querySelectorAll(".history-item");
    if (items[index]) {
      items[index].classList.add("leaving");
      // Wait for animation to finish before removing from data and re-rendering
      setTimeout(() => {
        let history = loadHistory();
        history.splice(index, 1);
        localStorage.setItem("pg_history", JSON.stringify(history));
        playSound('delete');
        renderHistory();
      }, 300); // Matches CSS animation duration
    } else {
      // Fallback if DOM out of sync
      let history = loadHistory();
      history.splice(index, 1);
      localStorage.setItem("pg_history", JSON.stringify(history));
      renderHistory();
    }
  }

  function clearHistory() {
    const items = historyList.querySelectorAll('.history-item');
    if (items.length === 0) return;

    // Play sound immediately
    playSound('delete');

    // Staggered animation for each item
    items.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.05}s`; // Fast stagger effect
      item.classList.add('leaving');
    });

    // Wait for all animations to complete + buffer
    const totalDuration = 300 + (items.length * 50);

    setTimeout(() => {
      localStorage.removeItem("pg_history");
      renderHistory();
    }, Math.min(totalDuration, 2000)); // Cap wait time so it doesn't feel sluggish if list is huge
  }
  function renderHistory() {
    const history = loadHistory();
    historySection.classList.remove("hidden");
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty-msg">Sin historial reciente</div>';
      clearHistoryBtn.classList.add("hidden");
      // Force layout check in case transition from populated to empty
      requestAnimationFrame(() => {
        if (typeof adjustHistoryListHeight === 'function') adjustHistoryListHeight();
      });
      return;
    }
    clearHistoryBtn.classList.remove("hidden");

    history.forEach((pwd, index) => {
      const item = document.createElement("div"); item.className = "history-item";

      const passSpan = document.createElement("span");
      passSpan.className = "history-pass";
      passSpan.textContent = pwd;
      passSpan.title = pwd;

      // Actions Container
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "history-actions";

      // Copy Button
      const btnCopy = document.createElement("button");
      btnCopy.className = "history-copy-btn";
      btnCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      btnCopy.title = "Copiar";
      const successIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      btnCopy.onclick = async () => {
        await copyToClipboard(pwd);
        playSound('copy');
        animateBtnSuccess(btnCopy, successIcon);
      };

      // Delete Button (Trash)
      const btnDelete = document.createElement("button");
      btnDelete.className = "history-delete-btn";
      btnDelete.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      btnDelete.title = "Eliminar";
      btnDelete.onclick = () => { deleteFromHistory(index); };

      actionsDiv.appendChild(btnCopy);
      actionsDiv.appendChild(btnDelete);

      item.appendChild(passSpan);
      item.appendChild(actionsDiv);
      historyList.appendChild(item);
    });
  }
  clearHistoryBtn.addEventListener("click", clearHistory);

  function switchTab(view) {
    if (view === "generator") {
      tabGenerator.classList.add("active"); tabValidator.classList.remove("active");
      viewGenerator.classList.remove("hidden"); viewValidator.classList.add("hidden");
    } else {
      tabGenerator.classList.remove("active"); tabValidator.classList.add("active");
      viewGenerator.classList.add("hidden"); viewValidator.classList.remove("hidden");
      manualInput.focus();

      // Auto-hide result panel when validating to avoid clutter/confusion
      resultPanel.classList.add("hidden");
    }
  }
  tabGenerator.addEventListener("click", () => switchTab("generator"));
  tabValidator.addEventListener("click", () => switchTab("validator"));

  toggleManualVisibility.addEventListener("click", () => {
    const isPass = manualInput.type === "password";
    manualInput.type = isPass ? "text" : "password";

    // SVG Icons
    const eyeOpen = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosed = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    toggleManualVisibility.innerHTML = isPass ? eyeClosed : eyeOpen;
    toggleManualVisibility.setAttribute("aria-label", isPass ? "Ocultar contraseña" : "Mostrar contraseña");
  });

  // PWNED CHECKER LOGIC
  let pwnedTimeout;
  const pwnedStatus = document.getElementById("pwnedStatus");
  manualInput.addEventListener("input", (e) => {
    const pwd = e.target.value;
    clearTimeout(pwnedTimeout);
    pwnedStatus.classList.add("hidden"); pwnedStatus.className = "pwned-status hidden";
    if (!pwd) { validatorResult.classList.add("hidden"); return; }
    validatorResult.classList.remove("hidden");
    const result = evaluatePassword(pwd);
    valStrengthLabel.textContent = result.label; valStrengthLabel.style.color = result.color;
    valStrengthBar.style.width = `${result.percent}%`; valStrengthBar.style.backgroundColor = result.color; valStrengthBar.style.boxShadow = `0 0 10px ${result.color}`;
    valCrackTime.textContent = result.crackTime; valCrackTime.style.color = result.color;
    valEntropy.textContent = `${result.entropy} bits`; valFeedback.textContent = result.feedback; valFeedback.style.color = result.color;

    if (pwd.length >= 4) {
      pwnedStatus.className = "pwned-status pwned-checking";
      pwnedStatus.innerHTML = `<span class="pwned-loading"><span style="font-size:1.4em; flex-shrink:0;">🔎</span><div><strong>Un momento</strong><br> Verificando filtraciones...</div>`;
      pwnedStatus.classList.remove("hidden");
      pwnedTimeout = setTimeout(async () => {
        const count = await PwnedChecker.check(pwd);
        // Base class pwned-status provides the card shape
        if (count === -1) {
          pwnedStatus.className = "pwned-status pwned-danger";
          pwnedStatus.innerHTML = `<span style="font-size:1.4em; flex-shrink:0;">⚠️</span> <span>Error conectando con base de datos de filtraciones.</span>`;
        } else if (count > 0) {
          pwnedStatus.className = "pwned-status pwned-danger";
          const s = count === 1 ? "" : "s";
          pwnedStatus.innerHTML = `<span style="font-size:1.4em; flex-shrink:0;">🚨</span> <div><strong>¡Cuidado!</strong><br> Esta contraseña aparece en <strong>${count.toLocaleString()}</strong> filtraciones.</div>`;
        } else {
          pwnedStatus.className = "pwned-status pwned-safe";
          pwnedStatus.innerHTML = `<span style="font-size:1.4em; flex-shrink:0;">🛡️</span> <div><strong>¡Segura!</strong><br> No aparece en filtraciones conocidas.</div>`;
        }
      }, 600);
    }
  });

  /* ---------------------
   *   UTILS GENERATE & UI
   * ------------------- */
  let clipboardTimer = null;

  function showError(msg) {
    if (!msg) { errorBox.classList.add("hidden"); return; }
    errorBox.textContent = msg; errorBox.classList.remove("hidden");
  }

  function showNinjaAlert(msg) {
    if (!msg) { copyStatus.classList.add("hidden"); return; }
    copyStatus.className = "alert alert-ninja";
    copyStatus.innerHTML = `<span>🥷</span> <span>${msg}</span>`;
    copyStatus.classList.remove("hidden");
    setTimeout(() => copyStatus.classList.add("hidden"), 3000);
  }

  function animateBtnSuccess(btn, tempText = null) {
    if (!btn) return;
    const originalHTML = btn.innerHTML;

    // Add global success class for styling
    btn.classList.add("success");

    if (tempText) btn.innerHTML = tempText;

    setTimeout(() => {
      btn.classList.remove("success");
      if (tempText) btn.innerHTML = originalHTML;
    }, 1500);
  }

  async function copyToClipboard(text) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    // Ninja Logic
    if (clipboardTimer) clearTimeout(clipboardTimer);
    clipboardTimer = setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(" ");
        showNinjaAlert("Portapapeles borrado por seguridad.");
      } catch (e) { console.log("No se pudo limpiar el portapapeles en segundo plano"); }
    }, 45000);
  }

  function updateStrengthUI(password) {
    if (!password) { return; }
    // Make sure it's visible (in case it was hidden during anim)
    document.querySelector('.meta.strength-dashboard').style.opacity = '1';

    const result = evaluatePassword(password);
    strengthLabel.textContent = result.label; strengthLabel.style.color = result.color;
    strengthBarFill.style.width = `${result.percent}%`; strengthBarFill.style.backgroundColor = result.color; strengthBarFill.style.boxShadow = `0 0 10px ${result.color}`;
    crackTimeValue.textContent = result.crackTime; crackTimeValue.style.color = result.color;
    entropyValue.textContent = `${result.entropy} bits`; requirementsText.textContent = result.feedback; requirementsText.style.color = result.color;
  }

  function handleGenerate() {
    showError("");
    playSound('generate'); // Sound Effect
    const options = getCurrentOptions();
    try {
      const password = generatePassword(options);
      addToHistory(password);
      const duration = 500; const startTime = performance.now();
      const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

      // SHOW RIGHT PANEL
      resultPanel.classList.remove("hidden");
      // Initially hide the result card details or disable them until animation finishes
      // Actually per request: Disable buttons while animation runs.

      // Hide strength details during animation
      const metaDashboard = document.querySelector('.meta.strength-dashboard');
      if (metaDashboard) {
        metaDashboard.style.opacity = '0.3'; // Dimmed
        metaDashboard.style.transition = 'opacity 0.2s';
      }

      copyBtn.disabled = true;
      if (qrBtn) qrBtn.disabled = true;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress);
        let displayed = "";
        const len = password.length;
        for (let i = 0; i < len; i++) {
          if (progress === 1 || Math.random() < ease) displayed += password[i];
          else displayed += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        passwordOutput.value = displayed;
        if (progress < 1) requestAnimationFrame(animate);
        else {
          passwordOutput.value = password;
          updateStrengthUI(password);
          copyBtn.disabled = false;
          if (qrBtn) qrBtn.disabled = false;
        }
      };
      requestAnimationFrame(animate);
    } catch (err) { console.error(err); showError(err.message); }
  }

  async function handleCopy(btnElement) {
    const value = passwordOutput.value || "";
    if (!value) return;
    await copyToClipboard(value);

    // SVG Check Icon
    const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2px"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    if (btnElement === copyBtn) animateBtnSuccess(copyBtn, `Copíado ${checkIcon}`);
  }

  generateBtn.addEventListener("click", handleGenerate);
  copyBtn.addEventListener("click", () => handleCopy(copyBtn));
  passwordOutput.addEventListener("click", () => { if (passwordOutput.value) passwordOutput.select(); });

  /* ----------------------
   *   INIT HELPERS
   * ---------------------- */
  function initPresets() {
    presetButtonsContainer.innerHTML = "";
    SECURITY_PRESETS.forEach(preset => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-btn";
      btn.textContent = preset.label;
      btn.dataset.id = preset.id;
      if (preset.id === state.currentPresetId) {
        btn.classList.add("active");
        presetDescription.textContent = preset.description;
      }

      btn.addEventListener("click", () => {
        state.currentPresetId = preset.id;
        // Visual update
        document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        presetDescription.textContent = preset.description;

        if (preset.id !== "personalizado" && preset.options) {
          lengthInput.value = preset.options.length;
          useLower.checked = preset.options.useLower;
          useUpper.checked = preset.options.useUpper;
          useNumbers.checked = preset.options.useNumbers;
          useSymbols.checked = preset.options.useSymbols;
        }
        updateUIFromState();
        savePreferences();
        handleGenerate(); // Auto generate on preset change
      });
      presetButtonsContainer.appendChild(btn);
    });
  }

  function initCharTypeButtons() {
    const buttons = charTypeButtonsContainer.querySelectorAll(".char-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        let checkbox;
        if (type === 'lower') checkbox = useLower;
        else if (type === 'upper') checkbox = useUpper;
        else if (type === 'numbers') checkbox = useNumbers;
        else if (type === 'symbols') checkbox = useSymbols;

        if (checkbox) {
          // UX IMPROVEMENT: Prevent deselecting the last option (Silent Resistance)
          // If trying to uncheck AND it's the only one checked -> Do nothing.
          if (checkbox.checked) {
            const activeCount = [useLower, useUpper, useNumbers, useSymbols].filter(cb => cb.checked).length;
            if (activeCount <= 1) return;
          }

          checkbox.checked = !checkbox.checked;

          if (state.currentPresetId !== "personalizado") {
            state.currentPresetId = "personalizado";
            document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
            const customBtn = document.querySelector('.preset-btn[data-id="personalizado"]');
            if (customBtn) {
              customBtn.classList.add("active");
              presetDescription.textContent = SECURITY_PRESETS.find(p => p.id === "personalizado").description;
            }
          }
          syncCharButtonsFromCheckboxes();
          savePreferences();
        }
      });
    });
  }

  function syncCharButtonsFromCheckboxes() {
    const map = {
      'lower': useLower.checked,
      'upper': useUpper.checked,
      'numbers': useNumbers.checked,
      'symbols': useSymbols.checked
    };
    const buttons = charTypeButtonsContainer.querySelectorAll(".char-btn");
    buttons.forEach(btn => {
      if (map[btn.dataset.type]) btn.classList.add("active");
      else btn.classList.remove("active");
    });
  }

  function initLengthQuickButtons() {
    const buttons = lengthQuickContainer.querySelectorAll(".length-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        lengthInput.value = btn.dataset.length;
        updateLengthLabel();
        updateLengthQuickButtonsFromSlider();

        if (state.currentPresetId !== "personalizado") {
          state.currentPresetId = "personalizado";
          document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
          const customBtn = document.querySelector('.preset-btn[data-id="personalizado"]');
          if (customBtn) {
            customBtn.classList.add("active");
            presetDescription.textContent = SECURITY_PRESETS.find(p => p.id === "personalizado").description;
          }
        }
        savePreferences();
        handleGenerate();
      });
    });

    lengthInput.addEventListener("input", () => {
      updateLengthLabel();
      updateLengthQuickButtonsFromSlider();
      if (state.currentPresetId !== "personalizado") {
        state.currentPresetId = "personalizado";
        const currentPreset = SECURITY_PRESETS.find(p => p.id === state.currentPresetId);
        document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
        const customBtn = document.querySelector('.preset-btn[data-id="personalizado"]');
        if (customBtn) {
          customBtn.classList.add("active");
          if (currentPreset) presetDescription.textContent = currentPreset.description;
        }
      }
      savePreferences();
    });
  }

  function updateLengthLabel() { lengthValue.textContent = `${lengthInput.value} caracteres`; }
  function updateLengthQuickButtonsFromSlider() {
    const currentVal = lengthInput.value;
    const buttons = lengthQuickContainer.querySelectorAll(".length-btn");
    buttons.forEach(btn => {
      if (btn.dataset.length === currentVal) btn.classList.add("active");
      else btn.classList.remove("active");
    });
  }

  /* ---------------------
   *   INIT
   * ------------------- */
  lengthInput.min = DEFAULT_MIN_LENGTH; lengthInput.max = DEFAULT_MAX_LENGTH; lengthInput.value = DEFAULT_LENGTH;
  loadPreferences();
  renderHistory();
  initPresets(); initCharTypeButtons(); initLengthQuickButtons();

  /* ---------------------
   *   ATAJOS DE TECLADO
   * ------------------- */
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    const isEditing = (tag === "INPUT" && (e.target.type === "text" || e.target.type === "password" || e.target.type === "number")) || tag === "TEXTAREA";

    if (e.key === "Enter") {
      if (!viewGenerator.classList.contains("hidden")) {
        e.preventDefault(); handleGenerate();
        generateBtn.classList.add("active-key"); setTimeout(() => generateBtn.classList.remove("active-key"), 150);
      }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
      if (window.getSelection().toString().length > 0) return;
      if (!viewGenerator.classList.contains("hidden")) {
        e.preventDefault(); handleCopy(copyBtn);
      }
    }
    if ((e.key === "m" || e.key === "M") && !isEditing && !(e.ctrlKey || e.metaKey || e.altKey)) {
      e.preventDefault();
      if (!viewGenerator.classList.contains("hidden")) {
        state.mode = state.mode === "chars" ? "phrase" : "chars";
        updateUIFromState(); savePreferences(); handleGenerate();
      }
    }
    if (e.altKey && e.key === "1") { e.preventDefault(); switchTab("generator"); }
    if (e.altKey && e.key === "2") { e.preventDefault(); switchTab("validator"); }
  });

  /* ----------------------
   *   QR MODULE INTEGRATION (Safe Mode)
   * ---------------------- */
  const qrBtn = document.getElementById("qrBtn");
  const qrOverlay = document.getElementById("qrOverlay");
  const closeQrBtn = document.getElementById("closeQrBtn");
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  let qrInstance = null;

  if (qrBtn && qrOverlay) {
    qrBtn.addEventListener("click", () => {
      const pwd = passwordOutput.value;
      if (!pwd) return;

      qrCodeContainer.innerHTML = ""; // Clear previous
      try {
        // Generate QR Logic (Kazuhiko Arase Lib)
        // Type 10 (Fits ~131 bytes at 'M'), robust for passwords
        const qr = qrcode(10, 'M');
        qr.addData(pwd);
        qr.make();

        // Manual Canvas Rendering (Maximum Robustness)
        const moduleCount = qr.getModuleCount();
        const cellSize = 5; // Pixel size per module
        const margin = cellSize * 4; // QUIET ZONE OBLIGATORIA (4 módulos de borde blanco)

        const canvas = document.createElement('canvas');
        const size = moduleCount * cellSize + margin * 2;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        // 1. Fill Background (White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // 2. Draw Modules (Black)
        ctx.fillStyle = '#000000';
        for (let r = 0; r < moduleCount; r++) {
          for (let c = 0; c < moduleCount; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(
                margin + c * cellSize,
                margin + r * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }

        // 3. Append to Container
        // We convert to Image for better accessibility/clipboard support if needed, 
        // but Canvas node is perfectly fine for display.
        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png");
        img.alt = "QR Code de contraseña";
        img.style.display = "block"; // Fix any inline spacing issues

        qrCodeContainer.innerHTML = "";
        qrCodeContainer.appendChild(img);

        // Show Modal
        qrOverlay.classList.remove("hidden");
        setTimeout(() => qrOverlay.classList.add("visible"), 10);
      } catch (e) {
        console.error("QR Error:", e);
        showError("No se pudo generar el código QR.");
      }
    });

    const closeQR = () => {
      qrOverlay.classList.remove("visible");
      // Wait for transition then possibly hide or just leave it
    };

    closeQrBtn.addEventListener("click", closeQR);
    qrOverlay.addEventListener("click", (e) => {
      if (e.target === qrOverlay) closeQR();
    });

    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && qrOverlay.classList.contains("visible")) closeQR();
    });
  }

  /* ----------------------
   *   DYNAMIC LAYOUT ADJUSTMENT
   * ---------------------- */
  /* ----------------------
   *   DYNAMIC LAYOUT ADJUSTMENT
   * ---------------------- */
  const configPanel = document.querySelector(".config-panel");

  function adjustHistoryListHeight() {
    if (!configPanel || !resultPanel) return;

    // Only adjust if desktop layout (split view)
    if (window.innerWidth <= 700) {
      // Revert to CSS default (unconstrained height)
      resultPanel.style.height = "";
      return;
    }

    // If result panel is hidden, we can't sync content, but we can reset
    if (resultPanel.classList.contains("hidden")) return;

    const leftHeight = configPanel.getBoundingClientRect().height;
    // Sync heights directly. Flexbox handles the internal distribution.
    resultPanel.style.height = `${leftHeight}px`;
  }

  // 1. Observe size changes in the left panel (e.g. expanding options)
  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(adjustHistoryListHeight);
  });
  if (configPanel) resizeObserver.observe(configPanel);

  // 2. Listen for window resize
  window.addEventListener("resize", adjustHistoryListHeight);

  // 3. Trigger when visibility changes
  const resultObserver = new MutationObserver(() => {
    requestAnimationFrame(adjustHistoryListHeight);
  });
  if (resultPanel) resultObserver.observe(resultPanel, { attributes: true, attributeFilter: ['class'] });

  // 4. Also hook manual triggers to be safe (Initial Load)
  setTimeout(adjustHistoryListHeight, 100);

});
