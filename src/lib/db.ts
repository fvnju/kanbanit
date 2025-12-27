import { openDB } from "idb";

const DB_NAME = "kanban-db";
const STORE_NAME = "board-store";

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const setData = async (key: string, value: any) => {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
};

export const getData = async (key: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, key);
};
