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

// Escapa texto capturado por el usuario antes de insertarlo como HTML (recetas, ejercicios, etc.)
function escapeHTML(str){
  if(str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

const WHATSAPP_ICON_SVG = `<svg viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.6-1.5-.8-1.9-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.3.2-.6.2-1.2.1-1.3z"/><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2z"/></svg>`;

function shareOnWhatsApp(text){
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

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
    let arr = raw ? JSON.parse(raw) : [];
    let changed = false;
    arr = arr.map(entry=>{
      if(!entry.id){ entry.id = "med_"+Date.now()+"_"+Math.random().toString(36).slice(2,7); changed = true; }
      return entry;
    });
    if(changed) saveMediciones(arr);
    return arr;
  }catch(e){ return []; }
}
function saveMediciones(arr){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  catch(e){ console.warn("No se pudo guardar en este navegador:", e); }
}
function deleteMedicion(id){
  const arr = loadMediciones().filter(m=>m.id!==id);
  saveMediciones(arr);
  renderProfileSummary();
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
    id: "med_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),
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
    renderBodySilhouette();
    return;
  }

  // últimas primero
  [...data].reverse().forEach(d=>{
    const row = document.createElement("div");
    row.className = "history-row";
    row.innerHTML = `<span>${d.fecha}</span><span>${d.peso} kg · IMC ${d.imc}</span><button type="button" class="history-delete-btn" data-id="${d.id}" title="Eliminar registro">✕</button>`;
    historyList.appendChild(row);
  });
  historyList.querySelectorAll(".history-delete-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteMedicion(btn.dataset.id));
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
  renderBodySilhouette();
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

/* ---------------- Silueta de referencia visual según IMC ---------------- */
// Figura abstracta y estilizada (no fotográfica) que varía de ancho según el
// rango de IMC. Vive junto a "Progreso de peso" / "Adherencia semanal" en el
// dial, por eso usa un tono claro (var(--sand)) para verse sobre el fondo oscuro.
const IMC_BODY_WIDTH = { "Bajo peso": 0.72, "Saludable": 0.9, "Sobrepeso": 1.15, "Obesidad": 1.4 };

function bodySilhouetteSVG(category){
  const w = IMC_BODY_WIDTH[category] || 1;
  const torsoRx = Math.round(15 * w);
  const legW = Math.round(6 * w);
  return `
    <svg viewBox="0 0 80 140" aria-hidden="true">
      <circle cx="40" cy="17" r="13" fill="var(--sand)"/>
      <ellipse cx="40" cy="66" rx="${torsoRx}" ry="40" fill="var(--sand)"/>
      <rect x="${40-legW}" y="102" width="${legW*2}" height="30" rx="7" fill="var(--sand)"/>
    </svg>`;
}

function renderBodySilhouette(){
  const container = document.getElementById("bodySilhouette");
  if(!container) return;
  const data = loadMediciones();
  if(data.length === 0){
    container.innerHTML = `<span class="legend-silhouette-icon">${bodySilhouetteSVG("Saludable")}</span> Referencia: sin datos aún`;
    return;
  }
  const last = data[data.length-1];
  const cat = imcCategoria(last.imc);
  container.innerHTML = `<span class="legend-silhouette-icon">${bodySilhouetteSVG(cat)}</span> Referencia: ${cat}`;
}

/* ---------------- Saludo personalizado por sección ---------------- */
function renderGreetings(){
  const set = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };
  set("greetPerfil", `Hola ${USER_NAME} 👋 — este es tu perfil y seguimiento de peso.`);
  set("greetAlimentacion", `Hola ${USER_NAME}, esta es tu dieta de la semana.`);
  set("greetRutinas", `Hola ${USER_NAME}, esta es tu rutina de entrenamiento.`);
  set("greetManejo", `Hola ${USER_NAME}, este es tu manejo de cortisol e hígado graso.`);
  set("greetConfiguracion", `Hola ${USER_NAME}, aquí administras el contenido de tu plan.`);
}

/* ---------------- Selector de mes/ciclo ---------------- */
function pickDefaultMonthKey(){
  const keys = Object.keys(PLANS).sort();
  const ym = new Date().toISOString().slice(0,7); // "YYYY-MM"
  return PLANS[ym] ? ym : keys[0];
}
let currentMonthKey = pickDefaultMonthKey();

function renderMonthSelector(){
  const select = document.getElementById("monthSelect");
  const keys = Object.keys(PLANS).sort();
  select.innerHTML = keys.map(k => `<option value="${k}" ${k===currentMonthKey?"selected":""}>${PLANS[k].label}</option>`).join("");
  select.addEventListener("change", ()=>{
    currentMonthKey = select.value;
    currentNutritionDay = 0;
    currentTrainingWeek = 0;
    renderDayTabsNutricion();
    renderMealPlan();
    renderWeekTabsRutina();
    renderTrainingPlan();
    updateTopbarWeek();
  });
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

const MEAL_TYPE_LABELS = { desayuno:"Desayuno", colacion1:"Colación (mañana)", comida:"Comida", colacion2:"Colación (tarde)", cena:"Cena" };
const MEAL_ORDER = [
  ["desayuno","Desayuno"],
  ["colacion1","Colación"],
  ["comida","Comida"],
  ["colacion2","Colación"],
  ["cena","Cena"]
];

/* ---------------- Recetas personalizadas: storage ---------------- */
const STORAGE_KEY_CUSTOM_MEALS = "equilibrio_custom_meals_v1";
function loadCustomMeals(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_MEALS)) || []; }catch(e){ return []; }
}
function saveCustomMeals(arr){
  try{ localStorage.setItem(STORAGE_KEY_CUSTOM_MEALS, JSON.stringify(arr)); }catch(e){ console.warn(e); }
}
function addCustomMeal(meal){
  const arr = loadCustomMeals();
  meal.id = "meal_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
  arr.push(meal);
  saveCustomMeals(arr);
  return meal;
}
function deleteCustomMeal(id){
  saveCustomMeals(loadCustomMeals().filter(m=>m.id!==id));
  renderMealPlan();
  renderCustomMealsList();
}

