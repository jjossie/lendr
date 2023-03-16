export interface ITool {
  name: string;
  brand: string;
  description: string;
  lender: {
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
}

export type TimeUnit = "hour" | "day" | "week";