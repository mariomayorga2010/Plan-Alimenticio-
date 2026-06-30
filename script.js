/* =========================================================
   EQUILIBRIO — Lógica de la aplicación (Vanilla JS)
   Nota: usa localStorage para persistir mediciones del perfil.
   Esto funciona al abrir index.html en cualquier navegador
   estándar (Chrome, Safari, Firefox) de forma local o alojado
   en un servidor/hosting. Si lo visualizas dentro de una vista
   previa en iframe restringido, ábrelo en una pestaña normal
   del navegador para que el guardado persista correctamente.
   ========================================================= */

const STORAGE_KEY = "equilibrio_mediciones_v1";

/* ---------------- Navegación entre las 4 secciones ---------------- */
const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

function goToView(targetId){
  views.forEach(v => v.classList.toggle("view-active", v.id === targetId));
  navButtons.forEach(b => {
    const active = b.dataset.target === targetId;
    b.classList.toggle("nav-active", active);
    if(active) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
  });
  window.scrollTo({ top:0, behavior:"smooth" });
}

navButtons.forEach(btn=>{
  btn.addEventListener("click", ()=> goToView(btn.dataset.target));
});

/* ---------------- PERFIL: guardar / cargar mediciones ---------------- */
function loadMediciones(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveMediciones(arr){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  catch(e){ console.warn("No se pudo guardar en este navegador:", e); }
}

function calcIMC(pesoKg, estaturaCm){
  const m = estaturaCm/100;
  return pesoKg / (m*m);
}
function imcCategoria(imc){
  if(imc < 18.5) return "Bajo peso";
  if(imc < 25) return "Saludable";
  if(imc < 30) return "Sobrepeso";
  return "Obesidad";
}
// Mifflin-St Jeor + actividad moderada (entrena 4-5 días) - 15% déficit
function calcMetaCalorica(peso, estatura, edad, sexo){
  let bmr;
  if(sexo === "M"){
    bmr = (10*peso) + (6.25*estatura) - (5*edad) + 5;
  }else{
    bmr = (10*peso) + (6.25*estatura) - (5*edad) - 161;
  }
  const tdee = bmr * 1.55; // actividad moderada-alta por entrenamiento 4-5x/sem
  const meta = tdee * 0.82; // déficit ~18%, moderado y no agresivo
  return Math.round(meta);
}

const profileForm = document.getElementById("profileForm");
const profileHint = document.getElementById("profileHint");

profileForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const edad = parseFloat(document.getElementById("fEdad").value);
  const sexo = document.getElementById("fSexo").value;
  const estatura = parseFloat(document.getElementById("fEstatura").value);
  const peso = parseFloat(document.getElementById("fPeso").value);
  const cintura = parseFloat(document.getElementById("fCintura").value) || null;
  const cadera = parseFloat(document.getElementById("fCadera").value) || null;

  if(!edad || !sexo || !estatura || !peso){
    profileHint.textContent = "Completa al menos edad, sexo, estatura y peso.";
    return;
  }

  const entry = {
    fecha: new Date().toISOString().slice(0,10),
    edad, sexo, estatura, peso, cintura, cadera,
    imc: Number(calcIMC(peso, estatura).toFixed(1))
  };

  const data = loadMediciones();
  data.push(entry);
  saveMediciones(data);

  const metaKcal = calcMetaCalorica(peso, estatura, edad, sexo);
  profileHint.textContent = `Guardado ✓ — IMC ${entry.imc} (${imcCategoria(entry.imc)}). Meta calórica diaria orientativa: ~${metaKcal} kcal (déficit moderado, sin contar entrenamientos intensos extra).`;

  document.getElementById("fPeso").value = "";
  document.getElementById("fCintura").value = "";
  document.getElementById("fCadera").value = "";

  renderProfileSummary();
});