function renderMealPlan(){
  const container = document.getElementById("mealPlanContainer");
  const day = PLANS[currentMonthKey].meals[currentNutritionDay];
  const customMeals = loadCustomMeals();
  const registry = [];
  let html = "";

  MEAL_ORDER.forEach(([key,label])=>{
    const base = day[key];
    if(base){
      registry.push(base);
      html += mealCardHTML(label, base, false, null, registry.length-1);
    }
    customMeals
      .filter(m => m.month===currentMonthKey && m.day===currentNutritionDay && m.type===key)
      .forEach(m=>{
        registry.push(m);
        html += mealCardHTML(label, m, true, m.id, registry.length-1);
      });
  });

  container.innerHTML = html;

  container.querySelectorAll(".meal-share-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const meal = registry[Number(btn.dataset.idx)];
      let text = `*${meal.name}*\n\n${meal.detail}`;
      if(meal.kcal) text += `\n\n${meal.kcal}`;
      shareOnWhatsApp(text);
    });
  });
  container.querySelectorAll(".meal-delete-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteCustomMeal(btn.dataset.id));
  });
}

function mealCardHTML(label, meal, isCustom, id, idx){
  return `
    <div class="meal-card ${isCustom?"is-custom":""}">
      <div class="meal-card-head">
        <span class="meal-type">${label}${isCustom?'<span class="meal-type-tag">Personalizada</span>':''}</span>
        <span class="meal-kcal">${escapeHTML(meal.kcal||"")}</span>
      </div>
      <p class="meal-name">${escapeHTML(meal.name)}</p>
      <p class="meal-detail">${escapeHTML(meal.detail)}</p>
      <div class="meal-card-actions">
        ${isCustom?`<button type="button" class="custom-item-remove meal-delete-btn" data-id="${id}">Eliminar</button>`:""}
        <button type="button" class="share-btn meal-share-btn" data-idx="${idx}">${WHATSAPP_ICON_SVG}WhatsApp</button>
      </div>
    </div>`;
}

function renderCustomMealsList(){
  const container = document.getElementById("customMealsList");
  if(!container) return;
  const arr = loadCustomMeals();
  if(arr.length === 0){ container.innerHTML = ""; return; }
  container.innerHTML = `<p class="form-hint form-hint-static">Recetas agregadas (${arr.length}):</p>` +
    arr.map(m=>`
      <div class="custom-item-row">
        <span>${escapeHTML(PLANS[m.month] ? PLANS[m.month].label : m.month)} · ${escapeHTML(DAY_NAMES[m.day])} · ${escapeHTML(MEAL_TYPE_LABELS[m.type]||m.type)} — <strong>${escapeHTML(m.name)}</strong></span>
        <button type="button" class="custom-item-remove" data-id="${m.id}">Eliminar</button>
      </div>`).join("");
  container.querySelectorAll(".custom-item-remove").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteCustomMeal(btn.dataset.id));
  });
}

