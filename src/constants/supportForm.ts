
import { ProblemType, SupportMethod, UrgencyLevel } from "../types/supportForm";

export const DEVICE_MODELS = [
  "RAK7268 Wisgate Edge Lite 2",
  "RAK7271 WisGate Edge Prime",
  "RAK7289 WisGate Edge Pro",
  "RAK7258 WisGate Edge",
  "RAK7249 WisGate Edge Max",
  "RAK7240 WisGate Edge Prime",
  "RAK7268C WisGate Edge Lite 2",
  "RAK7391 WisBlock Base Board Pro",
  "RAK5010 WisTrio NB-IoT Tracker",
  "RAK4631 WisBlock Core",
  "RAK4200 WisDuo LPWAN Module",
  "RAK4270 WisDuo LPWAN Module",
  "RAK3172 WisDuo LPWAN Module",
  "RAK11300 WisBlock Core",
  "RAK11200 WisBlock Core",
  "RAK11720 Module",
  "RAK12500 WisBlock Sensor",
  "RAK2013 Cellular NB-IoT",
  "Other"
];

export const PROBLEM_TYPES: Record<ProblemType, string> = {
  connectivity: "Connectivity Issues",
  installation: "Installation Problems",
  configuration: "Configuration Help",
  hardware: "Hardware Malfunction",
  software: "Software/Firmware Issues",
  other: "Other Issue"
};

export const SUPPORT_METHODS: Record<SupportMethod, string> = {
  email: "Email Support",
  phone: "Phone Support",
  remote: "Remote Assistance"
};

export const URGENCY_LEVELS: Record<UrgencyLevel, string> = {
  low: "Low - No immediate impact on operations",
  medium: "Medium - Some features affected but workarounds exist",
  high: "High - Critical system or business impact"
};
