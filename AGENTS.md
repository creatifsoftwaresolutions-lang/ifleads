# AGENTS.md

> **Read this before writing any code.**
>
> This document defines the rules, conventions, and guardrails that every
> AI coding agent (and human developer) must follow when contributing to
> this CRM codebase.
>
> Violating these rules will break security, data isolation, and the audit
> trail.

---

## 🎯 Project Summary

This is a **multi-tenant, enterprise-grade CRM** with:

- **AI Assistant** (natural-language + voice) that executes CRM actions
- **Role-Based Access Control** (RBAC) with 5 roles and 138 permissions
- **Data scoping** enforced at the database query level
- **Omnichannel lead capture** (WhatsApp + Meta)
- **Full audit trail** on every mutation

The system is built on a **trust-nothing-frontend** principle:

> The backend enforces everything. The frontend only reflects what the
> backend allows.

---

## 🚨 The 10 Non-Negotiable Rules

These rules are absolute. No exceptions, no shortcuts, no "just this once."

### 1. Never trust the frontend for authorization

The frontend can hide buttons, filter lists, and gate routes — but this is
**UX only**.

Every protected API request MUST independently:

- Verify the JWT
- Load the user
- Check account status
- Check role
- Check permission
- Check data scope

**Test:** A user who edits `localStorage`, opens Postman, or modifies the
API request MUST still get `401` / `403`.

---

### 2. Never store secrets, tokens, or passwords in the frontend

- ❌ No `localStorage.setItem('token', ...)`
- ❌ No `sessionStorage` for auth
- ❌ No API keys in `.env` on the frontend
- ❌ No hardcoded credentials
- ❌ No JWT decoding on the client to make security decisions

Auth uses **HTTP-only cookies**. The frontend never sees the raw token.

---

### 3. Every protected route runs the full pipeline

Order is fixed. Do not reorder, skip, or combine steps.