/* ---------------- Formulario "Agregar receta nueva" ---------------- */
function populateMealFormSelects(){
  const monthSel = document.getElementById("mfMonth");
  const daySel = document.getElementById("mfDay");
  if(!monthSel || !daySel) return;
  monthSel.innerHTML = Object.keys(PLANS).sort().map(k=>`<option value="${k}">${escapeHTML(PLANS[k].label)}</option>`).join("");
  monthSel.value = currentMonthKey;
  daySel.innerHTML = DAY_NAMES.map((n,i)=>`<option value="${i}">${n}</option>`).join("");
}

function setupMealForm(){
  wireConfigCategory({
    formId: "mealForm",
    jsonInputId: "mealJsonInput",
    jsonImportBtnId: "mealJsonImportBtn",
    jsonHintId: "mealJsonHint",
    formHintId: "mealFormHint",
    buildFromForm: ()=>{
      const month = document.getElementById("mfMonth").value;
      const day = Number(document.getElementById("mfDay").value);
      const type = document.getElementById("mfType").value;
      const name = document.getElementById("mfName").value.trim();
      const detail = document.getElementById("mfDetail").value.trim();
      const kcal = document.getElementById("mfKcal").value.trim();
      if(!name || !detail) return { ok:false, error:"Completa al menos nombre y receta." };
      return { ok:true, item:{ month, day, type, name, detail, kcal } };
    },
    normalizeJsonItem: (it)=>{
      if(!it.name || !it.detail || !it.type || (it.day===undefined || it.day===null || it.day==="")){
        return { ok:false, error:"faltan campos (name, detail, type, day)" };
      }
      const dayIndex = typeof it.day === "number" ? it.day : DAY_NAMES.findIndex(d=>d.toLowerCase()===String(it.day).toLowerCase());
      if(dayIndex === -1) return { ok:false, error:`día "${it.day}" no reconocido` };
      const month = it.month && PLANS[it.month] ? it.month : currentMonthKey;
      return { ok:true, item:{ month, day:dayIndex, type:it.type, name:it.name, detail:it.detail, kcal: it.kcal||"" } };
    },
    addFn: addCustomMeal,
    afterReset: populateMealFormSelects,
    afterChangeFn: ()=>{ renderMealPlan(); renderCustomMealsList(); }
  });
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
  const weeks = PLANS[currentMonthKey].training;
  weeks.forEach((w,i)=>{
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

/* ---------------- Estimador de tiempo por ejercicio/día ---------------- */
// Heurística aproximada a partir del texto libre en "meta" (ej. "3x12", "4x2 min", "30 seg").
function estimateExerciseMinutes(meta){
  if(!meta) return 5;
  const m = String(meta).toLowerCase();

  const minMatch = m.match(/(\d+)(?:-(\d+))?\s*min/);
  if(minMatch){
    const a = parseFloat(minMatch[1]);
    const b = minMatch[2] ? parseFloat(minMatch[2]) : a;
    const avgMin = (a+b)/2;
    const setsMatch = m.match(/^(\d+)\s*[x×]/);
    return setsMatch ? Math.round(parseFloat(setsMatch[1]) * avgMin) : Math.round(avgMin);
  }
  const segMatch = m.match(/(\d+)\s*seg/);
  if(segMatch){
    const sec = parseFloat(segMatch[1]);
    const setsMatch = m.match(/^(\d+)\s*[x×]/);
    const sets = setsMatch ? parseFloat(setsMatch[1]) : 1;
    const totalSec = sets * (sec + 45); // + descanso aproximado entre series
    return Math.max(1, Math.round(totalSec/60));
  }
  const setsRepsMatch = m.match(/(\d+)\s*[x×]\s*(\d+)/);
  if(setsRepsMatch){
    const sets = parseFloat(setsRepsMatch[1]);
    const totalSec = sets*45 + Math.max(0, sets-1)*60; // ~45s trabajo + 60s descanso por serie
    return Math.max(1, Math.round(totalSec/60));
  }
  return 5; // valor genérico si no se pudo interpretar el texto
}
function estimateDayMinutes(exercises){
  return (exercises||[]).reduce((sum,ex)=> sum + estimateExerciseMinutes(ex.meta), 0);
}

/* ---------------- Entrenamientos personalizados: storage ---------------- */
const STORAGE_KEY_CUSTOM_TRAINING = "equilibrio_custom_training_v1";
function loadCustomTraining(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_TRAINING)) || []; }catch(e){ return []; }
}
function saveCustomTraining(arr){
  try{ localStorage.setItem(STORAGE_KEY_CUSTOM_TRAINING, JSON.stringify(arr)); }catch(e){ console.warn(e); }
}
function addCustomTraining(t){
  const arr = loadCustomTraining();
  t.id = "train_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
  arr.push(t);
  saveCustomTraining(arr);
  return t;
}
function deleteCustomTraining(id){
  saveCustomTraining(loadCustomTraining().filter(t=>t.id!==id));
  renderTrainingPlan();
  renderCustomTrainingList();
}

