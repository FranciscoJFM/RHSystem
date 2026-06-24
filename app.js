// Mock Candidates Database
let candidates = [
  { id: 1, name: "Juan Carlos Pérez", phone: "55-1234-5678", zone: "Centro", shift: "Matutino", status: "En Onboarding", docs: ["INE", "Comprobante"], completedVideos: ["culture"] },
  { id: 2, name: "María Gómez Ruiz", phone: "55-9876-5432", zone: "Sur", shift: "Vespertino", status: "En Onboarding", docs: ["INE"], completedVideos: [] },
  { id: 3, name: "José Alfredo Hdez", phone: "55-4567-8901", zone: "Norte", shift: "Nocturno", status: "Inducción Completada", docs: ["INE", "Comprobante"], completedVideos: ["culture", "hospital", "elektra"] },
  { id: 4, name: "Estela Domínguez", phone: "55-3210-9876", zone: "Centro", shift: "Matutino", status: "Filtro Pendiente", docs: [], completedVideos: [] },
  { id: 5, name: "Ricardo Aguilar", phone: "55-8765-4321", zone: "Sur", shift: "Vespertino", status: "Descartado", docs: [], completedVideos: [] }
];

// Titles & Subtitles for each tab
const tabMeta = {
  overview: {
    title: "Resumen del Proyecto",
    subtitle: "Monitoreo de automatización de vacantes de limpieza y onboarding."
  },
  "bot-sim": {
    title: "Simulador de WhatsApp (Aspirante)",
    subtitle: "Prueba el bot interactivo simulando el chat de un candidato aspirante."
  },
  "onboarding-sim": {
    title: "Portal de Inducción Móvil",
    subtitle: "Simulador del portal donde el nuevo trabajador visualiza sus videos."
  },
  "recruiter-dashboard": {
    title: "Panel de Gestión de RH",
    subtitle: "Revisa tu cartera de candidatos filtrados por la automatización."
  },
  proposals: {
    title: "Propuestas de Servicio Freelance",
    subtitle: "Cotizaciones detalladas y arquitectura del sistema para aprobación."
  }
};

// State Variables for WhatsApp Simulator
let chatState = 0;
let botAnswers = {
  name: "",
  zone: "",
  shift: "",
  ineUploaded: false,
  domUploaded: false
};

// State Variables for Onboarding Video Simulator
let currentVideoKey = "";
let onboardingProgress = {
  culture: false,
  hospital: false,
  elektra: false
};

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderCandidatesTable();
  updateStats();
  restartChatbotFlow();
  updateTemplatePreview();
});

// Navigation logic
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const viewSections = document.querySelectorAll(".view-section");
  const titleEl = document.getElementById("dynamic-title");
  const subtitleEl = document.getElementById("dynamic-subtitle");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-tab");
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");
      
      // Update view section visibility
      viewSections.forEach(section => section.classList.remove("active"));
      const targetSection = document.getElementById(tab);
      if (targetSection) {
        targetSection.classList.add("active");
      }
      
      // Update header titles
      if (tabMeta[tab]) {
        titleEl.textContent = tabMeta[tab].title;
        subtitleEl.textContent = tabMeta[tab].subtitle;
      }
    });
  });
}

// Stats counter update
function updateStats() {
  const activeCount = candidates.filter(c => c.status === "En Onboarding" || c.status === "Filtro Pendiente").length;
  document.getElementById("stat-active-candidates").textContent = activeCount;
  document.getElementById("table-count").textContent = `${candidates.length} Candidatos`;
}

// Toast notification
function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  const toastIcon = toast.querySelector(".toast-icon");
  
  toastText.textContent = message;
  if (!isSuccess) {
    toast.style.borderColor = "var(--danger)";
    toastIcon.textContent = "✗";
    toastIcon.style.color = "var(--danger)";
  } else {
    toast.style.borderColor = "var(--success)";
    toastIcon.textContent = "✓";
    toastIcon.style.color = "var(--success)";
  }
  
  toast.classList.add("active");
  
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
}

// ----------------------------------------------------
// CHATBOT WHATSAPP SIMULATOR LOGIC
// ----------------------------------------------------

const waChatContainer = document.getElementById("wa-chat-container");
const waInput = document.getElementById("wa-input");
const waTyping = document.getElementById("wa-typing");

