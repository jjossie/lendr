import {ILocation, Location} from "./Location";

export interface ITool {
  id?: string;
  name: string;
  brand?: string;
  description: string;
  lender: {
    lenderId?: string;
    name: string;
    profileImgPath: string;
    rating: number;
  },
  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
  ownerUid: string;
  currentHolderUid: string;
  location?: ILocation;
}

export interface IToolForm {
  name?: string;
  brand?: string;
  description?: string;
  lender?: {
    lenderId?: string;
    name?: string;
    profileImgPath?: string;
    rating?: number;
  },
  rate: {
    price: number;
    timeUnit: TimeUnit
  },
  preferences?: ExchangePreferences
  location?: Location
}



export interface ExchangePreferences {
  delivery?: boolean;
  localPickup?: boolean;
  useOnSite?: boolean;
}

export type TimeUnit = "hour" | "day" | "week";