function renderProfileSummary(){
  const data = loadMediciones();
  const historyList = document.getElementById("historyList");
  const dialIMC = document.getElementById("dialIMC");
  const dialProgress = document.getElementById("dialProgress");
  const dialProgressInner = document.getElementById("dialProgressInner");

  historyList.innerHTML = "";
  if(data.length === 0){
    historyList.innerHTML = `<p class="form-hint">Aún no hay mediciones guardadas. Captura tu primera medición arriba.</p>`;
    dialIMC.textContent = "--";
    dialProgress.style.strokeDashoffset = 364;
    dialProgressInner.style.strokeDashoffset = 276;
    renderWeightChart([]);
    return;
  }

  // últimas primero
  [...data].reverse().forEach(d=>{
    const row = document.createElement("div");
    row.className = "history-row";
    row.innerHTML = `<span>${d.fecha}</span><span>${d.peso} kg · IMC ${d.imc}</span>`;
    historyList.appendChild(row);
  });

  const last = data[data.length-1];
  dialIMC.textContent = last.imc;

  // Progreso visual: % de avance hacia rango saludable (25) desde el primer registro
  const first = data[0];
  let pesoProgressPct = 0;
  if(data.length > 1 && first.peso !== last.peso){
    const totalRange = Math.abs(first.peso - (first.estatura/100*first.estatura/100*24.9));
    const moved = first.peso - last.peso;
    pesoProgressPct = totalRange > 0 ? Math.max(0, Math.min(1, moved/totalRange)) : 0;
  }
  const circumference = 364;
  dialProgress.style.strokeDasharray = circumference;
  dialProgress.style.strokeDashoffset = circumference - (circumference * pesoProgressPct);

  // Adherencia: % de semanas del mes con al menos un registro (de 4)
  const weeksWithData = new Set(data.map(d=> Math.floor((new Date(d.fecha) - new Date(data[0].fecha)) / (7*24*3600*1000)))).size;
  const adherencePct = Math.min(1, weeksWithData/4);
  const circInner = 276;
  dialProgressInner.style.strokeDasharray = circInner;
  dialProgressInner.style.strokeDashoffset = circInner - (circInner * adherencePct);

  renderWeightChart(data);
}

function renderWeightChart(data){
  const container = document.getElementById("weightChart");
  if(data.length < 2){
    container.innerHTML = `<p class="form-hint">Se necesitan al menos 2 mediciones para graficar tendencia.</p>`;
    return;
  }
  const w = 600, h = 140, pad = 20;
  const pesos = data.map(d=>d.peso);
  const min = Math.min(...pesos), max = Math.max(...pesos);
  const range = (max - min) || 1;

  const points = data.map((d,i)=>{
    const x = pad + (i/(data.length-1)) * (w - pad*2);
    const y = h - pad - ((d.peso - min)/range) * (h - pad*2);
    return `${x},${y}`;
  });

  const path = "M " + points.join(" L ");
  const dots = data.map((d,i)=>{
    const [x,y] = points[i].split(",");
    return `<circle cx="${x}" cy="${y}" r="4" fill="var(--clay)"></circle>`;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <path d="${path}" fill="none" stroke="var(--sage-deep)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
}

/* ---------------- ALIMENTACIÓN ---------------- */
let currentNutritionDay = 0;

function renderDayTabsNutricion(){
  const wrap = document.getElementById("dayTabsNutricion");
  wrap.innerHTML = "";
  DAY_NAMES.forEach((name,i)=>{
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i===currentNutritionDay ? " tab-active" : "");
    btn.textContent = name.slice(0,3);
    btn.addEventListener("click", ()=>{
      currentNutritionDay = i;
      renderDayTabsNutricion();
      renderMealPlan();
    });
    wrap.appendChild(btn);
  });
}

function renderMealPlan(){
  const container = document.getElementById("mealPlanContainer");
  const day = MEAL_PLAN[currentNutritionDay];
  const order = [
    ["desayuno","Desayuno"],
    ["colacion1","Colación"],
    ["comida","Comida"],
    ["colacion2","Colación"],
    ["cena","Cena"]
  ];
  container.innerHTML = order.map(([key,label])=>{
    const m = day[key];
    return `
      <div class="meal-card">
        <div class="meal-card-head">
          <span class="meal-type">${label}</span>
          <span class="meal-kcal">${m.kcal}</span>
        </div>
        <p class="meal-name">${m.name}</p>
        <p class="meal-detail">${m.detail}</p>
      </div>`;
  }).join("");
}

function renderPantry(){
  const container = document.getElementById("pantryList");
  container.innerHTML = PANTRY.map(p=>`
    <div class="pantry-cat">
      <strong>${p.cat}</strong>
      <ul>${p.items.map(i=>`<li>${i}</li>`).join("")}</ul>
    </div>
  `).join("");
}

/* ---------------- RUTINAS ---------------- */
let currentTrainingWeek = 0;

function renderWeekTabsRutina(){
  const wrap = document.getElementById("weekTabsRutina");
  wrap.innerHTML = "";
  TRAINING_WEEKS.forEach((w,i)=>{
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i===currentTrainingWeek ? " tab-active" : "");
    btn.textContent = `Semana ${i+1}`;
    btn.addEventListener("click", ()=>{
      currentTrainingWeek = i;
      renderWeekTabsRutina();
      renderTrainingPlan();
    });
    wrap.appendChild(btn);
  });
}

