export interface PayArgs {
  amount: string;
  orderId: string;
  recipient: string;
  // optional permit fields
  deadline?: number;
  v?: number;
  r?: string;
  s?: string;
}
