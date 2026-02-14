import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerResponse } from "../customer/customer.response";
import type { ProductResponse } from "../product/product.response";

// Cart item with product details and quantity
export interface PosCartItem extends ProductResponse {
  qty: number;
  selectedUnitName: string;
  convertedQtyMultiplier: number;
}

// Checkout details structure
export interface PosCheckoutDetails {
  carGateId?: number;
  otherCharges: {
    otherChargeId: number;
    amount: number;
    name: string;
  }[];
  payment: {
    paymentMethodId: number;
    amount: number;
    referenceId?: string;
    name: string;
    paymentQR: string;
    showValue: boolean;
  }[];
  remark: string;
  globalDiscount: number;
}

// Individual order structure
export interface PosOrder {
  id: string;
  name: string;
  cart: PosCartItem[];
  selectedCustomer: CustomerResponse | null;
  checkoutDetails: PosCheckoutDetails;
  createdAt: string;
  isCustomer: boolean;
}

// Store state and actions
interface PosStoreState {
  orders: PosOrder[];
  lastUpdatedAt: string;
  setLastUpdatedAt: (lastUpdatedAt: string) => void;

  // Order management
  createOrder: (isCustomer: boolean) => void;
  switchOrder: (orderId: string, isCustomer: boolean) => void;
  deleteOrder: (orderId: string, isCustomer: boolean) => void;

  // Cart operations
  addToCart: (
    product: ProductResponse,
    multiplier: number,
    unitName: string,
    isCustomer: boolean,
  ) => void;
  updateCartQty: (
    productId: number,
    delta: number,
    unitName: string,
    isCustomer: boolean,
  ) => void;
  setCartItemQty: (
    productId: number,
    qty: number,
    unitName: string,
    isCustomer: boolean,
  ) => void;
  updateCartItemPrice: (
    productId: number,
    price: number,
    unitName: string,
    isCustomer: boolean,
  ) => void;
  removeFromCart: (
    productId: number,
    unitName: string,
    isCustomer: boolean,
  ) => void;

  // Customer operations
  setCustomer: (customer: CustomerResponse | null, isCustomer: boolean) => void;

  // Checkout details operations
  setCarGate: (carGateId: number | undefined, isCustomer: boolean) => void;
  addOtherCharge: (
    charge: {
      otherChargeId: number;
      amount: number;
      name: string;
    },
    isCustomer: boolean,
  ) => void;
  updateOtherChargeAmount: (
    otherChargeId: number,
    amount: number,
    isCustomer: boolean,
  ) => void;
  removeOtherCharge: (otherChargeId: number, isCustomer: boolean) => void;
  addPaymentMethod: (
    payment: {
      paymentMethodId: number;
      amount: number;
      referenceId?: string;
      name: string;
      paymentQR: string;
      showValue: boolean;
    },
    isCustomer: boolean,
  ) => void;
  updatePayment: (
    paymentMethodId: number,
    data: Partial<{ amount: number; referenceId: string }>,
    isCustomer: boolean,
  ) => void;
  removePayment: (paymentMethodId: number, isCustomer: boolean) => void;
  setRemark: (remark: string, isCustomer: boolean) => void;
  setGlobalDiscount: (discount: number, isCustomer: boolean) => void;

  // Clear order after checkout
  clearActiveOrder: (isCustomer: boolean) => void;

  // Getters
  getActiveOrder: (isCustomer: boolean) => PosOrder | undefined;
  syncProducts: (products: ProductResponse[]) => void;

  // New state for split active orders
  activeSalesOrderId: string;
  activePurchaseOrderId: string;
}

// Helper to create a new empty order
const createEmptyOrder = (
  orderNumber: number,
  isCustomer: boolean,
): PosOrder => ({
  id: uuidv4(),
  name: `Order #${orderNumber}`,
  cart: [],
  selectedCustomer: null,
  checkoutDetails: {
    carGateId: undefined,
    otherCharges: [],
    payment: [],
    remark: "",
    globalDiscount: 0,
  },
  createdAt: new Date().toISOString(),
  isCustomer,
});