/* ---------------- Ejercicios extra agregados a un día ya existente ---------------- */
const STORAGE_KEY_EXTRA_EX = "equilibrio_extra_exercises_v1";
function loadExtraExercises(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_EXTRA_EX)) || []; }catch(e){ return []; }
}
function saveExtraExercises(arr){
  try{ localStorage.setItem(STORAGE_KEY_EXTRA_EX, JSON.stringify(arr)); }catch(e){ console.warn(e); }
}
function addExtraExercise(ex){
  const arr = loadExtraExercises();
  ex.id = "exex_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
  arr.push(ex);
  saveExtraExercises(arr);
}
function deleteExtraExercise(id){
  saveExtraExercises(loadExtraExercises().filter(e=>e.id!==id));
}

function renderTrainingPlan(){
  const container = document.getElementById("trainingPlanContainer");
  const week = PLANS[currentMonthKey].training[currentTrainingWeek];
  const customDays = loadCustomTraining().filter(t=>t.month===currentMonthKey && t.week===currentTrainingWeek);
  const registry = [];
  let html = `<div class="callout">${week.note}</div>`;

  week.days.forEach(d=>{ registry.push(d); html += dayCardHTML(d, false, registry.length-1); });
  customDays.forEach(d=>{ registry.push(d); html += dayCardHTML(d, true, registry.length-1); });

  container.innerHTML = html;

  container.querySelectorAll(".training-share-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const d = registry[Number(btn.dataset.idx)];
      const extraEx = loadExtraExercises().filter(e=> e.month===currentMonthKey && e.week===currentTrainingWeek && e.day===d.day);
      const allEx = (d.exercises||[]).concat(extraEx);
      let text = `*${d.title}*\n${d.day} — ${d.tag}\n\n`;
      text += allEx.length ? allEx.map(ex=>`• ${ex.name} — ${ex.meta}`).join("\n") : "Descanso total.";
      shareOnWhatsApp(text);
    });
  });
  container.querySelectorAll(".training-delete-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteCustomTraining(btn.dataset.id));
  });
  container.querySelectorAll(".add-exercise-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const target = document.getElementById(btn.dataset.target);
      if(target) target.hidden = !target.hidden;
    });
  });
  container.querySelectorAll(".add-ex-save").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const wrap = btn.closest(".add-exercise-inline");
      const dayName = wrap.dataset.day;
      const nameInput = wrap.querySelector(".add-ex-name");
      const metaInput = wrap.querySelector(".add-ex-meta");
      const name = nameInput.value.trim();
      const meta = metaInput.value.trim();
      if(!name){ nameInput.focus(); return; }
      addExtraExercise({ month: currentMonthKey, week: currentTrainingWeek, day: dayName, name, meta });
      renderTrainingPlan();
    });
  });
  container.querySelectorAll(".exercise-extra-remove").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      deleteExtraExercise(btn.dataset.id);
      renderTrainingPlan();
    });
  });
}

function dayCardHTML(d, isCustom, idx){
  const extraEx = loadExtraExercises().filter(e=> e.month===currentMonthKey && e.week===currentTrainingWeek && e.day===d.day);
  const baseEx = (d.exercises||[]).map(ex=>({ ...ex, extra:false }));
  const allEx = baseEx.concat(extraEx.map(ex=>({ ...ex, extra:true })));
  const totalMin = estimateDayMinutes(allEx);
  const dayKey = `${currentMonthKey}_w${currentTrainingWeek}_${idx}`;

  return `
    <div class="day-card ${d.rest?"rest":""} ${isCustom?"is-custom":""}">
      <div class="day-card-head">
        <h3>${escapeHTML(d.day)} · ${escapeHTML(d.title)}${isCustom?' <span class="meal-type-tag">Personalizada</span>':''}</h3>
        <span class="day-tag">${escapeHTML(d.tag)}</span>
      </div>
      ${!d.rest && totalMin>0 ? `<div class="day-time-badge">⏱ ~${totalMin} min estimados en total</div>` : ""}
      ${allEx.length ? allEx.map(ex=>`
        <div class="exercise-row">
          <span class="exercise-name">${escapeHTML(ex.name)}</span>
          <span class="exercise-right">
            <span class="exercise-meta">${escapeHTML(ex.meta)}</span>
            ${ex.extra ? `<button type="button" class="exercise-extra-remove" data-id="${ex.id}" title="Quitar">×</button>` : ""}
          </span>
        </div>`).join("") : `<p class="meal-detail">Descanso total: prioriza sueño e hidratación.</p>`}

      <div class="day-card-add">
        <button type="button" class="add-exercise-btn" data-target="addEx-${dayKey}">+ Agregar actividad a este día</button>
        <div class="add-exercise-inline" id="addEx-${dayKey}" data-day="${escapeHTML(d.day)}" hidden>
          <input type="text" class="add-ex-name" placeholder="Tipo de ejercicio">
          <input type="text" class="add-ex-meta" placeholder="Reps (3x12)">
          <button type="button" class="btn btn-primary btn-small add-ex-save">Agregar</button>
        </div>
      </div>

      <div class="day-card-share">
        ${isCustom?`<button type="button" class="custom-item-remove training-delete-btn" data-id="${d.id}">Eliminar sesión</button>`:""}
        <button type="button" class="share-btn training-share-btn" data-idx="${idx}">${WHATSAPP_ICON_SVG}WhatsApp</button>
      </div>
    </div>`;
}

