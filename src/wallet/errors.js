import i18n from '../i18n/config';

/**
 * @typedef {Object} WalletErrorOptions
 * @property {string} code
 * @property {string} userMessage
 * @property {unknown} [cause]
 * @property {Record<string, unknown>} [details]
 * @property {boolean} [retriable]
 */

/**
 * Standardized wallet error model used across adapters and context.
 */
export class WalletOperationError extends Error {
  /**
   * @param {string} message
   * @param {WalletErrorOptions} options
   */
  constructor(message, options) {
    super(message);
    this.name = 'WalletOperationError';
    this.code = options.code;
    this.userMessage = options.userMessage;
    this.cause = options.cause;
    this.details = options.details || {};
    this.retriable = Boolean(options.retriable);
  }
}

/**
 * @param {unknown} error
 * @param {string} fallbackCode
 * @param {string} fallbackUserMessage
 * @returns {WalletOperationError}
 */
export const normalizeWalletError = (error, fallbackCode, fallbackUserMessage) => {
  if (error instanceof WalletOperationError) {
    return error;
  }
  const errorCode = typeof error === 'object' && error !== null ? error.code : undefined;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (errorCode === 4001 || errorCode === '4001') {
    return new WalletOperationError(message, {
      code: 'USER_REJECTED',
      userMessage: i18n.t('wallet_errors.user_rejected'),
      cause: error,
      retriable: false
    });
  }
  if (errorCode === -32002 || errorCode === '-32002' || lower.includes('already processing') || lower.includes('already pending')) {
    return new WalletOperationError(message, {
      code: 'REQUEST_PENDING',
      userMessage: i18n.t('wallet_errors.request_pending'),
      cause: error,
      retriable: false
    });
  }
  const isRejected = lower.includes('reject') || lower.includes('denied') || lower.includes('cancel') || lower.includes('close') || lower.includes('closed');
  if (isRejected) {
    return new WalletOperationError(message, {
      code: 'USER_REJECTED',
      userMessage: i18n.t('wallet_errors.user_rejected'),
      cause: error,
      retriable: false
    });
  }
  return new WalletOperationError(message, {
    code: fallbackCode,
    userMessage: fallbackUserMessage,
    cause: error,
    retriable: true
  });
};

/**
 * @param {() => Promise<any>} operation
 * @param {{ retries?: number, retryDelayMs?: number, shouldRetry?: (error: WalletOperationError) => boolean }} [options]
 * @returns {Promise<any>}
 */
export const withRetry = async (operation, options = {}) => {
  const retries = typeof options.retries === 'number' ? options.retries : 1;
  const retryDelayMs = typeof options.retryDelayMs === 'number' ? options.retryDelayMs : 250;
  const shouldRetry = typeof options.shouldRetry === 'function'
    ? options.shouldRetry
    : (error) => error.retriable;
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const normalized = error instanceof WalletOperationError
        ? error
        : normalizeWalletError(error, 'WALLET_OPERATION_FAILED', i18n.t('wallet_errors.operation_failed'));
      lastError = normalized;
      if (attempt >= retries || !shouldRetry(normalized)) {
        throw normalized;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  throw lastError;
};
