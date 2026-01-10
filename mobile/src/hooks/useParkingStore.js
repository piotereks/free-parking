import { createParkingStore } from "parking-shared";
import { createMobileStorageAdapter } from "../adapters/mobileStorageAdapter";
import { createMobileFetchAdapter } from "../adapters/mobileFetchAdapter";

const adapters = {
  storage: createMobileStorageAdapter(),
  fetch: createMobileFetchAdapter(),
  logger: console,
};

export const useParkingStore = createParkingStore(adapters);

export default useParkingStore;
