import { createSecureHeaders } from 'next-secure-headers';

export const securityHeaders = createSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  frameGuard: 'deny',
  noSniff: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  xssFilter: true,
  poweredByHeader: false,
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    interestCohort: [],
  },
}); 