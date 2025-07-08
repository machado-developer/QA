// utils/getMenuForRole.ts
import { menus, Role } from '@/app/navmenu';

export const getMenuForRole = (role: Role) =>
  menus.filter((item) => item.roles.includes(role));

 


