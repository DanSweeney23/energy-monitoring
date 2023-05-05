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
  Fossil = "Fossil Fuels",
  Renewable = "Renewables",
  LowCarbon = "Other Low Carbon",
  Interconnection = "Imports",
  Unknown = "Unknown"
}

export function getFuelTypeColor(type: FuelType) {
  switch(type) {
    case FuelType.Fossil: 
      return "#ff6a6a";
    case FuelType.Renewable:
      return "#6dd158";
    case FuelType.LowCarbon:
      return "#68989b";
    case FuelType.Interconnection:
      return "#999999";
    case FuelType.Unknown:
      return "#ffffff";
  }
}

type Fuel = {
  acronym: string,
  name: string,
  type: FuelType,
  color: string
}

export type FuelValue = Fuel & { value: number, percent: number };

function getFuelInfo(acronym: string) {
  const fuel: Fuel = {
    acronym,
    name: acronym,
    type: FuelType.Unknown,
    color: "#fff"
  }

  switch (acronym) {
    case "CCGT":
      fuel.name = "Gas (Combined Cycle)";
      fuel.type = FuelType.Fossil;
      fuel.color = "#ff6a6a";
      break;
    case "OCGT":
      fuel.name = "Gas (Open Cycle)";
      fuel.type = FuelType.Fossil;
      fuel.color = "#d13615";
      break;
    case "OIL":
      fuel.name = "Oil";
      fuel.type = FuelType.Fossil;
      fuel.color = "#480008";
      break;
    case "COAL":
      fuel.name = "Coal";
      fuel.type = FuelType.Fossil;
      fuel.color = "#280005";
      break;
    case "NUCLEAR":
      fuel.name = "Nuclear";
      fuel.type = FuelType.LowCarbon;
      fuel.color = "#ad72c5";
      break;
    case "BIOMASS":
      fuel.name = "Biomass";
      fuel.type = FuelType.LowCarbon;
      fuel.color = "#68989b";
      break;
    case "WIND":
      fuel.name = "Offshore Wind";
      fuel.type = FuelType.Renewable;
      fuel.color = "#6dd158";
      break;
    case "PS":
      fuel.name = "Pumped Storage Hydro";
      fuel.type = FuelType.Renewable;
      fuel.color = "#75af96";
      break;
    case "NPSHYD":
      fuel.name = "Hydro (non-PS)";
      fuel.type = FuelType.Renewable;
      fuel.color = "#83c38e";
      break;
    case "OTHER":
      fuel.name = "Other";
      fuel.type = FuelType.Unknown;
      fuel.color = "#bbb";
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
    ...getFuelInfo(item.M.fuelType.S),
    value: parseInt(item.M.value.N),
    percent: parseInt(item.M.percent.N)
  }))
}

//Helps convert dates & times as stored in dynamo to a regular js Date object
export function convertDateTime(date: string, time: string) {
  const paddedDate = ("0" + date.slice(-7)) ?? ''; //Pad leading 0s as they are removed in dynamo ie 1052023 -> 01052023 -> 01/05/2023
  const paddedTime = (("00000000" + time).slice(-6)) ?? '';
  const rawDateTime = paddedDate + paddedTime;

  const dashedDateTime = rawDateTime.replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})(\d{2})/, "$3-$2-$1T$4:$5:$6Z");
  return new Date(dashedDateTime)
}