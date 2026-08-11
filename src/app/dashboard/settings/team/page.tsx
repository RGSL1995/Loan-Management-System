"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, UserPlus, Mail, Shield, CheckCircle2, AlertTriangle, Loader2, Edit3, Trash2, Power, Send, Copy, Check, Lock } from "lucide-react";
import { inviteTeamMember, getTeamMembers, updateTeamMember, deleteTeamMember } from "@/app/actions/team";
import { inviteSchema, type InviteValues } from "@/lib/schemas/team";
import { ROLE_DESCRIPTIONS } from "@/components/ProfileDrawer";

// Fallback Mock Data if table is empty
const fallbackTeam = [
  { id: "1", full_name: "Mohit Kumawat", email: "admin@finbyx.com", role: "tenant_admin", is_active: true },
  { id: "2", full_name: "Amit Sharma", email: "amit.s@finbyx.com", role: "credit_manager", is_active: true },
  { id: "3", full_name: "Priya Patel", email: "priya.p@finbyx.com", role: "loan_officer", is_active: true },
  { id: "4", full_name: "Rahul Singh", email: "rahul.s@finbyx.com", role: "collections_officer", is_active: true },
  { id: "5", full_name: "Neha Gupta", email: "neha.g@finbyx.com", role: "operations_officer", is_active: false },
];

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function TeamSettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Created Credentials State for Confirmation Dialog
  const [createdCredentials, setCreatedCredentials] = useState<{
    userEmail: string;
    deliveryEmail: string;
    password: string;
    role: string;
    emailSent?: boolean;
  } | null>(null);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Form states for edit
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "loan_officer",
      deliveryEmail: "",
    },
  });
  const selectedRole = watch("role");

  const loadTeam = async () => {
    setIsLoading(true);
    const res = await getTeamMembers();
    if (res.data && res.data.length > 0) {
      setTeam(res.data.map(m => ({
        id: m.id,
        full_name: m.full_name || m.email?.split("@")[0] || "User",
        email: m.email || "",
        role: m.role || "loan_officer",
        is_active: m.is_active !== false,
      })));
    } else {
      setTeam(fallbackTeam);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const onInviteSubmit = (data: InviteValues) => {
    setError(null);
    setSuccess(null);
    setCreatedCredentials(null);
    startTransition(async () => {
      const result = await inviteTeamMember(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || "Invite sent successfully.");
        if (result.credentials) {
          setCreatedCredentials(result.credentials);
        }
        reset();
        await loadTeam();
      }
    });
  };

  const handleCopyPassword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditName(member.full_name);
    setEditRole(member.role);
    setEditIsActive(member.is_active);
    setError(null);
    setSuccess(null);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateTeamMember(editingMember.id, {
        fullName: editName,
        role: editRole,
        isActive: editIsActive,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Team member updated successfully.");
        await loadTeam();
        setTimeout(() => setEditingMember(null), 1200);
      }
    });
  };

  const handleDeleteMember = (userId: string) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await deleteTeamMember(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Team member deleted successfully.");
        setDeletingMemberId(null);
        setEditingMember(null);
        await loadTeam();
      }
    });
  };

  const getRoleBadge = (role: string) => {
    const roleBadges: Record<string, { label: string; classes: string }> = {
      super_admin: { label: "Super Admin", classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      platform_admin: { label: "Platform Admin", classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
      tenant_admin: { label: "Tenant Admin", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
      loan_officer: { label: "Loan Officer", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      credit_manager: { label: "Credit Manager", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      operations_officer: { label: "Ops Officer", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
      collections_officer: { label: "Collections", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
      recovery_officer: { label: "Recovery", classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
      finance_officer: { label: "Finance", classes: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
      compliance_officer: { label: "Compliance", classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
      auditor: { label: "Auditor", classes: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400" },
    };
    const badge = roleBadges[role];
    if (!badge) return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">{role}</span>;
    return <span className={`${badge.classes} px-2 py-0.5 rounded text-[10px] font-bold`}>{badge.label}</span>;
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-100 dark:bg-slate-800 rounded-md text-gray-500 dark:text-slate-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Team Management</h1>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">Manage staff roles, status, and system permissions.</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsInviteModalOpen(true); setSuccess(null); setError(null); }}
          className="h-8 px-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium rounded flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Invite Member
        </button>
      </div>

      {/* Staff Roster */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading team members...
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-slate-300">Employee</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-slate-300">Role</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-slate-300">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-600 dark:text-slate-400 uppercase">
                            {member.full_name ? member.full_name.charAt(0) : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-slate-100">{member.full_name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4">
                        {member.is_active ? (
                          <span className="text-green-600 dark:text-green-500 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                            <Power className="w-3.5 h-3.5 text-red-500" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3 items-center">
                        <button 
                          onClick={() => handleOpenEdit(member)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px] flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Invite New Employee
              </h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2 text-red-800 dark:text-red-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 flex items-start gap-2 text-green-800 dark:text-green-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {createdCredentials ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" /> Account Created & Credentials Dispatched
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                        Dispatched
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-slate-400 block">User Login Email</span>
                      <p className="text-xs font-mono font-bold text-gray-900 dark:text-slate-100">{createdCredentials.userEmail}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-slate-400 block">Recipient Email Address</span>
                      <p className="text-xs font-mono text-gray-800 dark:text-slate-200">{createdCredentials.deliveryEmail}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-gray-500 dark:text-slate-400 block">Auto-Generated Systematic Password</span>
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded border border-gray-200 dark:border-slate-800 mt-1">
                        <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{createdCredentials.password}</code>
                        <button 
                          onClick={() => handleCopyPassword(createdCredentials.password)}
                          className="p-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                          title="Copy Password"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => {
                        setCreatedCredentials(null);
                        setSuccess(null);
                        setIsInviteModalOpen(false);
                      }}
                      className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-5 py-2 rounded-md text-xs font-bold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                    <input 
                      type="text" 
                      {...register("fullName")} 
                      className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100" 
                      placeholder="e.g. Jane Doe"
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3"/> User Email Address *</label>
                    <input 
                      type="email" 
                      {...register("email")} 
                      className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100" 
                      placeholder="jane@finbyx.com"
                    />
                    {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Send className="w-3 h-3 text-indigo-500"/> Recipient Email Address *</label>
                    <input 
                      type="email" 
                      {...register("deliveryEmail")} 
                      className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100" 
                      placeholder="recipient@example.com"
                    />
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Login credentials and initial password will be sent to this email address.</p>
                    {errors.deliveryEmail && <p className="text-[10px] text-red-500 mt-1">{errors.deliveryEmail.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Shield className="w-3 h-3"/> RBAC Role</label>
                    <select 
                      {...register("role")} 
                      className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100"
                    >
                      <option value="loan_officer">Loan Officer (Origination)</option>
                      <option value="credit_manager">Credit Manager (Underwriting)</option>
                      <option value="operations_officer">Operations Officer (Disbursement)</option>
                      <option value="collections_officer">Collections Officer</option>
                      <option value="recovery_officer">Recovery Officer</option>
                      <option value="finance_officer">Finance Officer</option>
                      <option value="compliance_officer">Compliance Officer</option>
                      <option value="auditor">Auditor (Read-Only)</option>
                      <option value="tenant_admin">Tenant Admin (Full Access)</option>
                    </select>
                    {selectedRole && ROLE_DESCRIPTIONS[selectedRole] && (
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1.5 leading-snug">{ROLE_DESCRIPTIONS[selectedRole]}</p>
                    )}
                    {errors.role && <p className="text-[10px] text-red-500 mt-1">{errors.role.message}</p>}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isPending}
                      className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-5 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      Create User & Dispatch Email
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Team Member
              </h2>
              <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
            </div>
            
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 rounded bg-green-50 border border-green-200 flex items-start gap-2 text-green-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  type="text" 
                  disabled 
                  value={editingMember.email} 
                  className="w-full h-9 px-3 text-xs bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-slate-300 mb-1">Assigned RBAC Role</label>
                <select 
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-black dark:focus:border-white transition-colors text-gray-900 dark:text-slate-100"
                >
                  <option value="loan_officer">Loan Officer (Origination)</option>
                  <option value="credit_manager">Credit Manager (Underwriting)</option>
                  <option value="operations_officer">Operations Officer (Disbursement)</option>
                  <option value="collections_officer">Collections Officer</option>
                  <option value="recovery_officer">Recovery Officer</option>
                  <option value="finance_officer">Finance Officer</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="auditor">Auditor (Read-Only)</option>
                  <option value="tenant_admin">Tenant Admin (Full Access)</option>
                  <option value="super_admin">Super Admin (Platform Access)</option>
                </select>
                {editRole && ROLE_DESCRIPTIONS[editRole] && (
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1.5 leading-snug">{ROLE_DESCRIPTIONS[editRole]}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100">Account Active Status</p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Deactivated users are blocked at middleware.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${editIsActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}
                >
                  {editIsActive ? "Active" : "Deactivated"}
                </button>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-800">
                {deletingMemberId === editingMember.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-600 font-bold">Confirm delete?</span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteMember(editingMember.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingMemberId(null)}
                      className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-xs rounded"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingMemberId(editingMember.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Member
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setEditingMember(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={isPending}
                    onClick={handleUpdateMember}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