function renderTrainingPlan(){
  const container = document.getElementById("trainingPlanContainer");
  const week = TRAINING_WEEKS[currentTrainingWeek];
  let html = `<div class="callout">${week.note}</div>`;
  html += week.days.map(d=>`
    <div class="day-card ${d.rest ? "rest":""}">
      <div class="day-card-head">
        <h3>${d.day} · ${d.title}</h3>
        <span class="day-tag">${d.tag}</span>
      </div>
      ${d.exercises.map(ex=>`
        <div class="exercise-row">
          <span class="exercise-name">${ex.name}</span>
          <span class="exercise-meta">${ex.meta}</span>
        </div>`).join("") || `<p class="meal-detail">Descanso total: prioriza sueño e hidratación.</p>`}
    </div>
  `).join("");
  container.innerHTML = html;
}

function renderStress(){
  const container = document.getElementById("stressTechniques");
  container.innerHTML = STRESS_TECHNIQUES.map(s=>`
    <div class="mini-card">
      <span class="mini-tag">${s.tag}</span>
      <h4>${s.name}</h4>
      <p>${s.detail}</p>
    </div>
  `).join("");
}

/* ---------------- CORTISOL / HÍGADO ---------------- */
function renderPillars(){
  document.getElementById("pillarsList").innerHTML = PILLARS.map(p=>`
    <div class="mini-card"><h4>${p.name}</h4><p>${p.detail}</p></div>
  `).join("");
}
function renderSupplements(){
  document.getElementById("supplementsList").innerHTML = SUPPLEMENTS.map(s=>`
    <div class="mini-card">
      <span class="mini-tag warn">Consultar con tu médico</span>
      <h4>${s.name}</h4><p>${s.detail}</p>
    </div>
  `).join("");
}
function renderSleep(){
  document.getElementById("sleepList").innerHTML = SLEEP_TIPS.map(s=>`
    <div class="mini-card"><h4>${s.name}</h4><p>${s.detail}</p></div>
  `).join("");
}

function updateTopbarWeek(){
  document.getElementById("topbarWeek").textContent = `Semana ${currentTrainingWeek+1} de 4`;
}

/* ---------------- INIT ---------------- */
function init(){
  renderProfileSummary();

  renderDayTabsNutricion();
  renderMealPlan();
  renderPantry();

  renderWeekTabsRutina();
  renderTrainingPlan();
  renderStress();

  renderPillars();
  renderSupplements();
  renderSleep();

  updateTopbarWeek();
}

document.addEventListener("DOMContentLoaded", init);