function renderCustomTrainingList(){
  const container = document.getElementById("customTrainingList");
  if(!container) return;
  const arr = loadCustomTraining();
  if(arr.length === 0){ container.innerHTML = ""; return; }
  container.innerHTML = `<p class="form-hint form-hint-static">Entrenamientos agregados (${arr.length}):</p>` +
    arr.map(t=>`
      <div class="custom-item-row">
        <span>${escapeHTML(PLANS[t.month] ? PLANS[t.month].label : t.month)} · Semana ${t.week+1} · ${escapeHTML(t.day)} — <strong>${escapeHTML(t.title)}</strong></span>
        <button type="button" class="custom-item-remove" data-id="${t.id}">Eliminar</button>
      </div>`).join("");
  container.querySelectorAll(".custom-item-remove").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteCustomTraining(btn.dataset.id));
  });
}

/* ---------------- Formulario "Agregar entrenamiento nuevo" ---------------- */
function populateTrainingFormSelects(){
  const monthSel = document.getElementById("tfMonth");
  const daySel = document.getElementById("tfDay");
  if(!monthSel || !daySel) return;
  monthSel.innerHTML = Object.keys(PLANS).sort().map(k=>`<option value="${k}">${escapeHTML(PLANS[k].label)}</option>`).join("");
  monthSel.value = currentMonthKey;
  daySel.innerHTML = DAY_NAMES.map(n=>`<option value="${n}">${n}</option>`).join("");
}

function addExerciseFormRow(name="", meta=""){
  const wrap = document.getElementById("exerciseFormList");
  if(!wrap) return;
  const row = document.createElement("div");
  row.className = "exercise-form-row";
  row.innerHTML = `
    <input type="text" class="ex-name" placeholder="Ejercicio (ej. Sentadilla goblet)" value="${escapeHTML(name)}">
    <input type="text" class="ex-meta" placeholder="3x12" value="${escapeHTML(meta)}">
    <button type="button" class="exercise-remove-btn" title="Quitar">×</button>`;
  row.querySelector(".exercise-remove-btn").addEventListener("click", ()=> row.remove());
  wrap.appendChild(row);
}

function setupTrainingForm(){
  const addBtn = document.getElementById("addExerciseRowBtn");
  if(addBtn) addBtn.addEventListener("click", ()=> addExerciseFormRow());

  wireConfigCategory({
    formId: "trainingForm",
    jsonInputId: "trainingJsonInput",
    jsonImportBtnId: "trainingJsonImportBtn",
    jsonHintId: "trainingJsonHint",
    formHintId: "trainingFormHint",
    buildFromForm: ()=>{
      const month = document.getElementById("tfMonth").value;
      const week = Number(document.getElementById("tfWeek").value);
      const day = document.getElementById("tfDay").value;
      const title = document.getElementById("tfTitle").value.trim();
      const tag = document.getElementById("tfTag").value;
      const exercises = Array.from(document.querySelectorAll("#exerciseFormList .exercise-form-row")).map(row=>({
        name: row.querySelector(".ex-name").value.trim(),
        meta: row.querySelector(".ex-meta").value.trim()
      })).filter(ex=>ex.name);
      if(!title || exercises.length===0) return { ok:false, error:"Agrega un título y al menos un ejercicio con nombre." };
      return { ok:true, item:{ month, week, day, title, tag, exercises } };
    },
    normalizeJsonItem: (it)=>{
      if(!it.title || !it.day || !Array.isArray(it.exercises) || it.exercises.length===0){
        return { ok:false, error:"faltan campos (title, day, exercises[])" };
      }
      const month = it.month && PLANS[it.month] ? it.month : currentMonthKey;
      const week = (typeof it.week === "number" && it.week>=0 && it.week<=3) ? it.week : 0;
      return { ok:true, item:{ month, week, day: it.day, title: it.title, tag: it.tag || "Funcional", exercises: it.exercises.map(ex=>({ name: ex.name||"", meta: ex.meta||"" })) } };
    },
    addFn: addCustomTraining,
    afterReset: ()=>{
      document.getElementById("exerciseFormList").innerHTML = "";
      addExerciseFormRow(); addExerciseFormRow();
      populateTrainingFormSelects();
    },
    afterChangeFn: ()=>{ renderTrainingPlan(); renderCustomTrainingList(); }
  });
}

