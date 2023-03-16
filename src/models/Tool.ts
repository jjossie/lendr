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
    timeUnit: "hour" | "day" | "week";
  },
  preferences: {
    delivery: boolean;
    localPickup: boolean;
    useOnSite: boolean;
  }
}