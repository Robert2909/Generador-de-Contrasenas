"use strict";

/**
 * Conjuntos de caracteres a utilizar.
 */
const CHAR_SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  // Puedes ajustar esta lista si algún sitio no admite ciertos símbolos
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?|~",
};

/** Longitudes por defecto y límites del slider */
const DEFAULT_MIN_LENGTH = 4;
const DEFAULT_MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

/**
 * Perfiles de seguridad optimizados para casos de uso reales.
 */
const SECURITY_PRESETS = [
  {
    id: "ultra",
    label: "Ultra Segura",
    description: "Extrema (32 chars). Para bancos, emails y gestores de claves.",
    options: {
      length: 32,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: true,
    },
  },
  {
    id: "estandar",
    label: "Estándar Web",
    description: "Equilibrada (16 chars). Ideal para la mayoría de cuentas.",
    options: {
      length: 16,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: true,
    },
  },
  {
    id: "compatible",
    label: "Compatible (Sin Símbolos)",
    description: "Alfanumérica (16 chars). Para sitios que rechazan símbolos.",
    options: {
      length: 16,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: false,
    },
  },
  {
    id: "pin",
    label: "PIN Numérico",
    description: "Solo números (6 dígitos). Para tarjetas o códigos de acceso.",
    options: {
      length: 6,
      useLower: false,
      useUpper: false,
      useNumbers: true,
      useSymbols: false,
    },
  },
  {
    id: "personalizado",
    label: "Personalizado",
    description: "Ajusta manualmente longitud y caracteres.",
    options: null, // Se toma desde la UI actual
  },
];