function renderStress(){
  const container = document.getElementById("stressTechniques");
  const custom = loadCustomStress();
  const all = STRESS_TECHNIQUES.concat(custom.map(c=>({ ...c, custom:true })));
  container.innerHTML = all.map(s=>`
    <div class="mini-card ${s.custom?"is-custom":""}">
      <span class="mini-tag">${escapeHTML(s.tag)}</span>
      <h4>${escapeHTML(s.name)}${s.custom?' <span class="meal-type-tag">Personalizada</span>':''}</h4>
      <p>${escapeHTML(s.detail)}</p>
    </div>
  `).join("");
}

/* ---------------- CORTISOL / HÍGADO — checklist diario de pilares ---------------- */
const STORAGE_KEY_CHECKLIST = "equilibrio_checklist_v1";
const STORAGE_KEY_CHECKLIST_START = "equilibrio_checklist_start_v1";

function loadChecklistData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY_CHECKLIST);
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function saveChecklistData(obj){
  try{ localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(obj)); }
  catch(e){ console.warn("No se pudo guardar el checklist:", e); }
}
function todayISO(){ return new Date().toISOString().slice(0,10); }

// Fecha de inicio del seguimiento de 4 semanas: el lunes de la semana en que se usa por primera vez.
function getChecklistStartDate(){
  let start = localStorage.getItem(STORAGE_KEY_CHECKLIST_START);
  if(!start){
    const d = new Date();
    const day = d.getDay(); // 0=domingo .. 6=sábado
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diffToMonday);
    start = d.toISOString().slice(0,10);
    localStorage.setItem(STORAGE_KEY_CHECKLIST_START, start);
  }
  return start;
}

let selectedChecklistDate = todayISO();

function renderPillarsChecklist(){
  const container = document.getElementById("pillarsChecklist");
  const data = loadChecklistData();
  const dayData = data[selectedChecklistDate] || {};

  container.innerHTML = PILLARS.map(p=>{
    const checked = !!dayData[p.id];
    return `
      <div class="pillar-item ${checked ? "checked":""}" data-pillar="${p.id}" role="checkbox" aria-checked="${checked}" tabindex="0">
        <span class="pillar-icon"><svg viewBox="0 0 24 24">${p.icon}</svg></span>
        <span class="pillar-body">
          <span class="pillar-name">${p.name}</span>
          <p class="pillar-detail">${p.detail}</p>
        </span>
        <span class="pillar-check"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg></span>
      </div>`;
  }).join("");

  container.querySelectorAll(".pillar-item").forEach(el=>{
    const toggle = ()=>{
      const id = el.dataset.pillar;
      const data2 = loadChecklistData();
      const dayObj = data2[selectedChecklistDate] || {};
      dayObj[id] = !dayObj[id];
      data2[selectedChecklistDate] = dayObj;
      saveChecklistData(data2);
      renderPillarsChecklist();
      renderChecklistCalendar();
    };
    el.addEventListener("click", toggle);
    el.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); } });
  });

  updateChecklistDayHint();
}

function updateChecklistDayHint(){
  const hint = document.getElementById("checklistDayHint");
  const data = loadChecklistData();
  const dayObj = data[selectedChecklistDate] || {};
  const done = PILLARS.filter(p=>dayObj[p.id]).length;
  const niceDate = new Date(selectedChecklistDate + "T00:00:00").toLocaleDateString("es-MX", { weekday:"long", day:"numeric", month:"long" });
  hint.textContent = `${niceDate} — ${done} de ${PILLARS.length} pilares cumplidos.`;
}

