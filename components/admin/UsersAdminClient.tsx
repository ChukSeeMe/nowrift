'use client';

import React, { useState } from 'react';
import { useAdminSession } from './AdminSessionProvider';
import { changeUserRole, updateUserStatus, revokeUserSessions, createInviteToken } from '@/app/admin/actions';
import { IconUsers, IconCopy, IconCheck } from '@tabler/icons-react';

interface UserRoleRelation {
  role: {
    id: string;
    name: string;
    hierarchy_level: number;
  };
}

interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  status: string;
  last_login_at: Date | string | null;
  user_roles: UserRoleRelation[];
}

interface RoleData {
  id: string;
  name: string;
  hierarchy_level: number;
}

interface UsersAdminClientProps {
  users: UserData[];
  roles: RoleData[];
}

export function UsersAdminClient({ users, roles }: UsersAdminClientProps) {
  const adminSession = useAdminSession();
  
  // Find current admin's role hierarchy level
  // Mock fallback to 1 (visitor) if not matched
  const adminRoleName = adminSession.role;
  const adminRoleInfo = roles.find(r => r.name.toLowerCase() === adminRoleName.toLowerCase());
  const adminLevel = adminRoleInfo?.hierarchy_level ?? 1;

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRoleId) {
      alert('Email and Role are required');
      return;
    }
    setLoading(true);
    try {
      const res = await createInviteToken(inviteEmail, inviteRoleId);
      if (res.success && res.token) {
        const url = `${window.location.origin}/invite?token=${res.token}`;
        setInviteLink(url);
        setInviteEmail('');
      } else {
        alert('Failed to generate invite');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during invite generation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (userId: string, currentRoleId: string, newRoleId: string) => {
    if (newRoleId === currentRoleId) return;
    
    const targetRole = roles.find(r => r.id === newRoleId);
    if (!targetRole) return;
    
    // Prevent privilege escalation: Cannot assign a role higher than own level
    if (targetRole.hierarchy_level > adminLevel) {
      alert('Error: You cannot assign a role higher than your own privilege level.');
      return;
    }

    if (!confirm('Are you sure you want to change this user\'s role?')) return;

    setLoading(true);
    try {
      const res = await changeUserRole(userId, newRoleId);
      if (res.success) {
        alert('User role updated!');
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`Are you sure you want to set this user status to ${nextStatus.toUpperCase()}?`)) return;

    setLoading(true);
    try {
      const res = await updateUserStatus(userId, nextStatus);
      if (res.success) {
        alert(`User status set to ${nextStatus}`);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke all active sessions for this user? This will log them out immediately.')) return;

    setLoading(true);
    try {
      const res = await revokeUserSessions(userId);
      if (res.success) {
        alert('All active sessions for this user have been revoked.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke sessions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8 flex-col lg:flex-row">
      {/* Left section: Users list (65% width) */}
      <div className="flex-1 space-y-6">
        <div className="border border-border rounded-xl bg-surface overflow-hidden">
          <div className="p-5 border-b border-border/80 bg-near-black/20">
            <h2 className="text-display-m text-off-white font-bold flex items-center gap-2">
              <IconUsers size={20} className="text-muted" />
              Registered Accounts
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">User / Email</th>
                  <th className="p-4 font-bold">Role Badge</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Last Login</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userRoleRelation = user.user_roles?.[0];
                  const currentRoleId = userRoleRelation?.role?.id || '';
                  const currentRoleName = userRoleRelation?.role?.name || 'visitor';
                  const currentRoleLevel = userRoleRelation?.role?.hierarchy_level || 1;

                  const displayName = user.display_name || user.email.split('@')[0];
                  const initials = displayName.substring(0, 2).toUpperCase();

                  const statusColor = 
                    user.status === 'active' ? 'text-grant-green border-grant-green/20 bg-grant-green/5' :
                    user.status === 'suspended' ? 'text-rift-red border-rift-red/20 bg-rift-red/5' :
                    'text-muted border-border bg-border/20';

                  // User is editable if:
                  // Admin level is greater than the target user's level (cannot modify own role or super admins if lower)
                  const isEditable = adminLevel > currentRoleLevel || adminSession.userId === user.id;

                  return (
                    <tr key={user.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-border/80 text-off-white font-bold flex items-center justify-center text-xs shrink-0 select-none">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-off-white/95 leading-normal">{displayName}</span>
                            <span className="text-body-m text-muted leading-tight">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {isEditable && user.id !== adminSession.userId ? (
                          <select
                            value={currentRoleId}
                            onChange={(e) => handleRoleChange(user.id, currentRoleId, e.target.value)}
                            disabled={loading}
                            className="bg-surface border border-border rounded px-2 py-1 text-body-m text-off-white outline-none cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option 
                                key={r.id} 
                                value={r.id}
                                disabled={r.hierarchy_level > adminLevel} // Prevent selecting a role higher than own level
                              >
                                {r.name.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#1A1A24] border border-border text-muted uppercase rounded">
                            {currentRoleName}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-label font-mono font-bold border ${statusColor}`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="p-4 text-body-m text-muted font-mono">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'
                        }
                      </td>

                      <td className="p-4 text-right">
                        {user.id !== adminSession.userId && isEditable ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={loading}
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              className={`px-2.5 py-1 text-label font-bold border rounded transition-all cursor-pointer ${
                                user.status === 'suspended'
                                  ? 'border-grant-green/40 text-grant-green hover:bg-grant-green/10'
                                  : 'border-rift-red/40 text-rift-red hover:bg-rift-red/10'
                              }`}
                            >
                              {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => handleRevokeSessions(user.id)}
                              className="px-2.5 py-1 text-label font-bold border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded transition-all cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-body-m text-muted/50 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right section: Invite Panel (35% width) */}
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="p-6 rounded-xl border border-border bg-surface/50 space-y-6">
          <div>
            <h3 className="text-display-m text-off-white font-bold">Invite Administrator</h3>
            <p className="text-body-m text-muted leading-relaxed mt-1">
              Generate a temporary registration link for new platform editorial staff.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-label text-muted font-bold">Staff Email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="editor@nowrift.dev"
                className="bg-near-black border border-border rounded-lg px-4 py-2 text-body-m text-off-white outline-none focus:border-border/80"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label text-muted font-bold">Assigned Role</label>
              <select
                value={inviteRoleId}
                onChange={(e) => setInviteRoleId(e.target.value)}
                required
                className="bg-near-black border border-border rounded-lg px-4 py-2.5 text-body-m text-off-white outline-none focus:border-border/80 cursor-pointer"
              >
                <option value="">Select Role...</option>
                {roles.map((role) => (
                  <option 
                    key={role.id} 
                    value={role.id}
                    disabled={role.hierarchy_level > adminLevel} // Prevent selecting a role higher than own level
                  >
                    {role.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-label font-bold bg-off-white hover:bg-off-white/90 text-near-black rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Generate Invite Link
            </button>
          </form>

          {inviteLink && (
            <div className="p-4 border border-border bg-[#0d0d14] rounded-lg space-y-2">
              <span className="text-xs text-muted block">Temporary Invite URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="bg-near-black border border-border rounded px-2 py-1 text-xs text-muted select-all w-full outline-none"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-1.5 border border-border hover:border-off-white/20 text-muted hover:text-off-white rounded transition-all cursor-pointer"
                >
                  {copied ? <IconCheck size={14} className="text-grant-green" /> : <IconCopy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersAdminClient;
