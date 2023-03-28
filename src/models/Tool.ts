export interface ITool {
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
  holder: string
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
}

export interface ExchangePreferences {
  delivery?: boolean;
  localPickup?: boolean;
  useOnSite?: boolean;
}

export type TimeUnit = "hour" | "day" | "week";