function restartChatbotFlow() {
  chatState = 0;
  botAnswers = { name: "", zone: "", shift: "", ineUploaded: false, domUploaded: false };
  waChatContainer.innerHTML = ""; // Clear chat
  waChatContainer.appendChild(waTyping); // Ensure typing is there but hidden
  
  showBotTypingAndReply("¡Hola! Bienvenido a la Bolsa de Trabajo de MopRh. 👋 Soy tu asistente virtual. ¿Me podrías decir tu nombre completo por favor para iniciar tu registro?", 1000);
  chatState = 1; // Expecting name
}

function handleWaInputKey(event) {
  if (event.key === "Enter") {
    sendWaUserMessage();
  }
}

function sendWaUserMessage() {
  const text = waInput.value.trim();
  if (!text) return;
  
  waInput.value = "";
  appendWaMessage(text, "outgoing");
  
  // Bot processes the user response depending on current chatState
  processBotFlow(text);
}

function appendWaMessage(text, type, options = null) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `wa-msg ${type}`;
  
  const textSpan = document.createElement("span");
  textSpan.innerHTML = text.replace(/\n/g, "<br>");
  msgDiv.appendChild(textSpan);
  
  if (options && options.length > 0) {
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "wa-msg-options";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "wa-option-btn";
      btn.textContent = opt.label;
      btn.onclick = () => {
        appendWaMessage(opt.label, "outgoing");
        optionsDiv.remove();
        processBotFlow(opt.value);
      };
      optionsDiv.appendChild(btn);
    });
    msgDiv.appendChild(optionsDiv);
  }
  
  const timeSpan = document.createElement("span");
  timeSpan.className = "wa-msg-time";
  const now = new Date();
  timeSpan.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  msgDiv.appendChild(timeSpan);
  
  // Insert before typing indicator
  waChatContainer.insertBefore(msgDiv, waTyping);
  waChatContainer.scrollTop = waChatContainer.scrollHeight;
}

function showBotTypingAndReply(text, delay = 1500, options = null) {
  waTyping.style.display = "block";
  waChatContainer.scrollTop = waChatContainer.scrollHeight;
  
  setTimeout(() => {
    waTyping.style.display = "none";
    appendWaMessage(text, "incoming", options);
  }, delay);
}

function processBotFlow(userInput) {
  const cleanInput = String(userInput).trim();
  
  if (chatState === 1) { // Expecting Name
    botAnswers.name = cleanInput;
    showBotTypingAndReply(`Mucho gusto, *${botAnswers.name}*. 📝 ¿En qué zona de la ciudad te interesaría laborar?`, 1200, [
      { label: "Zona Centro", value: "Centro" },
      { label: "Zona Norte", value: "Norte" },
      { label: "Zona Sur", value: "Sur" }
    ]);
    chatState = 2; // Expecting Zone
  } 
  else if (chatState === 2) { // Expecting Zone
    botAnswers.zone = cleanInput;
    showBotTypingAndReply(`Perfecto, anotado en Zona *${botAnswers.zone}*. 🕒 ¿Qué horario o turno tienes disponible para laborar?`, 1200, [
      { label: "Matutino (6 am - 2 pm)", value: "Matutino" },
      { label: "Vespertino (2 pm - 10 pm)", value: "Vespertino" },
      { label: "Nocturno (10 pm - 6 am)", value: "Nocturno" }
    ]);
    chatState = 3; // Expecting Shift
  } 
  else if (chatState === 3) { // Expecting Shift
    botAnswers.shift = cleanInput;
    showBotTypingAndReply(`Excelente disponibilidad. Por último, para agendar entrevista ocupamos validar tus documentos básicos. Por favor, presiona el botón para simular la carga de tu identificación oficial (INE). 🪪`, 1500, [
      { label: "📷 Adjuntar INE / Identificación", value: "upload_ine" }
    ]);
    chatState = 4; // Expecting Documents
  } 
  else if (chatState === 4) { // Expecting Documents (INE)
    if (cleanInput === "upload_ine") {
      botAnswers.ineUploaded = true;
      showBotTypingAndReply(`✓ INE Recibido correctamente. 📄 Ahora presiona el siguiente botón para subir tu Comprobante de Domicilio.`, 1200, [
        { label: "📷 Adjuntar Comprobante de Domicilio", value: "upload_dom" }
      ]);
      chatState = 5;
    }
  } 
  else if (chatState === 5) { // Expecting Comprobante
    if (cleanInput === "upload_dom") {
      botAnswers.domUploaded = true;
      
      showBotTypingAndReply(`🎉 ¡Felicidades, *${botAnswers.name}*! Hemos completado tu registro con éxito.\n\nHe enviado tus datos a nuestro equipo de Recursos Humanos.\n\nComo siguiente paso para que no entres en blanco al servicio, te invitamos a iniciar tu inducción digital viendo 3 videos explicativos cortos en la siguiente liga:\n\n🔗 https://moprh-onboarding.web.app/start?user=${encodeURIComponent(botAnswers.name)}`, 1800);
      
      // Automatically add this new candidate to the database!
      addNewCandidateFromBot();
      chatState = 6; // Flow completed
    }
  }
}

