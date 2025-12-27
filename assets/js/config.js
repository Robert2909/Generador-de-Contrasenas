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
const DEFAULT_LENGTH = 64;

/**
 * Perfiles de seguridad optimizados para casos de uso reales.
 */
const SECURITY_PRESETS = [
  {
    id: "ultra",
    label: "Ultra Segura",
    description: "Extrema (64 chars). Todo al máximo.",
    options: {
      length: 64,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: true,
    },
  },
  {
    id: "estandar",
    label: "Estándar Web",
    description: "Equilibrada (32 chars). Cantidad de caracteres considerables.",
    options: {
      length: 32,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: true,
    },
  },
  {
    id: "compatible",
    label: "Sin símbolos",
    description: "Alfanumérica (32 chars). Para sitios que rechazan símbolos.",
    options: {
      length: 32,
      useLower: true,
      useUpper: true,
      useNumbers: true,
      useSymbols: false,
    },
  },
  {
    id: "pin",
    label: "PIN",
    description: "Solo números (6 dígitos). Pines cortos y fáciles de recordar.",
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