export const usePosStore = create<PosStoreState>()(
  persist(
    (set, get) => ({
      orders: [createEmptyOrder(1, true), createEmptyOrder(1, false)],
      activeSalesOrderId: "",
      activePurchaseOrderId: "",
      lastUpdatedAt: "",
      setLastUpdatedAt(lastUpdatedAt) {
        set({ lastUpdatedAt });
      },

      // Initialize activeOrderId after hydration
      createOrder: (isCustomer: boolean) => {
        const { orders } = get();
        const typeOrders = orders.filter((o) => o.isCustomer === isCustomer);
        const newOrder = createEmptyOrder(typeOrders.length + 1, isCustomer);

        if (isCustomer) {
          set({
            orders: [...orders, newOrder],
            activeSalesOrderId: newOrder.id,
          });
        } else {
          set({
            orders: [...orders, newOrder],
            activePurchaseOrderId: newOrder.id,
          });
        }
      },

      switchOrder: (orderId: string, isCustomer: boolean) => {
        if (isCustomer) {
          set({ activeSalesOrderId: orderId });
        } else {
          set({ activePurchaseOrderId: orderId });
        }
      },

      deleteOrder: (orderId: string, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();

        // Don't allow deleting the last order of this type
        const typeOrders = orders.filter((o) => o.isCustomer === isCustomer);
        if (typeOrders.length === 1) {
          return;
        }

        const updatedOrders = orders.filter((order) => order.id !== orderId);

        if (isCustomer) {
          const newActiveOrderId =
            activeSalesOrderId === orderId
              ? updatedOrders.find((o) => o.isCustomer === true)?.id || ""
              : activeSalesOrderId;
          set({
            orders: updatedOrders,
            activeSalesOrderId: newActiveOrderId,
          });
        } else {
          const newActiveOrderId =
            activePurchaseOrderId === orderId
              ? updatedOrders.find((o) => o.isCustomer === false)?.id || ""
              : activePurchaseOrderId;
          set({
            orders: updatedOrders,
            activePurchaseOrderId: newActiveOrderId,
          });
        }
      },

      addToCart: (
        product: ProductResponse,
        multiplier: number,
        unitName: string,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          const existing = order.cart.find(
            (i) => i.id === product.id && i.selectedUnitName === unitName,
          );

          if (existing) {
            return {
              ...order,
              cart: order.cart.map((i) =>
                i.id === product.id && i.selectedUnitName === unitName
                  ? { ...i, qty: i.qty + 1 }
                  : i,
              ),
            };
          }

          return {
            ...order,
            cart: [
              ...order.cart,
              {
                ...product,
                qty: 1,
                selectedUnitName: unitName,
                convertedQtyMultiplier: multiplier,
              },
            ],
          };
        });

        set({ orders: updatedOrders });
      },

      updateCartQty: (
        productId: number,
        delta: number,
        unitName: string,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            cart: order.cart
              .map((i) =>
                i.id === productId && i.selectedUnitName === unitName
                  ? { ...i, qty: Math.max(0, i.qty + delta) }
                  : i,
              )
              .filter((i) => i.qty > 0),
          };
        });

        set({ orders: updatedOrders });
      },

      setCartItemQty: (
        productId: number,
        qty: number,
        unitName: string,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            cart: order.cart
              .map((i) =>
                i.id === productId && i.selectedUnitName === unitName
                  ? { ...i, qty: Math.max(1, qty) }
                  : i,
              )
              .filter((i) => i.qty > 0),
          };
        });

        set({ orders: updatedOrders });
      },

      updateCartItemPrice: (
        productId: number,
        price: number,
        unitName: string,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            cart: order.cart.map((i) =>
              i.id === productId && i.selectedUnitName === unitName
                ? { ...i, price: Math.max(0, price) }
                : i,
            ),
          };
        });

        set({ orders: updatedOrders });
      },

      removeFromCart: (
        productId: number,
        unitName: string,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            cart: order.cart.filter(
              (i) => !(i.id === productId && i.selectedUnitName === unitName),
            ),
          };
        });

        set({ orders: updatedOrders });
      },

      setCustomer: (
        customer: CustomerResponse | null,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return { ...order, selectedCustomer: customer };
        });

        set({ orders: updatedOrders });
      },

      setCarGate: (carGateId: number | undefined, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return {
            ...order,
            checkoutDetails: { ...order.checkoutDetails, carGateId },
          };
        });

        set({ orders: updatedOrders });
      },

      addOtherCharge: (charge, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          // Prevent duplicates
          if (
            order.checkoutDetails.otherCharges.some(
              (oc) => oc.otherChargeId === charge.otherChargeId,
            )
          ) {
            return order;
          }

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              otherCharges: [...order.checkoutDetails.otherCharges, charge],
            },
          };
        });

        set({ orders: updatedOrders });
      },

      updateOtherChargeAmount: (
        otherChargeId: number,
        amount: number,
        isCustomer: boolean,
      ) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              otherCharges: order.checkoutDetails.otherCharges.map((oc) =>
                oc.otherChargeId === otherChargeId ? { ...oc, amount } : oc,
              ),
            },
          };
        });

        set({ orders: updatedOrders });
      },

      removeOtherCharge: (otherChargeId: number, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              otherCharges: order.checkoutDetails.otherCharges.filter(
                (oc) => oc.otherChargeId !== otherChargeId,
              ),
            },
          };
        });

        set({ orders: updatedOrders });
      },

      addPaymentMethod: (payment, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          // Prevent duplicates
          if (
            order.checkoutDetails.payment.some(
              (p) => p.paymentMethodId === payment.paymentMethodId,
            )
          ) {
            return order;
          }

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              payment: [...order.checkoutDetails.payment, payment],
            },
          };
        });

        set({ orders: updatedOrders });
      },

      updatePayment: (paymentMethodId: number, data, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              payment: order.checkoutDetails.payment.map((p) =>
                p.paymentMethodId === paymentMethodId ? { ...p, ...data } : p,
              ),
            },
          };
        });

        set({ orders: updatedOrders });
      },

      removePayment: (paymentMethodId: number, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              payment: order.checkoutDetails.payment.filter(
                (p) => p.paymentMethodId !== paymentMethodId,
              ),
            },
          };
        });

        set({ orders: updatedOrders });
      },

      setRemark: (remark: string, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return {
            ...order,
            checkoutDetails: { ...order.checkoutDetails, remark },
          };
        });

        set({ orders: updatedOrders });
      },

      setGlobalDiscount: (discount: number, isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return {
            ...order,
            checkoutDetails: {
              ...order.checkoutDetails,
              globalDiscount: discount,
            },
          };
        });

        set({ orders: updatedOrders });
      },

      clearActiveOrder: (isCustomer: boolean) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeOrderId = isCustomer
          ? activeSalesOrderId
          : activePurchaseOrderId;

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            cart: [],
            selectedCustomer: null,
            checkoutDetails: {
              carGateId: undefined,
              otherCharges: [],
              payment: [],
              remark: "",
              globalDiscount: 0,
            },
          };
        });

        set({ orders: updatedOrders });
      },

      getActiveOrder: (isCustomer) => {
        const { orders, activeSalesOrderId, activePurchaseOrderId } = get();
        const activeId = isCustomer ? activeSalesOrderId : activePurchaseOrderId;
        return (
          orders.find(
            (order) => order.id === activeId && order.isCustomer === isCustomer,
          ) || orders.find((order) => order.isCustomer === isCustomer)
        );
      },

      syncProducts(products) {
        const { orders } = get();

        const productMap = new Map(products.map((p) => [p.id, p]));

        const updatedOrders = orders.map((order) => ({
          ...order,
          cart: order.cart.map((item) => {
            const product = productMap.get(item.id);

            if (!product) return item;

            // Avoid unnecessary state update
            if (item.price === product.price) return item;

            return {
              ...item,
              price: Math.max(0, product.price),
            };
          }),
        }));

        set({ orders: updatedOrders });
      },
    }),
    {
      name: "pos-orders-storage",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Migration: Ensure all existing orders have isCustomer flag
        state.orders = state.orders.map((o) => ({
          ...o,
          isCustomer: o.isCustomer ?? true,
        }));

        // Initialize activeSalesOrderId if not set
        if (
          !state.activeSalesOrderId ||
          !state.orders.find(
            (o) => o.id === state.activeSalesOrderId && o.isCustomer === true,
          )
        ) {
          state.activeSalesOrderId =
            state.orders.find((o) => o.isCustomer === true)?.id || "";
        }

        // Initialize activePurchaseOrderId if not set
        if (
          !state.activePurchaseOrderId ||
          !state.orders.find(
            (o) =>
              o.id === state.activePurchaseOrderId && o.isCustomer === false,
          )
        ) {
          state.activePurchaseOrderId =
            state.orders.find((o) => o.isCustomer === false)?.id || "";
        }
      },
    },
  ),
);
