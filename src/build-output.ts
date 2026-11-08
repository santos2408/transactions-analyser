const ReasonType = {
  INVALID_RECORD: "INVALID_RECORD",
  INVALID_ID: "INVALID_ID",
  INVALID_TYPE: "INVALID_TYPE",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  INVALID_CATEGORY: "INVALID_CATEGORY",
  INVALID_ACCOUNT: "INVALID_ACCOUNT",
  INVALID_DATE: "INVALID_DATE",
  DUPLICATED_ID: "DUPLICATED_ID",
} as const;

type ReasonType = (typeof ReasonType)[keyof typeof ReasonType];

type Output = {
  sourceFile: string;
  counts: { received: number; accepted: number; rejected: number };
  totals: { incomeInCents: number; expenseInCents: number; balanceInCents: number };
  byCategory: { key: string; incomeInCents: number; expenseInCents: number; balanceInCents: number }[];
  byAccount: { key: string; incomeInCents: number; expenseInCents: number; balanceInCents: number }[];
  acceptedTransactions: { id: string; type: string; amountInCents: number; category: string; account: string; occurredAt: Date }[];
  rejections: { position: number; reason: ReasonType }[];
};

export class BuildOutput {
  private sourceFile: string;
  private counts: { received: number; accepted: number; rejected: number };
  private totals: { incomeInCents: number; expenseInCents: number; balanceInCents: number };
  private byCategory: { key: string; incomeInCents: number; expenseInCents: number; balanceInCents: number }[];
  private byAccount: { key: string; incomeInCents: number; expenseInCents: number; balanceInCents: number }[];
  private acceptedTransactions: { id: string; type: string; amountInCents: number; category: string; account: string; occurredAt: Date }[];
  private rejections: { position: number; reason: ReasonType }[];

  constructor() {
    this.sourceFile = "";
    this.counts = { received: 0, accepted: 0, rejected: 0 };
    this.totals = { incomeInCents: 0, expenseInCents: 0, balanceInCents: 0 };
    this.byCategory = [];
    this.byAccount = [];
    this.acceptedTransactions = [];
    this.rejections = [];
  }

  setSourceFile(name: string) {
    this.sourceFile = name;
  }

  toJson() {
    return JSON.stringify({
      sourceFile: this.sourceFile,
    });
  }
}
