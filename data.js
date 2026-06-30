/* =========================================================
   EQUILIBRIO — Datos de contenido
   El menú semanal se repite con la misma estructura las 4
   semanas (mejor adherencia real); el entrenamiento progresa
   en intensidad semana a semana.
   ========================================================= */

const DAY_NAMES = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

/* ---------------- ALIMENTACIÓN: menú semanal base ---------------- */
const MEAL_PLAN = [
  { // Lunes
    desayuno: { name:"Huevos a la mexicana + nopales asados", detail:"2 huevos, jitomate, cebolla, chile serrano al gusto, 1 taza de nopales asados, 1/2 aguacate. 1 tortilla de maíz si gustas.", kcal:"~380 kcal" },
    colacion1:{ name:"Almendras + manzana", detail:"15 almendras naturales + 1 manzana chica.", kcal:"~160 kcal" },
    comida:   { name:"Pescado a la veracruzana + arroz integral", detail:"Tilapia o robalo en salsa de jitomate, aceitunas y alcaparras con poco aceite de oliva, 1/2 taza de arroz integral, ensalada de lechuga y pepino.", kcal:"~480 kcal" },
    colacion2:{ name:"Jícama con limón", detail:"1 taza de jícama picada, limón, chile piquín ligero.", kcal:"~70 kcal" },
    cena:     { name:"Crema de calabaza (sin crema) + claras", detail:"Calabaza italiana asada y licuada con caldo de verduras; 2 claras de huevo revueltas aparte.", kcal:"~320 kcal" }
  },
  { // Martes
    desayuno: { name:"Avena con chía y fresas", detail:"1/2 taza de avena en agua o leche light, 1 cdita de chía, 1 taza de fresas, canela.", kcal:"~340 kcal" },
    colacion1:{ name:"Yogur natural + nuez", detail:"1 yogur griego natural sin azúcar + 5 mitades de nuez.", kcal:"~180 kcal" },
    comida:   { name:"Tinga de pollo light sobre nopal asado", detail:"Pechuga deshebrada con jitomate y chipotle (poco aceite) sobre nopal asado en lugar de base frita, frijoles de la olla.", kcal:"~470 kcal" },
    colacion2:{ name:"Pepino con limón y chile", detail:"1 pepino grande en bastones.", kcal:"~50 kcal" },
    cena:     { name:"Sopa de lentejas con verduras", detail:"Lentejas, zanahoria, apio, cebolla y comino en caldo claro.", kcal:"~330 kcal" }
  },
  { // Miércoles
    desayuno: { name:"Licuado verde + huevo cocido", detail:"Espinaca, piña, apio y agua; 1 huevo cocido aparte.", kcal:"~330 kcal" },
    colacion1:{ name:"Zanahoria baby + hummus", detail:"8 zanahorias baby + 3 cdas de hummus.", kcal:"~150 kcal" },
    comida:   { name:"Pollo en mole verde ligero + ejotes", detail:"Pechuga en salsa verde de tomate, pepita y cilantro (poca grasa añadida), ejotes salteados, 1/2 taza de arroz integral.", kcal:"~490 kcal" },
    colacion2:{ name:"Mandarina o naranja", detail:"1 pieza de fruta de temporada.", kcal:"~60 kcal" },
    cena:     { name:"Tostadas de atún (horneadas, no fritas)", detail:"2 tostadas horneadas, atún en agua con limón y cebolla, lechuga y jitomate picado.", kcal:"~340 kcal" }
  },
  { // Jueves
    desayuno: { name:"Omelette de champiñones y espinaca", detail:"2 huevos, champiñones, espinaca, poco queso panela.", kcal:"~360 kcal" },
    colacion1:{ name:"Toronja + nueces de la India", detail:"1/2 toronja + 10 nueces de la India.", kcal:"~170 kcal" },
    comida:   { name:"Caldo tlalpeño de pollo", detail:"Pechuga deshebrada, garbanzo, zanahoria, chayote, chipotle al gusto; 1/2 aguacate.", kcal:"~440 kcal" },
    colacion2:{ name:"Apio con limón y chile", detail:"3 tallos de apio.", kcal:"~40 kcal" },
    cena:     { name:"Ensalada de nopales con queso panela", detail:"Nopales asados, jitomate, cebolla, cilantro, poco queso panela.", kcal:"~310 kcal" }
  },
  { // Viernes
    desayuno: { name:"Hot cakes de avena y plátano (sin azúcar)", detail:"Avena molida, plátano, huevo, canela; cocidos sin aceite en sartén antiadherente.", kcal:"~370 kcal" },
    colacion1:{ name:"Yogur natural + arándanos", detail:"1 yogur natural + 1/2 taza de arándanos.", kcal:"~160 kcal" },
    comida:   { name:"Filete de pescado a la plancha + ensalada de quinoa", detail:"Pescado blanco a la plancha con limón y hierbas, 1/2 taza de quinoa con jitomate y pepino.", kcal:"~470 kcal" },
    colacion2:{ name:"Pera", detail:"1 pieza mediana.", kcal:"~70 kcal" },
    cena:     { name:"Esquites light en vaso (sin mayonesa/mantequilla)", detail:"Elote desgranado, poco queso, chile y limón; sin mayonesa ni mantequilla.", kcal:"~300 kcal" }
  },
  { // Sábado
    desayuno: { name:"Chilaquiles verdes horneados con pollo", detail:"Tortilla de maíz horneada (no frita) bañada en salsa verde, pechuga deshebrada, poca crema/queso.", kcal:"~420 kcal" },
    colacion1:{ name:"Fruta picada con chía", detail:"Papaya o melón con 1 cdita de chía.", kcal:"~110 kcal" },
    comida:   { name:"Milanesa de pollo al horno + ensalada", detail:"Pechuga empanizada con pan integral molido y horneada, ensalada grande con aceite de oliva y limón.", kcal:"~480 kcal" },
    colacion2:{ name:"Cacahuates naturales (porción medida)", detail:"1 puñado pequeño (~20g), sin sal añadida.", kcal:"~120 kcal" },
    cena:     { name:"Quesadillas de nopal y queso panela (comal, sin aceite)", detail:"Tortilla de maíz, nopal asado, queso panela, cocidas en comal.", kcal:"~330 kcal" }
  },
  { // Domingo
    desayuno: { name:"Huevos al gusto + frijoles + fruta", detail:"2 huevos al gusto, 1/2 taza de frijoles de la olla, fruta de temporada.", kcal:"~380 kcal" },
    colacion1:{ name:"Licuado de plátano y avena", detail:"1/2 plátano, 2 cdas de avena, agua o leche light, hielo.", kcal:"~180 kcal" },
    comida:   { name:"Comida libre guiada: barbacoa o birria (porción moderada)", detail:"Porción controlada (150g de proteína), acompañada de mucha verdura/ensalada y consomé sin exceso de grasa visible. El descanso planeado evita atracones por restricción excesiva.", kcal:"~550 kcal" },
    colacion2:{ name:"Té de jamaica sin azúcar + nueces", detail:"Té de jamaica natural + 5 nueces.", kcal:"~110 kcal" },
    cena:     { name:"Sopa de verduras ligera", detail:"Calabaza, zanahoria, chayote, ejote en caldo claro de pollo desgrasado.", kcal:"~250 kcal" }
  }
];

