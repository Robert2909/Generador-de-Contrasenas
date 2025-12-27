"use strict";

/**
 * Calculadora de entropía y estimación de fuerza.
 * Usa la fórmula de Entropía de Shannon: E = L * log2(R)
 * L = Longitud, R = Tamaño del pool de caracteres usados.
 * También aplica penalizaciones por patrones predecibles.
 */

// Velocidad de ataque hipotética (hashes/segundo)
// Asumimos un rig GPU potente (ej. RTX 4090 cluster) -> ~100 mil millones/s (1e11)
const CRACK_SPEED_HASHES_PER_SECOND = 100_000_000_000;

const TIME_UNITS = [
  { label: "siglos", seconds: 31536000 * 100 },
  { label: "años", seconds: 31536000 },
  { label: "meses", seconds: 2592000 },
  { label: "días", seconds: 86400 },
  { label: "horas", seconds: 3600 },
  { label: "minutos", seconds: 60 },
  { label: "segundos", seconds: 1 },
];

function getCrackTime(entropyBits) {
  // Combinaciones posibles = 2^entropy
  // Promedio para encontrarla = 2^(entropy - 1)
  const combinations = Math.pow(2, entropyBits);
  const averageGuesses = combinations / 2;
  const seconds = averageGuesses / CRACK_SPEED_HASHES_PER_SECOND;

  if (seconds < 1) return "Instantáneo";

  for (const unit of TIME_UNITS) {
    const value = seconds / unit.seconds;
    if (value >= 1) {
      if (value > 1000 && unit.label === "siglos") return "Eternidad";
      return `~${Math.round(value)} ${unit.label}`;
    }
  }
  return "Instantáneo";
}

/**
 * Determina el tipo de un carácter
 */
function getCharType(char) {
  if (/[a-z]/.test(char)) return 'lower';
  if (/[A-Z]/.test(char)) return 'upper';
  if (/[0-9]/.test(char)) return 'number';
  if (/[^a-zA-Z0-9]/.test(char)) return 'symbol';
  return 'other';
}

function calculateEntropy(password) {
  if (!password) return 0;
  const len = password.length;

  // 1. Detectar tamaño del pool (R)
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32; // Símbolos comunes

  if (poolSize === 0) return 0;

  // Entropía bruta
  let entropy = len * Math.log2(poolSize);

  // --- PENALIZACIONES HEURÍSTICAS AVANZADAS ---

  // 1. Repeticiones (aa, 11)
  const repeats = len - new Set(password).size;
  if (repeats > 0) {
    // Si la contraseña es "aaaa", repeats=3. Entropy debe bajar drásticamente.
    entropy -= repeats * 3;
  }

  // 2. Secuencias Simples (abc, 123)
  // Penalizamos fuerte si encontramos trozos secuenciales
  if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) entropy -= 15;
  if (/(123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210)/.test(password)) entropy -= 15;
  if (/(qwerty|asdfgh|zxcvbn|qaz|wsx|edc|rfv)/i.test(password)) entropy -= 25; // Teclado evidente

  // 3. Mezcla Pobre (Segregación de tipos)
  // Contamos transiciones: a -> B (1), B -> 1 (1). 
  // "Password123" tiene 2 transiciones. "P4sSw0rd" tiene muchas más.
  let transitions = 0;
  for (let i = 0; i < len - 1; i++) {
    const type1 = getCharType(password[i]);
    const type2 = getCharType(password[i + 1]);
    if (type1 !== type2) transitions++;
  }

  // Si hay muy pocas transiciones para la longitud, probablemente son palabras + sufijos
  // Ratio ideal: ~0.7 o más?
  // Un generador aleatorio casi siempre alterna tipos.

  if (len > 8 && transitions < 3) {
    // Caso típico "PalabraLarga123"
    entropy *= 0.6; // Reducimos al 60% la entropía calculada
  } else if (len > 8 && transitions < (len / 3)) {
    entropy *= 0.8; // Penalización moderada
  }

  return Math.max(0, entropy);
}

/**
 * Evalúa la contraseña y devuelve un objeto rico en datos para la UI.
 * Escala refinada para diferenciar mejor entre "basura", "débil" y "militar".
 */
function evaluatePassword(password) {
  const entropy = calculateEntropy(password);
  const crackTime = getCrackTime(entropy);

  // Cálculo de intentos promedio (2^(entropy-1)) formateado
  const guesses = Math.pow(2, entropy - 1);
  let guessesText = "";
  if (guesses > 1e21) guessesText = "> 1 sextillón";
  else if (guesses > 1e15) guessesText = "> 1000 billones";
  else if (guesses > 1e12) guessesText = "> 1 billón";
  else if (guesses > 1e9) guessesText = `~${(guesses / 1e9).toFixed(1)} mil millones`;
  else if (guesses > 1e6) guessesText = `~${(guesses / 1e6).toFixed(1)} millones`;
  else guessesText = `~${Math.round(guesses)}`;

  // Clasificación basada en Bits de Entropía (Escala ajustada para penalizar más)
  let percent = 0;
  let label = "";
  let color = "";
  let feedback = "";

  if (entropy < 1) { // Vacío o nulo
    percent = 0; label = "Vacía"; color = "#333"; feedback = "";
  }
  else if (entropy < 28) { // Muy vulnerable
    percent = 5;
    label = "Muy Insegura";
    color = "#d90429"; // Rojo sangre puro
    feedback = "Extremadamente vulnerable a fuerza bruta o diccionario.";
  }
  else if (entropy < 40) { // Débil (subimos el estándar)
    percent = 20;
    label = "Débil";
    color = "#ef233c"; // Rojo brillante
    feedback = "Fácil de romper. Evita palabras comunes o secuencias simples.";
  }
  else if (entropy < 60) { // Regular
    percent = 45;
    label = "Mejorable";
    color = "#fb8500"; // Naranja
    feedback = "Resistente a ataques simples, pero débil ante granjas de GPU modernas.";
  }
  else if (entropy < 80) { // Buena
    percent = 65;
    label = "Buena";
    color = "#ffb703"; // Amarillo cálido
    feedback = "Seguridad aceptable para la mayoría de sitios.";
  }
  else if (entropy < 110) { // Fuerte
    percent = 85;
    label = "Fuerte";
    color = "#8cb369"; // Verde oliva
    feedback = "Muy segura. Difícil de comprometer sin computación cuántica.";
  }
  else { // Overkill
    percent = 100;
    label = "IMPENETRABLE";
    color = "#00b4d8"; // Cyan neón
    feedback = "Grado militar. Entropía superior a estándares bancarios.";
  }

  // Añadimos el dato geek al feedback
  if (entropy > 1) {
    feedback += ` (Intentos aprox: ${guessesText})`;
  }

  return {
    entropy: Math.round(entropy),
    crackTime,
    percent,
    label,
    color,
    feedback
  };
}
