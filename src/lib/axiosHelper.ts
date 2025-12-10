export function addExtraData<T>(data: T) {
  return {
    nonce: "string",
    payload: data,
  };
}
