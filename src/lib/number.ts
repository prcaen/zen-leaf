import { UnitSystem } from '../types';

// Temperature conversions
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

// Length/Size conversions
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

// Format temperature for display
export function formatTemperature(celsius: number, unitSystem: UnitSystem): string {
  if (unitSystem === UnitSystem.IMPERIAL) {
    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

// Format size/length for display
export function formatSize(cm: number, unitSystem: UnitSystem): string {
  if (unitSystem === UnitSystem.IMPERIAL) {
    const inches = cmToInches(cm);
    return `${Math.round(inches * 10) / 10}"`;
  }
  return `${Math.round(cm)} cm`;
}

// Convert temperature from display value to metric (for saving)
export function parseTemperature(value: number, unitSystem: UnitSystem): number {
  if (unitSystem === UnitSystem.IMPERIAL) {
    return fahrenheitToCelsius(value);
  }
  return value;
}

// Convert size from display value to metric (for saving)
export function parseSize(value: number, unitSystem: UnitSystem): number {
  if (unitSystem === UnitSystem.IMPERIAL) {
    return inchesToCm(value);
  }
  return value;
}

// Convert temperature from metric to display value
export function getDisplayTemperature(celsius: number, unitSystem: UnitSystem): number {
  if (unitSystem === UnitSystem.IMPERIAL) {
    return celsiusToFahrenheit(celsius);
  }
  return celsius;
}

// Convert size from metric to display value
export function getDisplaySize(cm: number, unitSystem: UnitSystem): number {
  if (unitSystem === UnitSystem.IMPERIAL) {
    return Math.round(cmToInches(cm) * 10) / 10;
  }
  return cm;
}

// Get temperature unit string
export function getTemperatureUnit(unitSystem: UnitSystem): string {
  return unitSystem === UnitSystem.IMPERIAL ? '°F' : '°C';
}

// Get size unit string
export function getSizeUnit(unitSystem: UnitSystem): string {
  return unitSystem === UnitSystem.IMPERIAL ? '"' : 'cm';
}

