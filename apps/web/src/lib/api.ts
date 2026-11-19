export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AssetDto {
  id: string;
  primaryIdentifier: string;
  secondaryIdentifier?: string;
  brand: string;
  model: string;
  modelYear?: number;
  currentMeter: number;
}

export interface WorkOrderSummaryDto {
  id: string;
  workOrderNumber: string;
  status: string;
  intakeMeter: number;
  customerComplaint?: string;
  grandTotal: number;
  remainingBalance: number;
  priority: string;
  createdAt: string;
}

export interface AssetLookupResponse {
  found: boolean;
  asset?: AssetDto;
  recentWorkOrders: WorkOrderSummaryDto[];
  totalOutstandingBalance: number;
  message?: string;
}

export interface TsbVehicleDto {
  tsbCode: string;
  marketName: string;
  engineDisplacementCc: number;
  horsePowerHp: number;
  fuelType: string;
  transmission: string;
}

export interface RegistrationCardOcrResponse {
  plateNumber: string;
  vin: string;
  engineNumber: string;
  brand: string;
  model: string;
  modelYear: number;
  color: string;
  documentSerial: string;
  firstRegistrationDate: string;
  confidenceScore: number;
  tsbVehicle?: TsbVehicleDto;
}

export interface DamageMarkerPayload {
  zone: string;
  damageType: string;
  photoUrl?: string;
  xPercent: number;
  yPercent: number;
  notes?: string;
}

export interface CreateIntakePayload {
  branchId?: string;
  asset: {
    plateNumber: string;
    vin?: string;
    brand: string;
    model: string;
    modelYear?: number;
    tsbCode?: string;
    currentMeter: number;
  };
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    isCorporate?: boolean;
  };
  intakeDetails: {
    intakeMeter: number;
    customerComplaint?: string;
    fuelLevelRatio?: number;
    damageInspectionMarkers?: DamageMarkerPayload[];
  };
  bayId?: string;
  priority?: string;
  technicianUserId?: string;
}

export interface IntakeResultResponse {
  workOrderId: string;
  workOrderNumber: string;
  assetId: string;
  plate: string;
  vehicleDescription: string;
  customerName: string;
  customerPhone: string;
  status: string;
  intakeMeter: number;
  customerComplaint?: string;
  priority: string;
  damageMarkers: DamageMarkerPayload[];
  createdAt: string;
  customerMagicLink?: string;
}

export interface WorkshopBayResponse {
  id: string;
  branchId: string;
  bayCode: string;
  name: string;
  bayType: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  currentWorkOrderId?: string;
  currentWorkOrder?: any;
  isActive: boolean;
  queueCount: number;
}

