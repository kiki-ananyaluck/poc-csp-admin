export type SrmListTabKey = 'queue' | 'my-work' | 'in-progress' | 'all';

export interface SrmRoleConfig {
  adminMakerRoleId: string;
  adminApproverRoleId: string;
}

export interface SrmRoleMembership {
  isMaker: boolean;
  isApprover: boolean;
}

export const SRM_PERMISSION_CODES = {
  MAKER_VIEW: 'MAKER_SERVICE_APPLICATION:VIEW',
  MAKER_EDIT: 'MAKER_SERVICE_APPLICATION:EDIT',
  APPROVER_VIEW: 'APPROVER_SERVICE_APPLICATION:VIEW',
  APPROVER_EDIT: 'APPROVER_SERVICE_APPLICATION:EDIT',
} as const;

interface SrmRolePermissionAccess {
  canView: boolean;
  canEdit: boolean;
}

export interface SrmPermissionAccess {
  maker: SrmRolePermissionAccess;
  approver: SrmRolePermissionAccess;
  canView: boolean;
  canEdit: boolean;
}

function normalizePermission(permission: string | null | undefined): string {
  return permission?.trim().toUpperCase() ?? '';
}

function normalizeRoleId(roleId: string | null | undefined): string {
  return roleId?.trim().toLowerCase() ?? '';
}

export function createSrmPermissionAccess(
  permissions: Array<string | null | undefined>,
): SrmPermissionAccess {
  const normalizedPermissions = new Set(
    permissions
      .map((permission) => normalizePermission(permission))
      .filter((permission) => permission.length > 0),
  );

  const makerCanEdit = normalizedPermissions.has(
    SRM_PERMISSION_CODES.MAKER_EDIT,
  );
  const approverCanEdit = normalizedPermissions.has(
    SRM_PERMISSION_CODES.APPROVER_EDIT,
  );

  const makerCanView =
    makerCanEdit || normalizedPermissions.has(SRM_PERMISSION_CODES.MAKER_VIEW);
  const approverCanView =
    approverCanEdit ||
    normalizedPermissions.has(SRM_PERMISSION_CODES.APPROVER_VIEW);

  return {
    maker: {
      canView: makerCanView,
      canEdit: makerCanEdit,
    },
    approver: {
      canView: approverCanView,
      canEdit: approverCanEdit,
    },
    canView: makerCanView || approverCanView,
    canEdit: makerCanEdit || approverCanEdit,
  };
}

export function createSrmRoleConfig(
  roleConfig:
    | {
        adminMakerRoleId?: string | null;
        adminApproverRoleId?: string | null;
      }
    | null
    | undefined,
): SrmRoleConfig {
  return {
    adminMakerRoleId: normalizeRoleId(roleConfig?.adminMakerRoleId),
    adminApproverRoleId: normalizeRoleId(roleConfig?.adminApproverRoleId),
  };
}

export function extractEmployeeRoleIds(employeeInfo: unknown): string[] {
  const employee = employeeInfo as
    | {
        roleId?: string | null;
        roleIds?: Array<string | null | undefined>;
        roles?: Array<
          | string
          | {
              roleId?: string | null;
            }
          | null
          | undefined
        >;
      }
    | null
    | undefined;

  if (!employee) {
    return [];
  }

  const idsFromRoleIds = Array.isArray(employee.roleIds)
    ? employee.roleIds
    : [];
  const idsFromRoles = Array.isArray(employee.roles)
    ? employee.roles.map((role) => {
        if (typeof role === 'string') {
          return role;
        }

        return role?.roleId;
      })
    : [];
  const directRoleId = employee.roleId ? [employee.roleId] : [];

  return [...directRoleId, ...idsFromRoleIds, ...idsFromRoles]
    .map((roleId) => normalizeRoleId(roleId))
    .filter((roleId) => roleId.length > 0);
}

export function resolveSrmRoleMembership(
  roleIds: string[],
  roleConfig: SrmRoleConfig,
): SrmRoleMembership {
  const isMaker =
    !!roleConfig.adminMakerRoleId &&
    roleIds.includes(roleConfig.adminMakerRoleId);
  const isApprover =
    !!roleConfig.adminApproverRoleId &&
    roleIds.includes(roleConfig.adminApproverRoleId);

  return {
    isMaker,
    isApprover,
  };
}

export function resolveSrmVisibleTabs(
  access: SrmPermissionAccess,
  membership: SrmRoleMembership,
): SrmListTabKey[] {
  if (!access.canView) {
    return ['all'];
  }

  // Keep original behavior:
  // - Maker only: hide in-progress, but show my-work
  // - Approver: show in-progress
  if (membership.isApprover) {
    return ['queue', 'in-progress', 'my-work', 'all'];
  }

  if (membership.isMaker) {
    return ['queue', 'my-work', 'all'];
  }

  // Fallback by permission when role profile is not ready yet.
  if (access.approver.canView) {
    return ['queue', 'in-progress', 'my-work', 'all'];
  }

  if (access.maker.canView) {
    return ['queue', 'my-work', 'all'];
  }

  return ['all'];
}
