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
}

// Store state and actions
interface PosStoreState {
  orders: PosOrder[];
  activeOrderId: string;
  lastUpdatedAt: string;
  setLastUpdatedAt: (lastUpdatedAt: string) => void;

  // Order management
  createOrder: () => void;
  switchOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;

  // Cart operations
  addToCart: (
    product: ProductResponse,
    multiplier: number,
    unitName: string,
  ) => void;
  updateCartQty: (productId: number, delta: number, unitName: string) => void;
  setCartItemQty: (productId: number, qty: number, unitName: string) => void;
  updateCartItemPrice: (
    productId: number,
    price: number,
    unitName: string,
  ) => void;
  removeFromCart: (productId: number, unitName: string) => void;

  // Customer operations
  setCustomer: (customer: CustomerResponse | null) => void;

  // Checkout details operations
  setCarGate: (carGateId: number | undefined) => void;
  addOtherCharge: (charge: {
    otherChargeId: number;
    amount: number;
    name: string;
  }) => void;
  updateOtherChargeAmount: (otherChargeId: number, amount: number) => void;
  removeOtherCharge: (otherChargeId: number) => void;
  addPaymentMethod: (payment: {
    paymentMethodId: number;
    amount: number;
    referenceId?: string;
    name: string;
    paymentQR: string;
    showValue: boolean;
  }) => void;
  updatePayment: (
    paymentMethodId: number,
    data: Partial<{ amount: number; referenceId: string }>,
  ) => void;
  removePayment: (paymentMethodId: number) => void;
  setRemark: (remark: string) => void;
  setGlobalDiscount: (discount: number) => void;

  // Clear order after checkout
  clearActiveOrder: () => void;

  // Getters
  getActiveOrder: () => PosOrder | undefined;
  syncProducts: (products: ProductResponse[]) => void;
}

// Helper to create a new empty order
const createEmptyOrder = (orderNumber: number): PosOrder => ({
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
});

export const usePosStore = create<PosStoreState>()(
  persist(
    (set, get) => ({
      orders: [createEmptyOrder(1)],
      activeOrderId: "",
      lastUpdatedAt: "",
      setLastUpdatedAt(lastUpdatedAt) {
        set({ lastUpdatedAt });
      },

      // Initialize activeOrderId after hydration
      createOrder: () => {
        const { orders } = get();
        const newOrder = createEmptyOrder(orders.length + 1);
        set({
          orders: [...orders, newOrder],
          activeOrderId: newOrder.id,
        });
      },

      switchOrder: (orderId: string) => {
        set({ activeOrderId: orderId });
      },

      deleteOrder: (orderId: string) => {
        const { orders, activeOrderId } = get();

        // Don't allow deleting the last order
        if (orders.length === 1) {
          return;
        }

        const updatedOrders = orders.filter((order) => order.id !== orderId);

        // If deleting the active order, switch to the first remaining order
        const newActiveOrderId =
          activeOrderId === orderId ? updatedOrders[0].id : activeOrderId;

        set({
          orders: updatedOrders,
          activeOrderId: newActiveOrderId,
        });
      },

      addToCart: (
        product: ProductResponse,
        multiplier: number,
        unitName: string,
      ) => {
        const { orders, activeOrderId } = get();

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

      updateCartQty: (productId: number, delta: number, unitName: string) => {
        const { orders, activeOrderId } = get();

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

      setCartItemQty: (productId: number, qty: number, unitName: string) => {
        const { orders, activeOrderId } = get();

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
      ) => {
        const { orders, activeOrderId } = get();

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

      removeFromCart: (productId: number, unitName: string) => {
        const { orders, activeOrderId } = get();

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

      setCustomer: (customer: CustomerResponse | null) => {
        const { orders, activeOrderId } = get();

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return { ...order, selectedCustomer: customer };
        });

        set({ orders: updatedOrders });
      },

      setCarGate: (carGateId: number | undefined) => {
        const { orders, activeOrderId } = get();

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return {
            ...order,
            checkoutDetails: { ...order.checkoutDetails, carGateId },
          };
        });

        set({ orders: updatedOrders });
      },

      addOtherCharge: (charge) => {
        const { orders, activeOrderId } = get();

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

      updateOtherChargeAmount: (otherChargeId: number, amount: number) => {
        const { orders, activeOrderId } = get();

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

      removeOtherCharge: (otherChargeId: number) => {
        const { orders, activeOrderId } = get();

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

      addPaymentMethod: (payment) => {
        const { orders, activeOrderId } = get();

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

      updatePayment: (paymentMethodId: number, data) => {
        const { orders, activeOrderId } = get();

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

      removePayment: (paymentMethodId: number) => {
        const { orders, activeOrderId } = get();

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

      setRemark: (remark: string) => {
        const { orders, activeOrderId } = get();

        const updatedOrders = orders.map((order) => {
          if (order.id !== activeOrderId) return order;
          return {
            ...order,
            checkoutDetails: { ...order.checkoutDetails, remark },
          };
        });

        set({ orders: updatedOrders });
      },

      setGlobalDiscount: (discount: number) => {
        const { orders, activeOrderId } = get();

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

      clearActiveOrder: () => {
        const { orders, activeOrderId } = get();

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

      getActiveOrder: () => {
        const { orders, activeOrderId } = get();
        return orders.find((order) => order.id === activeOrderId);
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
        // Set activeOrderId to first order if not set
        if (
          state &&
          (!state.activeOrderId ||
            !state.orders.find((o) => o.id === state.activeOrderId))
        ) {
          state.activeOrderId = state.orders[0]?.id || "";
        }
      },
    },
  ),
);