function addNewCandidateFromBot() {
  const newId = candidates.length + 1;
  const newCand = {
    id: newId,
    name: botAnswers.name,
    phone: "55-" + Math.floor(10000000 + Math.random() * 90000000),
    zone: botAnswers.zone,
    shift: botAnswers.shift,
    status: "En Onboarding",
    docs: ["INE", "Comprobante"],
    completedVideos: []
  };
  
  candidates.unshift(newCand); // Add to beginning
  renderCandidatesTable();
  updateStats();
  showToast(`¡Nuevo candidato "${newCand.name}" agregado desde el Bot WhatsApp!`);
}

// ----------------------------------------------------
// ONBOARDING PORTAL SIMULATOR LOGIC
// ----------------------------------------------------

function openVideoModal(videoKey) {
  currentVideoKey = videoKey;
  const modal = document.getElementById("video-modal");
  const modalTitle = document.getElementById("video-modal-title");
  const simTitle = document.getElementById("video-sim-title");
  const simDesc = document.getElementById("video-sim-desc");
  const timer = document.getElementById("video-timer");
  const progressBar = document.getElementById("video-progress-bar");
  const actionBtn = document.getElementById("video-action-btn");
  
  progressBar.style.width = "0%";
  actionBtn.style.display = "inline-flex";
  actionBtn.textContent = "Comenzar a Ver (Simulación de 5s)";
  
  if (videoKey === "culture") {
    modalTitle.textContent = "Inducción General MopRh";
    simTitle.textContent = "Capítulo 1: Bienvenido a MopRh";
    simDesc.textContent = "Nuestros valores, reglas de asistencia y código de vestimenta.";
    timer.textContent = "0:00 / 2:15";
  } else if (videoKey === "hospital") {
    modalTitle.textContent = "Capacitación en Hospitales";
    simTitle.textContent = "Capítulo 2: Limpieza en Áreas Hospitalarias";
    simDesc.textContent = "Medidas de seguridad, manejo de residuos peligrosos (RPBI) y autoprotección.";
    timer.textContent = "0:00 / 3:45";
  } else if (videoKey === "elektra") {
    modalTitle.textContent = "Capacitación en Sucursales y DIF";
    simTitle.textContent = "Capítulo 3: Limpieza Comercial y Corporativa";
    simDesc.textContent = "Protocolos de limpieza de áreas comunes, atención a clientes y DIF.";
    timer.textContent = "0:00 / 2:30";
  }
  
  modal.classList.add("active");
}

function closeVideoModal() {
  document.getElementById("video-modal").classList.remove("active");
}

