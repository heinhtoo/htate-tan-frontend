export type SettingResponse = {
  type: KeyValueType;
  key: string;
  value: string;
};

export enum KeyValueType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  TIME = "TIME",
  DATETIME = "DATETIME",
  ARRAY = "ARRAY",
}

export enum SettingKey {
  StockSetting = "STOCK_SETTING",
  LimitSetting = "LIMIT_SETTING",
}
