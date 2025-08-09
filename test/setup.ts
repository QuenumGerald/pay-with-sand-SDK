import '@testing-library/jest-dom';

// Polyfill fetch Headers/Response for Node < 18 if needed by tests
// Vitest in Node 18+ has fetch, Headers, Response available. If not, you can add cross-fetch.
