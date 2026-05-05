export type StoreBrand = 'Sunglass Hut' | 'LensCrafters';

export interface StoreLocation {
  name: string;
  code: string;
  brand: StoreBrand;
}

export type LocationDatabase = Record<string, Record<string, StoreLocation[]>>;

export const locationData: LocationDatabase = {
  "Karnataka": {
    "Bengaluru": [
      { name: "Mantri Mall, Bangalore", code: "TA5U / 7113", brand: "Sunglass Hut" },
      { name: "Forum Mall, Bangalore", code: "TA5W / 8836", brand: "Sunglass Hut" },
      { name: "Brigade Gateway Mall, Bengaluru", code: "TA5X / 8911", brand: "Sunglass Hut" },
      { name: "Vega City Mall, Bengaluru", code: "TA6J / 9127", brand: "Sunglass Hut" },
      { name: "Lulu Mall, Bangalore", code: "T1MV / F799", brand: "Sunglass Hut" },
      { name: "Pheonix Market City Mall, Whitefields", code: "T1AD / 7072", brand: "Sunglass Hut" },
      { name: "Garuda Mall, Bangalore", code: "TA9K / 7114", brand: "Sunglass Hut" },
      { name: "VR Xander Mall, Bengaluru", code: "TA5V / 8476", brand: "Sunglass Hut" },
      { name: "Falcon City, Bangalore", code: "T44G / P073", brand: "Sunglass Hut" },
      { name: "Lenscrafters, Brigade Orion Mall", code: "LC-BOM-71", brand: "LensCrafters" },
      { name: "Lenscrafters, 100 feet road (Indiranagar)", code: "LC-IND-100", brand: "LensCrafters" },
      { name: "Lenscrafters, Mall of Asia", code: "LC-MOA-88", brand: "LensCrafters" }
    ]
  }
};
