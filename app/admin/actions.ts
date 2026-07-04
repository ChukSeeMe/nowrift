'use server';

import prisma from '@/lib/db/prisma';
import { getAdminSession } from '@/lib/auth/jwt-edge';
import { hasPermission } from '@/lib/auth/rbac';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuditAction } from '@prisma/client';
import { authenticator } from '@otplib/preset-default';
import { cookies } from 'next/headers';
import { signAccessToken } from '@/lib/auth/jwt';

// Helper: set RLS context and verify permission
async function requirePermission(requiredRole: string) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }
  if (!hasPermission(session.role, requiredRole)) {
    throw new Error(`Requires ${requiredRole} role`);
  }
  
  await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.userId}, true)`;
  await prisma.$executeRaw`SELECT set_config('app.current_role', ${session.role}, true)`;
  
  return session;
}

// Helper: write to audit log
async function writeAuditLog(params: {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: params.userId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        before_state: params.before || undefined,
        after_state: params.after || undefined,
        ip_address: '127.0.0.1', // Mocked IP for local server action context
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// Article status transitions
export async function approveArticle(articleId: string) {
  const session = await requirePermission('editor');
  const before = await prisma.article.findUnique({ where: { id: articleId } });
  
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: 'published',
      approved_by: session.userId,
      published_at: new Date(),
    },
    include: {
      channel: true,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.article_approved,
    entityType: 'articles',
    entityId: articleId,
    before: before ? { status: before.status } : null,
    after: { status: 'published' },
  });

  revalidatePath(`/${updated.slug}`);
  revalidatePath('/');
  if (updated.channel?.slug) {
    revalidatePath(`/channels/${updated.channel.slug}`);
  }
  return { success: true };
}

export async function rejectArticle(articleId: string, reason: string) {
  const session = await requirePermission('editor');
  const before = await prisma.article.findUnique({ where: { id: articleId } });
  
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: { 
      status: 'draft',
    },
    include: {
      channel: true,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.article_retracted,
    entityType: 'articles',
    entityId: articleId,
    before: before ? { status: before.status } : null,
    after: { status: 'draft', rejection_reason: reason },
  });

  revalidatePath(`/${updated.slug}`);
  revalidatePath('/');
  return { success: true };
}

export async function retractArticle(articleId: string) {
  const session = await requirePermission('senior_editor');
  const before = await prisma.article.findUnique({ where: { id: articleId } });
  
  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      status: 'retracted',
      retracted_by: session.userId,
      retracted_at: new Date(),
    },
    include: {
      channel: true,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.article_retracted,
    entityType: 'articles',
    entityId: articleId,
    before: before ? { status: before.status } : null,
    after: { status: 'retracted' },
  });

  revalidatePath(`/${updated.slug}`);
  revalidatePath('/');
  return { success: true };
}

export async function updateArticleContent(
  articleId: string,
  data: {
    headline?: string;
    deck?: string;
    body_html?: string;
    channel_id?: string;
    is_breaking?: boolean;
    so_what_dev?: string;
    so_what_security?: string;
    so_what_founders?: string;
    so_what_creators?: string;
    so_what_data?: string;
    status?: any;
  }
) {
  const session = await requirePermission('editor');
  const before = await prisma.article.findUnique({ where: { id: articleId } });
  
  const updated = await prisma.article.update({
    where: { id: articleId },
    data,
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.article_created,
    entityType: 'articles',
    entityId: articleId,
    before: before || undefined,
    after: updated,
  });

  revalidatePath(`/${updated.slug}`);
  revalidatePath('/');
  return { success: true };
}

export async function createInviteToken(email: string, roleId: string) {
  const session = await requirePermission('admin');
  const token = await prisma.inviteToken.create({
    data: {
      email,
      role_id: roleId,
      created_by: session.userId,
    },
  });

  return { success: true, token: token.token };
}

export async function changeUserRole(userId: string, roleId: string) {
  const session = await requirePermission('admin');
  
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: userId, role_id: roleId } },
    update: { assigned_by: session.userId },
    create: { user_id: userId, role_id: roleId, assigned_by: session.userId },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.user_role_changed,
    entityType: 'users',
    entityId: userId,
    after: { role_id: roleId },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleAgentEnabled(agentName: string, enabled: boolean) {
  const session = await requirePermission('admin');
  
  await prisma.agentConfig.upsert({
    where: { agent_name: agentName as any },
    update: { is_enabled: enabled },
    create: { agent_name: agentName as any, is_enabled: enabled },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.agent_config_changed,
    entityType: 'agent_config',
    entityId: agentName,
    after: { is_enabled: enabled },
  });

  revalidatePath('/admin/agents');
  return { success: true };
}

export async function updatePaymentStatus(
  placementId: string,
  status: any
) {
  const session = await requirePermission('admin');
  
  await prisma.sponsorPlacement.update({
    where: { id: placementId },
    data: {
      payment_status: status,
      ...(status === 'paid' && { paid_at: new Date() }),
    },
  });

  revalidatePath('/admin/sponsors');
  return { success: true };
}

export async function createSponsor(data: {
  company_name: string;
  contact_name: string;
  contact_email: string;
  website_url: string;
  rate_per_slot: number;
}) {
  const session = await requirePermission('admin');
  
  const sponsor = await prisma.sponsor.create({
    data: {
      company_name: data.company_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      website_url: data.website_url,
      rate_per_slot: data.rate_per_slot,
      created_by: session.userId,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.sponsor_created,
    entityType: 'sponsors',
    entityId: sponsor.id,
    after: sponsor,
  });

  revalidatePath('/admin/sponsors');
  return { success: true };
}

export async function createGrant(data: {
  title: string;
  funder_name: string;
  funder_url?: string;
  status: any;
  funding_min?: number;
  funding_max?: number;
  currency: string;
  geo_scope: string[];
  sectors: string[];
  eligibility_tags: string[];
  summary: string;
  deadline?: Date;
  apply_url?: string;
  is_featured: boolean;
}) {
  const session = await requirePermission('editor');
  const slug = 'manual-' + data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().substring(8);
  
  const grant = await prisma.grant.create({
    data: {
      slug,
      title: data.title,
      funder_name: data.funder_name,
      funder_url: data.funder_url || null,
      status: data.status,
      funding_min: data.funding_min || null,
      funding_max: data.funding_max || null,
      currency: data.currency,
      geo_scope: data.geo_scope,
      sectors: data.sectors,
      eligibility_tags: data.eligibility_tags,
      summary: data.summary,
      deadline: data.deadline || null,
      apply_url: data.apply_url || null,
      is_featured: data.is_featured,
      created_by: session.userId,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.grant_created,
    entityType: 'grants',
    entityId: grant.id,
    after: grant,
  });

  revalidatePath('/admin/grants');
  revalidatePath('/grants');
  return { success: true };
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  const session = await requirePermission('admin');
  await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
  });
  
  await writeAuditLog({
    userId: session.userId,
    action: status === 'suspended' ? AuditAction.user_suspended : AuditAction.user_role_changed,
    entityType: 'users',
    entityId: userId,
    after: { status },
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function revokeUserSessions(userId: string) {
  const session = await requirePermission('admin');
  await prisma.refreshToken.updateMany({
    where: { user_id: userId, revoked: false },
    data: { revoked: true, revoked_at: new Date(), revoked_reason: 'admin_revoked' },
  });
  
  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.token_revoked,
    entityType: 'users',
    entityId: userId,
  });
  
  return { success: true };
}

export async function getTotpSecret() {
  const session = await requirePermission('visitor');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new Error('User not found');

  if (user.totp_enabled) {
    return { enabled: true };
  }

  let secret = user.totp_secret;
  if (!secret) {
    secret = authenticator.generateSecret();
    await prisma.user.update({
      where: { id: session.userId },
      data: { totp_secret: secret }
    });
  }

  const otpauth = authenticator.keyuri(user.email, 'NowRift', secret);
  return { enabled: false, secret, otpauth };
}

export async function verifyAndEnableTotp(code: string) {
  const session = await requirePermission('visitor');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.totp_secret) throw new Error('User TOTP not set up');

  const isValid = authenticator.verify({ token: code, secret: user.totp_secret });
  if (!isValid) {
    return { success: false, error: 'Invalid verification code' };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { totp_enabled: true }
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.user_totp_enabled,
    entityType: 'users',
    entityId: session.userId,
  });

  // Re-sign access token cookie to update totpEnabled payload to true!
  const cookieStore = await cookies();
  const accessToken = signAccessToken({
    userId: user.id,
    role: session.role,
    totpEnabled: true
  });
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15m
  });

  return { success: true };
}

export async function updateGrant(
  grantId: string,
  data: {
    title?: string;
    funder_name?: string;
    funder_url?: string;
    status?: any;
    funding_min?: number;
    funding_max?: number;
    currency?: string;
    geo_scope?: string[];
    sectors?: string[];
    eligibility_tags?: string[];
    summary?: string;
    deadline?: Date;
    apply_url?: string;
    is_featured?: boolean;
  }
) {
  const session = await requirePermission('editor');
  
  const grant = await prisma.grant.update({
    where: { id: grantId },
    data: {
      title: data.title,
      funder_name: data.funder_name,
      funder_url: data.funder_url || null,
      status: data.status,
      funding_min: data.funding_min || null,
      funding_max: data.funding_max || null,
      currency: data.currency,
      geo_scope: data.geo_scope,
      sectors: data.sectors,
      eligibility_tags: data.eligibility_tags,
      summary: data.summary,
      deadline: data.deadline || null,
      apply_url: data.apply_url || null,
      is_featured: data.is_featured,
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.grant_status_changed,
    entityType: 'grants',
    entityId: grant.id,
    after: grant,
  });

  revalidatePath('/admin/grants');
  revalidatePath('/grants');
  revalidatePath(`/grants/${grant.slug}`);
  return { success: true };
}

export async function signOut() {
  const session = await getAdminSession();
  if (session) {
    await prisma.refreshToken.updateMany({
      where: { user_id: session.userId, revoked: false },
      data: { revoked: true, revoked_at: new Date(), revoked_reason: 'sign_out' },
    });
  }
  redirect('/login');
}

export async function createTool(data: {
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  released_at?: Date | string;
}) {
  const session = await requirePermission('admin');
  
  const tool = await prisma.tool.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      url: data.url,
      icon: data.icon || 'IconCode',
      color: data.color || '#4FA3F5',
      released_at: data.released_at ? new Date(data.released_at) : new Date(),
    },
  });

  revalidatePath('/tools');
  revalidatePath('/admin/tools');
  return { success: true, tool };
}

export async function updateTool(id: string, data: {
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  released_at?: Date | string;
  is_active?: boolean;
}) {
  const session = await requirePermission('admin');
  
  const tool = await prisma.tool.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      url: data.url,
      icon: data.icon,
      color: data.color,
      is_active: data.is_active !== undefined ? data.is_active : true,
      released_at: data.released_at ? new Date(data.released_at) : undefined,
    },
  });

  revalidatePath('/tools');
  revalidatePath('/admin/tools');
  return { success: true, tool };
}

export async function deleteTool(id: string) {
  const session = await requirePermission('admin');
  
  await prisma.tool.delete({
    where: { id },
  });

  revalidatePath('/tools');
  revalidatePath('/admin/tools');
  return { success: true };
}

export async function createFounderInterview(data: {
  headline: string;
  deck: string;
  body_html: string;
  sectors: string[];
  read_time_minutes?: number;
}) {
  const session = await requirePermission('editor');
  
  // Clean headline to make slug
  const baseSlug = data.headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Ensure unique slug
  let slug = baseSlug;
  let exists = await prisma.article.findUnique({ where: { slug } });
  let count = 1;
  while (exists) {
    slug = `${baseSlug}-${count}`;
    exists = await prisma.article.findUnique({ where: { slug } });
    count++;
  }
  
  const wordCount = data.body_html.split(/\s+/).filter(Boolean).length;
  const readTime = data.read_time_minutes || Math.max(1, Math.round(wordCount / 200));

  const article = await prisma.article.create({
    data: {
      slug,
      headline: data.headline,
      deck: data.deck,
      body_html: data.body_html,
      content_tier: 'deep_dive',
      deep_dive_format: 'interview',
      is_human_authored: true,
      read_time_minutes: readTime,
      sectors: data.sectors,
      status: 'published',
      created_by: session.userId,
      published_at: new Date(),
    },
  });

  await writeAuditLog({
    userId: session.userId,
    action: AuditAction.article_created,
    entityType: 'articles',
    entityId: article.id,
    after: article,
  });

  revalidatePath('/deep-dives');
  revalidatePath(`/deep-dives/${slug}`);
  return { success: true, article };
}

