export const normalizeTerminalStatus = (status) => {
  const raw = String(status ?? '').trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase();
  const containsAny = (values) => values.some((value) => normalized.includes(value));

  if (containsAny(['approved', 'success', 'succeeded', 'paid', 'completed', 'settled'])) {
    return 'Approved';
  }

  if (containsAny(['declined', 'rejected', 'denied', 'not_approved', 'failed'])) {
    return 'Declined';
  }

  if (containsAny(['cancelled', 'canceled', 'aborted', 'voided', 'user_cancelled'])) {
    return 'Cancelled';
  }

  if (containsAny(['error', 'exception', 'timeout', 'timed_out', 'timedout'])) {
    return 'Error';
  }

  if (containsAny(['reversed', 'refunded', 'refund'])) {
    return 'Reversed';
  }

  return raw;
};

export const isTerminalSuccessStatus = (status) => {
  const normalized = normalizeTerminalStatus(status);
  return ['Approved'].includes(normalized);
};

export const isTerminalFinalStatus = (status) => {
  const normalized = normalizeTerminalStatus(status);
  return ['Approved', 'Declined', 'Cancelled', 'Error', 'Reversed'].includes(normalized);
};