function startSimulatedPlayback() {
  const actionBtn = document.getElementById("video-action-btn");
  const progressBar = document.getElementById("video-progress-bar");
  const timer = document.getElementById("video-timer");
  
  actionBtn.style.display = "none";
  
  let progress = 0;
  let duration = 5000; // 5 seconds simulation
  let intervalTime = 100;
  let elapsed = 0;
  
  let targetDurationText = "2:15";
  if (currentVideoKey === "hospital") targetDurationText = "3:45";
  if (currentVideoKey === "elektra") targetDurationText = "2:30";
  
  let playbackInterval = setInterval(() => {
    elapsed += intervalTime;
    progress = (elapsed / duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Simulate current running time
    let secondsSimulated = Math.floor((elapsed / duration) * parseInt(targetDurationText.split(":")[0]) * 60 + (elapsed / duration) * parseInt(targetDurationText.split(":")[1]));
    let mins = Math.floor(secondsSimulated / 60);
    let secs = secondsSimulated % 60;
    timer.textContent = `${mins}:${String(secs).padStart(2, "0")} / ${targetDurationText}`;
    
    if (elapsed >= duration) {
      clearInterval(playbackInterval);
      completeVideo(currentVideoKey);
    }
  }, intervalTime);
}

function completeVideo(key) {
  onboardingProgress[key] = true;
  
  // Update UI badge in smartphone mockup
  const badge = document.getElementById(`badge-${key}`);
  if (badge) {
    badge.className = "ob-badge completed";
    badge.textContent = "Completado";
  }
  
  // Update progress bar
  let completedCount = Object.values(onboardingProgress).filter(v => v === true).length;
  let percent = Math.round((completedCount / 3) * 100);
  
  document.getElementById("ob-progress-percent").textContent = `${percent}%`;
  document.getElementById("ob-progress-fill").style.width = `${percent}%`;
  
  closeVideoModal();
  showToast(`¡Video de "${key === 'culture' ? 'Inducción General' : key === 'hospital' ? 'Seguridad Hospitalaria' : 'Limpieza Comercial'}" visto con éxito!`);
  
  // Check if onboarding is completely finished
  if (completedCount === 3) {
    // Automatically update the candidate María Gómez (id 2) or any first candidate who's onboarding to 'Inducción Completada'
    const targetCand = candidates.find(c => c.id === 2);
    if (targetCand) {
      targetCand.status = "Inducción Completada";
      targetCand.completedVideos = ["culture", "hospital", "elektra"];
      renderCandidatesTable();
      updateStats();
    }
    
    setTimeout(() => {
      alert("🎉 ¡Felicidades! Se ha completado el 100% de la inducción móvil. RH ha sido notificado automáticamente para la contratación.");
    }, 500);
  }
}

function resetOnboardingProgress() {
  onboardingProgress = { culture: false, hospital: false, elektra: false };
  document.getElementById("ob-progress-percent").textContent = "0%";
  document.getElementById("ob-progress-fill").style.width = "0%";
  
  ["culture", "hospital", "elektra"].forEach(key => {
    const badge = document.getElementById(`badge-${key}`);
    if (badge) {
      badge.className = "ob-badge pending";
      badge.textContent = "Pendiente";
    }
  });
  
  const targetCand = candidates.find(c => c.id === 2);
  if (targetCand) {
    targetCand.status = "En Onboarding";
    targetCand.completedVideos = [];
    renderCandidatesTable();
    updateStats();
  }
  
  showToast("Progreso de inducción reiniciado.");
}

// ----------------------------------------------------
// RECRUITER DASHBOARD LOGIC
// ----------------------------------------------------

function renderCandidatesTable(data = candidates) {
  const tbody = document.getElementById("candidate-table-body");
  tbody.innerHTML = "";
  
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">Ningún candidato coincide con los filtros aplicados.</td></tr>`;
    return;
  }
  
  data.forEach(c => {
    const tr = document.createElement("tr");
    
    // Status color badge
    let statusClass = "tag-status";
    if (c.status === "Filtro Pendiente") statusClass += " pending-docs";
    if (c.status === "En Onboarding") statusClass += " onboarding";
    if (c.status === "Inducción Completada") statusClass += " onboarding"; // uses green success
    if (c.status === "Descartado") statusClass += " rejected";
    
    // Docs icon rendering
    const hasIne = c.docs.includes("INE");
    const hasDom = c.docs.includes("Comprobante");
    
    let docsHtml = "";
    if (hasIne) docsHtml += `<a href="#" class="doc-link" onclick="alert('Abriendo documento INE de ${c.name}')">🪪 INE</a> `;
    if (hasDom) docsHtml += `<a href="#" class="doc-link" onclick="alert('Abriendo Comprobante de Domicilio de ${c.name}')">🏠 DOM</a>`;
    if (!hasIne && !hasDom) docsHtml = `<span style="color:var(--text-muted);">Sin adjuntar</span>`;
    
    tr.innerHTML = `
      <td>
        <div class="candidate-info-cell">
          <div class="candidate-avatar-placeholder">${c.name.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
          <div>
            <div class="candidate-name">${c.name}</div>
            <div class="candidate-phone">${c.phone}</div>
          </div>
        </div>
      </td>
      <td>
        <div><span class="tag tag-zone">${c.zone}</span></div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Turno: ${c.shift}</div>
      </td>
      <td>
        <span class="tag ${statusClass}">${c.status}</span>
        ${c.status === "En Onboarding" ? `<span style="font-size:0.7rem; color:var(--text-muted); display:block; margin-top:0.25rem;">Progreso: ${Math.round((c.completedVideos.length / 3) * 100)}%</span>` : ''}
      </td>
      <td>${docsHtml}</td>
      <td>
        <div style="display:flex; gap:0.5rem;">
          ${c.status === "Filtro Pendiente" ? `
            <button class="btn btn-secondary" style="padding:0.35rem 0.6rem; font-size:0.75rem;" onclick="approveCandidate(${c.id})">Aprobar</button>
            <button class="btn btn-secondary" style="padding:0.35rem 0.6rem; font-size:0.75rem; color:var(--danger);" onclick="rejectCandidate(${c.id})">Descartar</button>
          ` : ''}
          ${c.status === "En Onboarding" ? `
            <button class="btn btn-secondary" style="padding:0.35rem 0.6rem; font-size:0.75rem;" onclick="notifyOnboardingReminder(${c.id})">Enviar Recordatorio</button>
          ` : ''}
          ${c.status === "Inducción Completada" ? `
            <button class="btn btn-primary" style="padding:0.35rem 0.6rem; font-size:0.75rem; background:var(--success);" onclick="hireCandidate(${c.id})">Contratar</button>
          ` : ''}
          ${c.status === "Descartado" ? `
            <button class="btn btn-secondary" style="padding:0.35rem 0.6rem; font-size:0.75rem;" onclick="approveCandidate(${c.id})">Re-evaluar</button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterCandidates() {
  const query = document.getElementById("candidate-search").value.toLowerCase();
  const zone = document.getElementById("zone-filter").value;
  const status = document.getElementById("status-filter").value;
  
  let filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(query) || c.phone.includes(query);
    const matchesZone = zone === "all" || c.zone === zone;
    const matchesStatus = status === "all" || c.status === status;
    return matchesSearch && matchesZone && matchesStatus;
  });
  
  renderCandidatesTable(filtered);
}

function approveCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (candidate) {
    candidate.status = "En Onboarding";
    renderCandidatesTable();
    updateStats();
    showToast(`Candidato "${candidate.name}" aprobado. Invitación de onboarding enviada por WhatsApp.`);
  }
}

function rejectCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (candidate) {
    candidate.status = "Descartado";
    renderCandidatesTable();
    updateStats();
    showToast(`Candidato "${candidate.name}" descartado.`, false);
  }
}

function hireCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (candidate) {
    candidates = candidates.filter(c => c.id !== id); // Remove from list / hire
    renderCandidatesTable();
    updateStats();
    alert(`🎉 ¡Felicidades! ${candidate.name} ha sido formalmente dado de alta en nómina y asignado a su servicio en la Zona ${candidate.zone}.`);
  }
}

function notifyOnboardingReminder(id) {
  const candidate = candidates.find(c => c.id === id);
  if (candidate) {
    showToast(`Mensaje recordatorio enviado por WhatsApp a ${candidate.name}.`);
  }
}

// Campaign Templates logic
const templates = {
  vacante_urgente: "🚨 *VACANTE URGENTE EN MOPRH* 🚨\n\nHola {{Nombre}}, ocupamos afanadores urgentes para *Tiendas Elektra* y *Hospital Civil* en la {{Zona}}.\n\n*Ofrecemos:*\n- Sueldo competitivo\n- Prestaciones de Ley desde primer día\n- Uniforme gratis\n\nSi estás interesado, contesta este mensaje para iniciar tu entrevista automatizada de inmediato. ¡Cupos limitados!",
  bienvenida_onboarding: "👋 Hola {{Nombre}}, te damos la bienvenida oficial a MopRh.\n\nPara iniciar tu capacitación, entra al portal desde tu celular y completa los 3 videos de inducción:\n\n🔗 https://moprh-onboarding.web.app/start?user={{NombreEncoded}}\n\nRecuerda terminar hoy mismo para firmar contrato mañana. 🧹",
  recordatorio_documentos: "🪪 *RECORDATORIO DE DOCUMENTOS - MOPRH*\n\nHola {{Nombre}}, notamos que aún no completas tu expediente. Ocupamos tu INE y comprobante de domicilio para formalizar tu propuesta.\n\nPor favor adjúntalos respondiendo a este número lo antes posible."
};

