import { success } from '../../utils/apiResponse.js';
import { toTransactionDto } from './transaction.dto.js';
import * as transactionService from './transaction.service.js';

export async function allTransactions(req, res, next) {
  try {
    const transactions = await transactionService.getAllTransactions();

    return success(res, {
      data: { transactions: transactions.map(toTransactionDto) },
    });
  } catch (error) {
    return next(error);
  }
}