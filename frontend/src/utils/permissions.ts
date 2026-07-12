// utils/permissions.ts
// Single source of truth for role-based access control

export type AccessLevel = 'full' | 'view' | 'none'

export type AppModule =
  | 'Dashboard'
  | 'Fleet'
  | 'Drivers'
  | 'Trips'
  | 'Maintenance'
  | 'Fuel & Expenses'
  | 'Analytics'
  | 'Settings'

export type AppRole =
  | 'FLEET_MANAGER'
  | 'DISPATCHER'
  | 'SAFETY_OFFICER'
  | 'FINANCIAL_ANALYST'

type PermissionMatrix = Record<AppRole, Record<AppModule, AccessLevel>>

const PERMISSIONS: PermissionMatrix = {
  FLEET_MANAGER: {
    Dashboard:        'view',
    Fleet:            'full',
    Drivers:          'full',
    Trips:            'none',
    Maintenance:      'full',
    'Fuel & Expenses':'none',
    Analytics:        'full',
    Settings:         'full',
  },
  DISPATCHER: {
    Dashboard:        'full',
    Fleet:            'view',
    Drivers:          'none',
    Trips:            'full',
    Maintenance:      'none',
    'Fuel & Expenses':'none',
    Analytics:        'none',
    Settings:         'view',
  },
  SAFETY_OFFICER: {
    Dashboard:        'view',
    Fleet:            'none',
    Drivers:          'full',
    Trips:            'view',
    Maintenance:      'none',
    'Fuel & Expenses':'none',
    Analytics:        'none',
    Settings:         'view',
  },
  FINANCIAL_ANALYST: {
    Dashboard:        'view',
    Fleet:            'view',
    Drivers:          'none',
    Trips:            'none',
    Maintenance:      'none',
    'Fuel & Expenses':'full',
    Analytics:        'full',
    Settings:         'view',
  },
}

/** Returns the access level a role has for a given module */
export function getAccess(role: string, module: AppModule): AccessLevel {
  const roleKey = role as AppRole
  return PERMISSIONS[roleKey]?.[module] ?? 'none'
}

/** Returns all modules a role can access (not 'none') */
export function getAllowedModules(role: string): AppModule[] {
  const roleKey = role as AppRole
  const perms = PERMISSIONS[roleKey]
  if (!perms) return ['Dashboard']
  return (Object.keys(perms) as AppModule[]).filter(
    (mod) => perms[mod] !== 'none'
  )
}

/** Returns the first accessible module for a role */
export function getDefaultTab(role: string): AppModule {
  const allowed = getAllowedModules(role)
  return allowed[0] ?? 'Dashboard'
}