/* ---------------- Despensa base ---------------- */
const PANTRY = [
  { cat:"Proteína", items:["Pechuga de pollo","Pescado blanco (tilapia/robalo)","Huevo","Atún en agua","Queso panela","Yogur griego natural"] },
  { cat:"Leguminosas", items:["Frijol","Lenteja","Garbanzo","Hummus"] },
  { cat:"Frutas y verduras", items:["Nopal","Calabaza italiana","Espinaca","Jitomate","Jícama","Manzana, pera, fresas, papaya"] },
  { cat:"Grasas saludables", items:["Aguacate","Aceite de oliva","Almendras, nueces, nuez de la India"] },
  { cat:"Granos integrales", items:["Avena","Arroz integral","Quinoa","Tortilla de maíz"] },
  { cat:"Antiinflamatorios / despensa especial", items:["Chía","Canela","Cúrcuma","Jengibre","Limón","Té de jamaica/verde sin azúcar"] }
];

/* ---------------- RUTINAS: 4 semanas progresivas (Action Black) ---------------- */
const TRAINING_WEEKS = [
  { // Semana 1 — adaptación
    label:"Semana 1 · Adaptación",
    note:"Cargas e intensidad bajas-moderadas. El objetivo es aprender técnica y activar el cuerpo sin generar estrés excesivo.",
    days:[
      { day:"Lunes", title:"Fuerza funcional — tren inferior", tag:"Funcional", exercises:[
        {name:"Sentadilla goblet (mancuerna/kettlebell)", meta:"3×12"},
        {name:"Zancadas alternadas", meta:"3×10 c/lado"},
        {name:"Peso muerto rumano con mancuernas", meta:"3×10"},
        {name:"Plancha", meta:"3×30 seg"}
      ]},
      { day:"Martes", title:"Boxeo técnico + core", tag:"Boxeo", exercises:[
        {name:"Sombra + combinaciones básicas (jab-cross)", meta:"4×2 min"},
        {name:"Costal: combos guiados, ritmo moderado", meta:"4×2 min"},
        {name:"Abdomen: crunch + russian twist", meta:"3×15"}
      ]},
      { day:"Miércoles", title:"Cardio ligero + movilidad", tag:"LISS", exercises:[
        {name:"Caminadora o elíptica, ritmo conversacional", meta:"25 min"},
        {name:"Movilidad de cadera y hombro", meta:"10 min"}
      ]},
      { day:"Jueves", title:"Fuerza funcional — tren superior", tag:"Funcional", exercises:[
        {name:"Press de pecho con mancuernas", meta:"3×12"},
        {name:"Remo con banda o polea", meta:"3×12"},
        {name:"Press de hombro sentado", meta:"3×10"},
        {name:"Face pull (banda)", meta:"3×15"}
      ]},
      { day:"Viernes", title:"Boxeo + circuito funcional ligero", tag:"Boxeo", exercises:[
        {name:"Costal: combos + desplazamientos", meta:"4×2 min"},
        {name:"Circuito: sentadilla + plancha + remo banda", meta:"2 vueltas"}
      ]},
      { day:"Sábado", title:"Descanso activo", tag:"Recuperación", rest:true, exercises:[
        {name:"Caminata ligera al aire libre o yoga suave", meta:"20-30 min"}
      ]},
      { day:"Domingo", title:"Descanso completo", tag:"Descanso", rest:true, exercises:[] }
    ]
  },
  { // Semana 2 — construcción
    label:"Semana 2 · Construcción",
    note:"Se añade una serie extra en fuerza y se sube ligeramente el ritmo de boxeo. Sigue evitando el fallo muscular.",
    days:[
      { day:"Lunes", title:"Fuerza funcional — tren inferior", tag:"Funcional", exercises:[
        {name:"Sentadilla goblet", meta:"4×12"},
        {name:"Zancadas con paso largo", meta:"3×12 c/lado"},
        {name:"Peso muerto rumano", meta:"4×10"},
        {name:"Plancha lateral", meta:"3×25 seg c/lado"}
      ]},
      { day:"Martes", title:"Boxeo técnico + core", tag:"Boxeo", exercises:[
        {name:"Sombra + combinaciones (jab-cross-hook)", meta:"5×2 min"},
        {name:"Costal: combos a ritmo medio", meta:"5×2 min"},
        {name:"Abdomen: dead bug + plancha", meta:"3×12"}
      ]},
      { day:"Miércoles", title:"Cardio ligero-moderado + movilidad", tag:"LISS", exercises:[
        {name:"Bicicleta o caminadora con inclinación", meta:"30 min"},
        {name:"Movilidad torácica y de tobillo", meta:"10 min"}
      ]},
      { day:"Jueves", title:"Fuerza funcional — tren superior", tag:"Funcional", exercises:[
        {name:"Press de pecho mancuernas", meta:"4×10"},
        {name:"Remo unilateral con mancuerna", meta:"3×12 c/lado"},
        {name:"Press de hombro", meta:"3×10"},
        {name:"Curl de bíceps + extensión tríceps", meta:"3×12"}
      ]},
      { day:"Viernes", title:"Boxeo + circuito funcional", tag:"Boxeo", exercises:[
        {name:"Costal: combos + esquives", meta:"5×2 min"},
        {name:"Circuito: zancada + press hombro + plancha", meta:"3 vueltas"}
      ]},
      { day:"Sábado", title:"Cardio suave opcional", tag:"Recuperación", rest:true, exercises:[
        {name:"Caminata, alberca suave o yoga", meta:"20-30 min"}
      ]},
      { day:"Domingo", title:"Descanso completo", tag:"Descanso", rest:true, exercises:[] }
    ]
  },
  { // Semana 3 — intensificación controlada
    label:"Semana 3 · Intensificación controlada",
    note:"Se incrementa el volumen ligeramente. Si notas fatiga acumulada, repite la semana 2 en su lugar — no fuerces la progresión.",
    days:[
      { day:"Lunes", title:"Fuerza funcional — tren inferior", tag:"Funcional", exercises:[
        {name:"Sentadilla goblet + pulso", meta:"4×12"},
        {name:"Zancada búlgara (banco)", meta:"3×10 c/lado"},
        {name:"Peso muerto rumano a una pierna", meta:"3×8 c/lado"},
        {name:"Plancha con toque de hombro", meta:"3×30 seg"}
      ]},
      { day:"Martes", title:"Boxeo técnico + core", tag:"Boxeo", exercises:[
        {name:"Sombra + combinaciones avanzadas", meta:"5×3 min"},
        {name:"Costal: combos + movimiento de pies", meta:"5×3 min"},
        {name:"Abdomen: plancha dinámica", meta:"3×15"}
      ]},
      { day:"Miércoles", title:"Cardio moderado + movilidad", tag:"LISS", exercises:[
        {name:"Elíptica o caminadora con cambios suaves de ritmo", meta:"30-35 min"},
        {name:"Movilidad general + respiración", meta:"10 min"}
      ]},
      { day:"Jueves", title:"Fuerza funcional — tren superior", tag:"Funcional", exercises:[
        {name:"Press de pecho inclinado mancuernas", meta:"4×10"},
        {name:"Remo en polea baja", meta:"4×12"},
        {name:"Press arnold", meta:"3×10"},
        {name:"Face pull + curl martillo", meta:"3×12"}
      ]},
      { day:"Viernes", title:"Boxeo + circuito funcional", tag:"Boxeo", exercises:[
        {name:"Costal: rondas continuas", meta:"5×3 min"},
        {name:"Circuito: sentadilla + remo + plancha + zancada", meta:"3 vueltas"}
      ]},
      { day:"Sábado", title:"Cardio suave opcional", tag:"Recuperación", rest:true, exercises:[
        {name:"Caminata larga o yoga/estiramiento", meta:"30 min"}
      ]},
      { day:"Domingo", title:"Descanso completo", tag:"Descanso", rest:true, exercises:[] }
    ]
  },
  { // Semana 4 — consolidación
    label:"Semana 4 · Consolidación",
    note:"Mantén las cargas de la semana 3. El objetivo aquí es consistencia, no subir más — así se mide si el cuerpo ya toleró bien el mes.",
    days:[
      { day:"Lunes", title:"Fuerza funcional — tren inferior", tag:"Funcional", exercises:[
        {name:"Sentadilla goblet", meta:"4×12"},
        {name:"Zancada búlgara", meta:"3×10 c/lado"},
        {name:"Peso muerto rumano", meta:"4×10"},
        {name:"Plancha", meta:"3×35 seg"}
      ]},
      { day:"Martes", title:"Boxeo técnico + core", tag:"Boxeo", exercises:[
        {name:"Sombra + combinaciones", meta:"5×3 min"},
        {name:"Costal: combos a ritmo controlado", meta:"5×3 min"},
        {name:"Abdomen mixto", meta:"3×15"}
      ]},
      { day:"Miércoles", title:"Cardio moderado + movilidad", tag:"LISS", exercises:[
        {name:"Caminadora/bici, ritmo estable", meta:"30 min"},
        {name:"Movilidad + respiración diafragmática", meta:"10 min"}
      ]},
      { day:"Jueves", title:"Fuerza funcional — tren superior", tag:"Funcional", exercises:[
        {name:"Press de pecho", meta:"4×10"},
        {name:"Remo polea", meta:"4×12"},
        {name:"Press de hombro", meta:"3×10"},
        {name:"Curl + extensión brazo", meta:"3×12"}
      ]},
      { day:"Viernes", title:"Boxeo + circuito funcional", tag:"Boxeo", exercises:[
        {name:"Costal: rondas continuas", meta:"5×3 min"},
        {name:"Circuito completo de la semana", meta:"3 vueltas"}
      ]},
      { day:"Sábado", title:"Cardio suave opcional", tag:"Recuperación", rest:true, exercises:[
        {name:"Caminata o yoga restaurativo", meta:"30 min"}
      ]},
      { day:"Domingo", title:"Descanso completo", tag:"Descanso", rest:true, exercises:[] }
    ]
  }
];

