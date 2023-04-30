export type LiveGenerationData = {
  date: {
    N: string
  },
  time: {
    N: string
  },
  fuels: {
    L: Array<{
      M: {
        fuelType: {
          S: string
        },
        value: {
          N: string
        },
        percent: {
          N: string
        }
      }
    }>
  }
};

export enum FuelType {
  Fossil = 1,
  Renewable,
  LowCarbon,
  Interconnection,
  Unknown
}

type Fuel = {
  acronym: string,
  name: string,
  type: FuelType
}

export type FuelValue = Fuel & { value: number, percent: number };

function getFuelType(acronym: string) {
  const fuel: Fuel = {
    acronym,
    name: acronym,
    type: FuelType.Unknown
  }

  switch (acronym) {
    case "CCGT":
      fuel.name = "Gas (Combined Cycle)";
      fuel.type = FuelType.Fossil;
      break;
    case "OCGT":
      fuel.name = "Gas (Open Cycle)";
      fuel.type = FuelType.Fossil;
      break;
    case "OIL":
      fuel.name = "Oil";
      fuel.type = FuelType.Fossil;
      break;
    case "COAL":
      fuel.name = "Coal";
      fuel.type = FuelType.Fossil;
      break;
    case "NUCLEAR":
      fuel.name = "Nuclear";
      fuel.type = FuelType.LowCarbon;
      break;
    case "WIND":
      fuel.name = "Offshore Wind";
      fuel.type = FuelType.Renewable;
      break;
    case "PS":
      fuel.name = "Pumped Storage Hydro";
      fuel.type = FuelType.Renewable;
      break;
    case "NPSHYD":
      fuel.name = "Hydro (non-PS)";
      fuel.type = FuelType.Renewable;
      break;
    case "BIOMASS":
      fuel.name = "Biomass";
      fuel.type = FuelType.LowCarbon;
      break;
    case "OTHER":
      fuel.name = "Other";
      fuel.type = FuelType.Unknown;
      break;
    case "INTFR":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTIRL":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTNED":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTEW":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTNEM":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTELEC":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTIFA2":
      fuel.type = FuelType.Interconnection;
      break;
    case "INTNSL":
      fuel.type = FuelType.Interconnection;
      break;
  }

  return fuel;
};

export function transformFuelsData(rawData: LiveGenerationData): FuelValue[] {
  return rawData.fuels.L.map(item => ({
    ...getFuelType(item.M.fuelType.S),
    value: parseInt(item.M.value.N),
    percent: parseInt(item.M.percent.N)
  }))
}