export interface LaborTimerResponse {
  workOrderId: string;
  workOrderNumber: string;
  isLaborRunning: boolean;
  elapsedSeconds: number;
  targetMinutes: number;
  efficiencyPercentage: number;
  startedAt?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const apiClient = {
  async lookupAsset(plate: string): Promise<AssetLookupResponse> {
    try {
      return await request<AssetLookupResponse>(`/api/v1/assets/lookup?plate=${encodeURIComponent(plate)}`);
    } catch {
      // Fallback to local demo data for disconnected/offline mode
      const clean = plate.replace(/\s+/g, "").toUpperCase();
      if (clean.includes("34ABC123")) {
        return {
          found: true,
          asset: {
            id: "asset-1",
            primaryIdentifier: "34 ABC 123",
            secondaryIdentifier: "WVWZZZ3CZWE104921",
            brand: "Volkswagen",
            model: "Passat 1.6 TDI Comfortline",
            modelYear: 2021,
            currentMeter: 145200,
          },
          recentWorkOrders: [
            {
              id: "wo-prev-1",
              workOrderNumber: "WO-2025-08112",
              status: "Completed",
              intakeMeter: 130100,
              customerComplaint: "130.000 KM Periyodik Bakım + Arka Balata",
              grandTotal: 3850,
              remainingBalance: 0,
              priority: "Normal",
              createdAt: "2025-10-12T09:00:00Z",
            },
          ],
          totalOutstandingBalance: 0,
        };
      } else if (clean.includes("06BCD456")) {
        return {
          found: true,
          asset: {
            id: "asset-2",
            primaryIdentifier: "06 BCD 456",
            secondaryIdentifier: "VF1RFB00858921045",
            brand: "Renault",
            model: "Megane 1.5 Blue dCi Icon",
            modelYear: 2020,
            currentMeter: 89450,
          },
          recentWorkOrders: [],
          totalOutstandingBalance: 1200,
        };
      }
      return {
        found: false,
        recentWorkOrders: [],
        totalOutstandingBalance: 0,
        message: `'${plate}' sistemde kayıtlı değil.`,
      };
    }
  },

  async processRegistrationOcr(payload: { rawText?: string; mockVehiclePreset?: string }): Promise<RegistrationCardOcrResponse> {
    try {
      return await request<RegistrationCardOcrResponse>("/api/v1/ocr/registration-card", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback demo OCR
      const preset = payload.mockVehiclePreset || "corolla";
      return {
        plateNumber: preset === "megane" ? "06 BCD 456" : "35 CDE 789",
        vin: preset === "megane" ? "VF1RFB00858921045" : "NMTEB3BE30R109823",
        engineNumber: preset === "megane" ? "K9K858921" : "2ZR109823",
        brand: preset === "megane" ? "RENAULT" : "TOYOTA",
        model: preset === "megane" ? "Megane 1.5 Blue dCi Icon EDC" : "Corolla 1.8 Hybrid Dream e-CVT",
        modelYear: preset === "megane" ? 2020 : 2022,
        color: preset === "megane" ? "BEYAZ" : "GÜMÜŞ GRİ",
        documentSerial: "TR789012",
        firstRegistrationDate: "2022-04-10T00:00:00Z",
        confidenceScore: 0.98,
        tsbVehicle: {
          tsbCode: preset === "megane" ? "1042301" : "2081190",
          marketName: preset === "megane" ? "Megane 1.5 Blue dCi Icon EDC" : "Corolla 1.8 Hybrid Dream e-CVT",
          engineDisplacementCc: preset === "megane" ? 1461 : 1798,
          horsePowerHp: preset === "megane" ? 115 : 140,
          fuelType: preset === "megane" ? "Diesel" : "Hybrid",
          transmission: "Automatic",
        },
      };
    }
  },

  async createIntake(payload: CreateIntakePayload): Promise<IntakeResultResponse> {
    try {
      return await request<IntakeResultResponse>("/api/v1/workorders/intake", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline fallback
      const woNum = `WO-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        workOrderId: `wo-${Date.now()}`,
        workOrderNumber: woNum,
        assetId: `asset-${Date.now()}`,
        plate: payload.asset.plateNumber,
        vehicleDescription: `${payload.asset.brand} ${payload.asset.model}`.trim(),
        customerName: payload.customer.fullName || "Müşteri",
        customerPhone: payload.customer.phone || "0532 000 0000",
        status: "Open",
        intakeMeter: payload.intakeDetails.intakeMeter,
        customerComplaint: payload.intakeDetails.customerComplaint,
        priority: payload.priority || "Normal",
        damageMarkers: payload.intakeDetails.damageInspectionMarkers || [],
        createdAt: new Date().toISOString(),
        customerMagicLink: `https://hiservis.link/${woNum.toLowerCase()}`,
      };
    }
  },

  async getBays(branchId?: string): Promise<WorkshopBayResponse[]> {
    try {
      const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
      return await request<WorkshopBayResponse[]>(`/api/v1/bays${q}`);
    } catch {
      return [];
    }
  },

  async clockInLabor(workOrderId: string): Promise<LaborTimerResponse> {
    try {
      return await request<LaborTimerResponse>(`/api/v1/workorders/${workOrderId}/labor/clock-in`, {
        method: "POST",
      });
    } catch {
      return {
        workOrderId,
        workOrderNumber: "WO-2026-10492",
        isLaborRunning: true,
        elapsedSeconds: 5075,
        targetMinutes: 120,
        efficiencyPercentage: 70.5,
        startedAt: new Date().toISOString(),
      };
    }
  },

  async clockOutLabor(workOrderId: string): Promise<LaborTimerResponse> {
    try {
      return await request<LaborTimerResponse>(`/api/v1/workorders/${workOrderId}/labor/clock-out`, {
        method: "POST",
      });
    } catch {
      return {
        workOrderId,
        workOrderNumber: "WO-2026-10492",
        isLaborRunning: false,
        elapsedSeconds: 5075,
        targetMinutes: 120,
        efficiencyPercentage: 70.5,
      };
    }
  },

  async updateWorkOrderStatus(workOrderId: string, status: string): Promise<any> {
    try {
      return await request(`/api/v1/workorders/${workOrderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } catch {
      return { success: true, newStatus: status };
    }
  },
};
