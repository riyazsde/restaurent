import {
  isTerminalFinalStatus,
  isTerminalSuccessStatus,
  normalizeTerminalStatus,
} from './terminalStatus';

describe('terminal payment status normalization', () => {
  it('accepts backend success aliases used by the Z500C flow', () => {
    expect(normalizeTerminalStatus('Success')).toBe('Approved');
    expect(normalizeTerminalStatus('paid')).toBe('Approved');
    expect(normalizeTerminalStatus('SETTLED')).toBe('Approved');
    expect(normalizeTerminalStatus('Payment failed')).toBe('Declined');
    expect(isTerminalSuccessStatus('Success')).toBe(true);
    expect(isTerminalSuccessStatus('Paid')).toBe(true);
  });

  it('treats final error and reversal states as terminal completion', () => {
    expect(normalizeTerminalStatus('Declined')).toBe('Declined');
    expect(normalizeTerminalStatus('cancelled')).toBe('Cancelled');
    expect(normalizeTerminalStatus('reversed')).toBe('Reversed');
    expect(isTerminalFinalStatus('Cancelled')).toBe(true);
    expect(isTerminalFinalStatus('Pending')).toBe(false);
  });
});
