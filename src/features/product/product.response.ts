export type ProductResponse = {
  // --- Core Fields ---
  id: number;
  name: string;
  sku: string;
  price: number;
  version: number;

  description?: string;
  imagePath?: string;

  lowStockAlertAt: number;
  lastRestockedAt?: Date;
  unitConversions?: { id: number; name: string; conversionRate: number }[];

  // --- Calculated/Aggregated Fields ---

  /**
   * The total quantity of this product across all warehouses.
   */
  totalCurrentStock: number;

  // --- Relational Data ---

  // Displaying just the name/ID of Category/Brand is often preferred for simplicity
  category: {
    id: number;
    name: string;
  };

  brand: {
    id: number;
    name: string;
  };

  productType: {
    id: number;
    name: string;
  };

  group?: {
    id: number;
    name: string;
  };

  /**
   * Detailed breakdown of stocks by warehouse.
   * This array is used to power the Stock Breakdown Table on the Product Details page.
   */
  stocks: StockResponse[];

  // Note: If you need to include creation/update timestamps,
  // you would extend or include fields from BaseEntity here.
};

// --- Nested DTO Example: StockResponse (Crucial for inventory breakdown) ---

/**
 * DTO for responding with a single stock record.
 */
export type StockResponse = {
  id: number;

  purchasedQuantity: number;
  purchasedPrice: number;
  purchasedCurrency: string; // Changed from number to string for currency code (e.g., USD, MMK)
  purchasedPriceInMMK: number;

  currentQuantity: number;

  // Only include the warehouse details necessary for the frontend table
  warehouse: {
    id: number;
    name: string;
  };
};
