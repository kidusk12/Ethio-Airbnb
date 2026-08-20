export function toTransactionDto(transaction) {
  return {
    id: transaction.id,
    transactionCode: transaction.transaction_code,
    type: transaction.type,
    counterpartyName: transaction.counterparty_name,
    amount: Number(transaction.amount),
    timestamp: transaction.created_at,
    bookingId: transaction.booking_id,
    performedByAdminId: transaction.performed_by_admin_id,
    performedByAdminName: transaction.performed_by_admin_name,
  };
}