/* ---------------- Manejo de estrés ---------------- */
const STRESS_TECHNIQUES = [
  { tag:"Diario", name:"Respiración 4-7-8", detail:"Inhala 4 seg, sostén 7 seg, exhala 8 seg. Repite 4 ciclos antes de dormir o al sentir tensión." },
  { tag:"Diario", name:"Luz solar matutina", detail:"10-15 min de luz natural en la primera hora del día — ayuda a regular el ritmo circadiano y el pico natural de cortisol." },
  { tag:"3×/semana", name:"Caminata sin celular", detail:"15-20 min caminando sin pantallas, idealmente al aire libre." },
  { tag:"Diario", name:"Pausa de desconexión digital", detail:"30-60 min antes de dormir sin pantallas; sustituye por lectura o estiramiento." },
  { tag:"Semanal", name:"Tiempo social/ocio no productivo", detail:"Al menos una actividad placentera sin agenda de por medio: la sensación de urgencia constante eleva cortisol basal." }
];

/* ---------------- Pilares hígado/cortisol ---------------- */
const PILLARS = [
  { name:"Pérdida de peso gradual", detail:"0.5–0.75 kg por semana. Perder peso más rápido se ha asociado a empeorar la inflamación hepática en hígado graso." },
  { name:"Reducir azúcar y fructosa añadida", detail:"Refrescos, jugos, pan dulce: son de los factores dietéticos más asociados a esteatosis hepática. No requieren eliminarse al 100%, sí hacerse infrecuentes." },
  { name:"Horarios de comida regulares", detail:"Comer cada 3-4 h evita picos de cortisol por hipoglucemia y reduce atracones nocturnos." },
  { name:"Sueño de 7-9 horas", detail:"La privación de sueño eleva cortisol y empeora la resistencia a la insulina en menos de una semana." },
  { name:"Movimiento diario, no solo entrenamiento", detail:"Caminar después de comer (10-15 min) ayuda a controlar la glucosa postprandial, lo cual descarga trabajo al hígado." }
];

