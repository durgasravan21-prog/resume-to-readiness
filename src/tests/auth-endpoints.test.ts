import { describe, it, expect } from 'vitest';
import { POST as signoutPost } from '../../app/api/auth/signout/route';
import { POST as signupPost } from '../../app/api/auth/signup/route';
import { GET as rolesGet } from '../../app/api/roles/route';
import { GET as companiesGet } from '../../app/api/companies/route';
import { POST as verifyOtpPost } from '../../app/api/auth/verify-otp/route';
import { NextRequest } from 'next/server';

describe('Auth & Core API Endpoints Tests', () => {
  it('Signout API successfully handles POST request', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signout', {
      method: 'POST',
    });
    const res = await signoutPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('Signup API rejects request without valid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', password: 'password123', name: 'Test User' }),
    });
    const res = await signupPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('Signup API rejects password with less than 6 characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@nie.ac.in', password: '123', name: 'Test User' }),
    });
    const res = await signupPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/at least 6 characters/i);
  });

  it('Verify OTP API rejects missing credentials', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: '', token: '' }),
    });
    const res = await verifyOtpPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('Roles endpoint returns valid role benchmarks', async () => {
    const res = await rolesGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.roles).toBeDefined();
    expect(Array.isArray(body.roles)).toBe(true);
    expect(body.roles.length).toBeGreaterThan(0);
  });

  it('Companies endpoint returns valid hiring companies', async () => {
    const res = await companiesGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.companies).toBeDefined();
    expect(Array.isArray(body.companies)).toBe(true);
    expect(body.companies.length).toBeGreaterThan(0);
  });
});