function renderChecklistCalendar(){
  const container = document.getElementById("checklistCalendar");
  const data = loadChecklistData();
  const start = new Date(getChecklistStartDate() + "T00:00:00");
  const today = todayISO();

  let html = "";
  for(let week=0; week<4; week++){
    html += `<div class="checklist-week"><div class="checklist-week-label">Semana ${week+1}</div><div class="checklist-days">`;
    for(let d=0; d<7; d++){
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + week*7 + d);
      const iso = cellDate.toISOString().slice(0,10);
      const dayObj = data[iso] || {};
      const done = PILLARS.filter(p=>dayObj[p.id]).length;
      const ratio = done / PILLARS.length;
      const isToday = iso === today;
      const isSelected = iso === selectedChecklistDate;
      const deg = Math.round(ratio*360);
      html += `
        <button type="button" class="checklist-day ${isToday?"is-today":""} ${isSelected?"is-selected":""}" data-date="${iso}" title="${iso} — ${done}/${PILLARS.length}">
          <span class="checklist-day-ring" style="background: conic-gradient(var(--sage-deep) ${deg}deg, var(--line) ${deg}deg)"></span>
          <span class="checklist-day-num">${cellDate.getDate()}</span>
        </button>`;
    }
    html += `</div></div>`;
  }
  container.innerHTML = html;

  container.querySelectorAll(".checklist-day").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      selectedChecklistDate = btn.dataset.date;
      document.getElementById("checklistDate").value = selectedChecklistDate;
      renderPillarsChecklist();
      renderChecklistCalendar();
    });
  });
}

function initChecklistDatePicker(){
  const input = document.getElementById("checklistDate");
  input.value = selectedChecklistDate;
  input.max = todayISO();
  input.addEventListener("change", ()=>{
    if(!input.value) return;
    selectedChecklistDate = input.value;
    renderPillarsChecklist();
    renderChecklistCalendar();
  });
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

/* =========================================================
   CONFIGURACIÓN — motor genérico de captura
   ---------------------------------------------------------
   Las 3 categorías (Alimentación, Rutinas, Cortisol) comparten
   el mismo motor (wireConfigCategory): cada una solo aporta
   "cómo leer su formulario" y "cómo validar un elemento JSON".
   Agregar una 4ta categoría a futuro = escribir su propio
   panel HTML + llamar wireConfigCategory() una vez — no hay
   que tocar este motor.
   ========================================================= */
const CONFIG_CATEGORY_TABS = [
  { key:"alimentacion", label:"Alimentación", panelId:"configPanelAlimentacion" },
  { key:"rutina", label:"Rutinas", panelId:"configPanelRutinas" },
  { key:"cortisol", label:"Cortisol", panelId:"configPanelCortisol" }
];
let currentConfigCategory = "alimentacion";

function renderConfigTabs(){
  const wrap = document.getElementById("configTabs");
  if(!wrap) return;
  wrap.innerHTML = CONFIG_CATEGORY_TABS.map(c=>
    `<button type="button" class="tab-btn ${c.key===currentConfigCategory?"tab-active":""}" data-cat="${c.key}">${c.label}</button>`
  ).join("");
  wrap.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      currentConfigCategory = btn.dataset.cat;
      renderConfigTabs();
      showActiveConfigPanel();
    });
  });
}

function showActiveConfigPanel(){
  CONFIG_CATEGORY_TABS.forEach(c=>{
    const panel = document.getElementById(c.panelId);
    if(panel) panel.hidden = (c.key !== currentConfigCategory);
  });
}

// Alterna entre "Nuevo" (formulario) y "Cargar JSON" dentro de un panel de Configuración.
function setupConfigModeToggle(panelEl){
  if(!panelEl) return;
  const buttons = panelEl.querySelectorAll(".config-mode-btn");
  const panels = panelEl.querySelectorAll(".config-mode-panel");
  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const mode = btn.dataset.mode;
      buttons.forEach(b=> b.classList.toggle("active", b===btn));
      panels.forEach(p=> p.hidden = (p.dataset.modePanel !== mode));
    });
  });
}

/* Motor compartido de captura (formulario + JSON) para cualquier categoría.
   opts = {
     formId, jsonInputId, jsonImportBtnId, jsonHintId, formHintId,
     buildFromForm: () => ({ok, item, error}),      // lee el formulario
     normalizeJsonItem: (raw) => ({ok, item, error}), // valida 1 elemento del JSON
     addFn: (item) => ...,          // guarda el item ya validado
     afterChangeFn: () => ...,      // vuelve a pintar lo que cambió
     afterReset: () => ...          // (opcional) reconstruye partes dinámicas del form
   } */