/* ---------------- Suplementos (educativo) ---------------- */
const SUPPLEMENTS = [
  { warn:true, name:"Magnesio (glicinato o bisglicinato)", detail:"Frecuentemente usado para apoyar sueño y relajación muscular ante estrés crónico. Validar dosis con tu médico." },
  { warn:true, name:"Omega-3 (EPA/DHA)", detail:"Estudiado por su perfil antiinflamatorio y su posible apoyo en hígado graso no alcohólico. Requiere valorarse junto a tus estudios de coagulación/hepáticos." },
  { warn:true, name:"Vitamina D", detail:"La deficiencia es común en México y se ha relacionado con peor control metabólico. Solo debe dosificarse con un nivel en sangre medido previamente." },
  { warn:true, name:"Cardo mariano (silimarina)", detail:"Tradicionalmente usado para salud hepática; la evidencia es mixta. Debe revisarse con tu hepatólogo porque interactúa con ciertos medicamentos." },
  { warn:true, name:"Probióticos", detail:"Hay evidencia preliminar de su papel en el eje intestino-hígado. No reemplazan cambios de alimentación." }
];

/* ---------------- Higiene de sueño ---------------- */
const SLEEP_TIPS = [
  { name:"Horario fijo", detail:"Acostarte y despertar a la misma hora, incluso fines de semana." },
  { name:"Cuarto oscuro y fresco", detail:"18-21°C aproximadamente, sin luces de pantallas en standby." },
  { name:"Cafeína antes de las 14:00", detail:"La cafeína tardía prolonga el cortisol elevado por más horas de las que se perciben." },
  { name:"Cena ligera, no copiosa", detail:"Evitar comidas muy pesadas o tardías que dificulten la digestión nocturna." }
];
