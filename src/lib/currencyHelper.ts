export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
  }).format(amount);
};