function wireConfigCategory(opts){
  const form = document.getElementById(opts.formId);
  if(form){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const hint = document.getElementById(opts.formHintId);
      const result = opts.buildFromForm();
      if(!result.ok){ hint.textContent = result.error; return; }
      opts.addFn(result.item);
      hint.textContent = "Guardado ✓";
      form.reset();
      if(opts.afterReset) opts.afterReset();
      opts.afterChangeFn();
    });
  }
  const jsonBtn = document.getElementById(opts.jsonImportBtnId);
  if(jsonBtn){
    jsonBtn.addEventListener("click", ()=>{
      const hint = document.getElementById(opts.jsonHintId);
      const input = document.getElementById(opts.jsonInputId);
      const raw = input.value.trim();
      if(!raw){ hint.textContent = "Pega un JSON primero."; return; }
      let parsed;
      try{ parsed = JSON.parse(raw); }
      catch(err){ hint.textContent = "JSON inválido: " + err.message; return; }
      const items = Array.isArray(parsed) ? parsed : [parsed];
      let count = 0;
      const errors = [];
      items.forEach((rawItem,i)=>{
        const r = opts.normalizeJsonItem(rawItem);
        if(!r.ok){ errors.push(`#${i+1}: ${r.error}`); return; }
        opts.addFn(r.item);
        count++;
      });
      hint.textContent = `${count} elemento(s) importado(s).` + (errors.length ? ` Con errores: ${errors.join(" | ")}` : "");
      input.value = "";
      opts.afterChangeFn();
    });
  }
}

/* ---------------- Sugerencias de cortisol/estrés personalizadas: storage ---------------- */
const STORAGE_KEY_CUSTOM_STRESS = "equilibrio_custom_stress_v1";
function loadCustomStress(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_STRESS)) || []; }catch(e){ return []; }
}
function saveCustomStress(arr){
  try{ localStorage.setItem(STORAGE_KEY_CUSTOM_STRESS, JSON.stringify(arr)); }catch(e){ console.warn(e); }
}
function addCustomStress(t){
  const arr = loadCustomStress();
  t.id = "stress_"+Date.now()+"_"+Math.random().toString(36).slice(2,7);
  arr.push(t);
  saveCustomStress(arr);
  return t;
}
function deleteCustomStress(id){
  saveCustomStress(loadCustomStress().filter(t=>t.id!==id));
  renderStress();
  renderCustomStressList();
}
function renderCustomStressList(){
  const container = document.getElementById("customStressList");
  if(!container) return;
  const arr = loadCustomStress();
  if(arr.length === 0){ container.innerHTML = ""; return; }
  container.innerHTML = `<p class="form-hint form-hint-static">Sugerencias agregadas (${arr.length}):</p>` +
    arr.map(t=>`
      <div class="custom-item-row">
        <span>${escapeHTML(t.tag)} — <strong>${escapeHTML(t.name)}</strong></span>
        <button type="button" class="custom-item-remove" data-id="${t.id}">Eliminar</button>
      </div>`).join("");
  container.querySelectorAll(".custom-item-remove").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteCustomStress(btn.dataset.id));
  });
}

function setupStressForm(){
  wireConfigCategory({
    formId: "stressForm",
    jsonInputId: "stressJsonInput",
    jsonImportBtnId: "stressJsonImportBtn",
    jsonHintId: "stressJsonHint",
    formHintId: "stressFormHint",
    buildFromForm: ()=>{
      const tag = document.getElementById("sfTag").value;
      const name = document.getElementById("sfName").value.trim();
      const detail = document.getElementById("sfDetail").value.trim();
      if(!name || !detail) return { ok:false, error:"Completa al menos nombre y descripción." };
      return { ok:true, item:{ tag, name, detail } };
    },
    normalizeJsonItem: (it)=>{
      if(!it.name || !it.detail) return { ok:false, error:"faltan campos (name, detail)" };
      return { ok:true, item:{ tag: it.tag || "Diario", name: it.name, detail: it.detail } };
    },
    addFn: addCustomStress,
    afterChangeFn: ()=>{ renderStress(); renderCustomStressList(); }
  });
}

/* ---------------- INIT ---------------- */
function init(){
  renderGreetings();
  renderProfileSummary();

  renderMonthSelector();
  renderDayTabsNutricion();
  renderMealPlan();
  renderPantry();
  populateMealFormSelects();
  setupMealForm();
  renderCustomMealsList();

  renderWeekTabsRutina();
  renderTrainingPlan();
  renderStress();
  populateTrainingFormSelects();
  addExerciseFormRow();
  addExerciseFormRow();
  setupTrainingForm();
  renderCustomTrainingList();

  initChecklistDatePicker();
  renderPillarsChecklist();
  renderChecklistCalendar();
  renderSupplements();
  renderSleep();

  setupStressForm();
  renderCustomStressList();

  renderConfigTabs();
  showActiveConfigPanel();
  ["configPanelAlimentacion","configPanelRutinas","configPanelCortisol"].forEach(id=>{
    setupConfigModeToggle(document.getElementById(id));
  });

  updateTopbarWeek();
}

document.addEventListener("DOMContentLoaded", init);
