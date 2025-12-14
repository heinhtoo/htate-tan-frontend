  export type WarehouseResponse = {
    id: number;
    name: string;
    location: string;
    isSellable: boolean;
    orderLeadingText: string;
    version: number;
    noOfStaffs?: number;
  };
