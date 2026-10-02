import { describe, it, expect } from 'vitest';
import { isAllowedDomain, sanitizeRedirectUrl } from '../server/auth/config';

describe('Authentication & Domain Restriction', () => {
  it('accepts valid email under the allowed domain', () => {
    expect(isAllowedDomain('aarav.sundaram@nie.ac.in', 'nie.ac.in')).toBe(true);
  });

  it('accepts uppercase email domain variants', () => {
    expect(isAllowedDomain('AARAV@NIE.AC.IN', 'nie.ac.in')).toBe(true);
    expect(isAllowedDomain('student@Nie.Ac.In', 'nie.ac.in')).toBe(true);
  });

  it('accepts plus-addressing within allowed domain', () => {
    expect(isAllowedDomain('aarav+internship@nie.ac.in', 'nie.ac.in')).toBe(true);
  });

  it('rejects disallowed domains (gmail, yahoo, outlook)', () => {
    expect(isAllowedDomain('attacker@gmail.com', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('student@yahoo.co.in', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('hacker@outlook.com', 'nie.ac.in')).toBe(false);
  });

  it('rejects lookalike and suffix attack domains', () => {
    expect(isAllowedDomain('student@nie.ac.in.attacker.com', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('student@fake-nie.ac.in', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('student@nie.ac.in.co', 'nie.ac.in')).toBe(false);
  });

  it('rejects malformed email strings', () => {
    expect(isAllowedDomain('', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('invalid-email', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('@nie.ac.in', 'nie.ac.in')).toBe(false);
    expect(isAllowedDomain('user@nie.ac.in@evil.com', 'nie.ac.in')).toBe(false);
  });
});

describe('Open Redirect Prevention', () => {
  it('permits valid internal relative paths', () => {
    expect(sanitizeRedirectUrl('/home')).toBe('/home');
    expect(sanitizeRedirectUrl('/tpc')).toBe('/tpc');
    expect(sanitizeRedirectUrl('/analyses/new')).toBe('/analyses/new');
  });

  it('neutralizes protocol-relative external URLs', () => {
    expect(sanitizeRedirectUrl('//evil.com')).toBe('/home');
    expect(sanitizeRedirectUrl('//google.com/phishing')).toBe('/home');
  });

  it('neutralizes absolute external URLs', () => {
    expect(sanitizeRedirectUrl('https://evil.com/login')).toBe('/home');
    expect(sanitizeRedirectUrl('http://attacker.org')).toBe('/home');
    expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/home');
  });

  it('defaults to fallback if invalid or empty target', () => {
    expect(sanitizeRedirectUrl('')).toBe('/home');
    expect(sanitizeRedirectUrl(null as any)).toBe('/home');
  });
});