function updateTemplatePreview() {
  const selectedKey = document.getElementById("template-select").value;
  let text = templates[selectedKey];
  
  // Custom values for preview
  text = text.replace(/{{Nombre}}/g, "Juan Carlos")
             .replace(/{{Zona}}/g, "Zona Centro")
             .replace(/{{NombreEncoded}}/g, "Juan%20Carlos");
             
  document.getElementById("template-preview").value = text;
}

function sendMassCampaign() {
  const selectedKey = document.getElementById("template-select").value;
  const zone = document.getElementById("zone-filter").value;
  
  let targetCandidates = candidates;
  if (zone !== "all") {
    targetCandidates = candidates.filter(c => c.zone === zone);
  }
  
  if (targetCandidates.length === 0) {
    showToast("No hay candidatos en la cartera para la zona filtrada.", false);
    return;
  }
  
  showToast(`Enviando campaña a ${targetCandidates.length} candidatos vía API de WhatsApp...`);
  
  setTimeout(() => {
    alert(`📢 ¡Campaña enviada con éxito!\n\nSe enviaron ${targetCandidates.length} mensajes masivos personalizados a la cartera filtrada de la zona: ${zone === "all" ? "Todas las Zonas" : zone}.`);
  }, 1000);
}

// ----------------------------------------------------
// SYSTEM DEMO TRIGGERS
// ----------------------------------------------------

function simulateIncomingCandidate() {
  // Simulate chatbot starting from background
  const names = ["Carlos Soto Valenzuela", "Rosa María Delgado", "Miguel Ángel Ortiz", "Patricia Sánchez Ruiz"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const zones = ["Centro", "Norte", "Sur"];
  const randomZone = zones[Math.floor(Math.random() * zones.length)];
  const shifts = ["Matutino", "Vespertino", "Nocturno"];
  const randomShift = shifts[Math.floor(Math.random() * shifts.length)];
  
  // Add direct candidate simulating finished chatbot flow
  const newId = candidates.length + 1;
  const newCand = {
    id: newId,
    name: randomName,
    phone: "55-" + Math.floor(10000000 + Math.random() * 90000000),
    zone: randomZone,
    shift: randomShift,
    status: "Filtro Pendiente",
    docs: ["INE", "Comprobante"],
    completedVideos: []
  };
  
  candidates.unshift(newCand);
  renderCandidatesTable();
  updateStats();
  
  showToast(`🔔 Alerta: "${randomName}" completó el pre-registro en WhatsApp y subió documentos.`);
}

function resetSimulations() {
  // Restore initial candidates
  candidates = [
    { id: 1, name: "Juan Carlos Pérez", phone: "55-1234-5678", zone: "Centro", shift: "Matutino", status: "En Onboarding", docs: ["INE", "Comprobante"], completedVideos: ["culture"] },
    { id: 2, name: "María Gómez Ruiz", phone: "55-9876-5432", zone: "Sur", shift: "Vespertino", status: "En Onboarding", docs: ["INE"], completedVideos: [] },
    { id: 3, name: "José Alfredo Hdez", phone: "55-4567-8901", zone: "Norte", shift: "Nocturno", status: "Inducción Completada", docs: ["INE", "Comprobante"], completedVideos: ["culture", "hospital", "elektra"] },
    { id: 4, name: "Estela Domínguez", phone: "55-3210-9876", zone: "Centro", shift: "Matutino", status: "Filtro Pendiente", docs: [], completedVideos: [] },
    { id: 5, name: "Ricardo Aguilar", phone: "55-8765-4321", zone: "Sur", shift: "Vespertino", status: "Descartado", docs: [], completedVideos: [] }
  ];
  
  // Reset tab selection to overview
  const navOverview = document.querySelector('.nav-item[data-tab="overview"]');
  if (navOverview) navOverview.click();
  
  restartChatbotFlow();
  resetOnboardingProgress();
  renderCandidatesTable();
  updateStats();
  
  showToast("Todos los simuladores y datos han sido reiniciados.");
}
