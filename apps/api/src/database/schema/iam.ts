import { uuid, text, timestamp, boolean, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';
import { organizations } from './organizations.js';

export const users = karpos.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  oidcSubject: text('oidc_subject').unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  defaultLocale: text('default_locale').notNull().default('es-CO'),
  status: text('status').notNull().default('active'),
  mfaEnrolled: boolean('mfa_enrolled').notNull().default(false),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = karpos.table('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  permissions: text('permissions').array().notNull().default([]),
  isBuiltin: boolean('is_builtin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = karpos.table('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  status: text('status').notNull().default('active'),
  scopes: jsonb('scopes').notNull().default({}),
  invitedAt: timestamp('invited_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const apiKeys = karpos.table('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  hashedSecret: text('hashed_secret').notNull(),
  scopes: text('scopes').array().notNull().default([]),
  createdBy: uuid('created_by'),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
