import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SidebarMenu, SidebarMenuDocument } from './Schema/sidebar-menu';
import { Assignment, AssignmentDocument } from '../assignments/schemas/assignments.schema';
import { AdminUser, AdminUserDocument } from '../user/admin-user/schemas/admin-user.schema';

@Injectable()
export class SidebarMenuService {
  constructor(
    @InjectModel(SidebarMenu.name)
    private readonly sidebarMenuModel: Model<SidebarMenuDocument>,
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
  ) { }

  async getMenuForUser(user: any): Promise<any> {
    const roleKey = this.getRoleKey(user);
    const menu = await this.sidebarMenuModel.findOne({ role: roleKey }).exec();

    if (!menu) {
      throw new NotFoundException(`Sidebar menu configuration for role '${roleKey}' not found.`);
    }

    // Convert mongoose document to a plain JavaScript object
    const plainMenu = menu.toObject();

    // Default: set viewOnly: false for all items across all roles first
    plainMenu.sections = plainMenu.sections.map((section: any) => ({
      ...section,
      items: section.items.map((item: any) => ({
        ...item,
        viewOnly: false,
      })),
    }));

    // If the user is an admin (but not system admin), filter their menu using active assignment
    if (user.isAdmin && !user.isSystemAdmin) {
      // 1. Resolve name robustly (fetch from DB if missing in JWT payload)
      let userName = user.name;
      if (!userName && user.sub) {
        const dbUser = await this.adminUserModel.findById(user.sub).exec();
        if (dbUser) {
          userName = dbUser.name;
        }
      }

      if (!userName) {
        // Fallback to View Only access if user name is completely missing
        return this.applyViewOnlyFallback(plainMenu);
      }

      // 2. Query assignment using case-insensitive regex
      const escapedName = userName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const assignment = await this.assignmentModel.findOne({
        Administrator: { $regex: new RegExp(`^${escapedName}$`, 'i') },
        isActive: true,
      }).exec();

      if (!assignment) {
        // Fallback to View Only access if no active assignment is found
        return this.applyViewOnlyFallback(plainMenu);
      }

      const permissionStr = assignment.Permission;
      if (permissionStr === 'Full Access') {
        // Full Access gives all items in the admin menu, all with viewOnly = false
        return plainMenu;
      }

      if (permissionStr === 'View Only') {
        return this.applyViewOnlyFallback(plainMenu);
      }

      try {
        let parsedPerms = JSON.parse(permissionStr);
        if (typeof parsedPerms === 'string') {
          parsedPerms = JSON.parse(parsedPerms);
        }

        if (parsedPerms && parsedPerms.type === 'Limited Access' && parsedPerms.sections) {
          const sectionConfig = parsedPerms.sections;

          plainMenu.sections = plainMenu.sections
            .map((section: any) => {
              const filteredItems = section.items
                .filter((item: any) => {
                  const cfg = sectionConfig[item.view];
                  return cfg && cfg.enabled === true;
                })
                .map((item: any) => {
                  const cfg = sectionConfig[item.view];
                  return {
                    ...item,
                    viewOnly: cfg ? !!cfg.viewOnly : false,
                  };
                });

              return {
                ...section,
                items: filteredItems,
              };
            })
            .filter((section: any) => section.items.length > 0);
        } else if (parsedPerms && typeof parsedPerms === 'object') {
          // New granular checklist structure
          plainMenu.sections = plainMenu.sections
            .map((section: any) => {
              const filteredItems = section.items
                .filter((item: any) => {
                  const viewKey = item.view ? item.view.toLowerCase() : '';
                  const cfg = parsedPerms[viewKey];
                  return cfg && cfg.read === true;
                })
                .map((item: any) => {
                  const viewKey = item.view ? item.view.toLowerCase() : '';
                  const cfg = parsedPerms[viewKey];
                  const hasWritePerms = cfg ? (cfg.create || cfg.update || cfg.delete) : false;
                  return {
                    ...item,
                    viewOnly: !hasWritePerms,
                  };
                });

              return {
                ...section,
                items: filteredItems,
              };
            })
            .filter((section: any) => section.items.length > 0);
        } else {
          // Fallback to View Only if invalid config shape
          return this.applyViewOnlyFallback(plainMenu);
        }
      } catch (e) {
        // Fallback to View Only on parsing errors
        return this.applyViewOnlyFallback(plainMenu);
      }
    }

    return plainMenu;
  }

  private applyViewOnlyFallback(plainMenu: any): any {
    // View Only: Keep all menu sections but set viewOnly: true for all items
    plainMenu.sections = plainMenu.sections.map((section: any) => ({
      ...section,
      items: section.items.map((item: any) => ({
        ...item,
        viewOnly: true,
      })),
    }));
    return plainMenu;
  }

  private getRoleKey(user: any): string {
    if (user.isSystemAdmin) return 'super-admin';
    if (user.isAdmin) return 'admin';
    if (user.isReceptionist || user.roleId === 'receptionist') return 'receptionist';
    if (user.isDoctor || user.roleId === 'doctor') return 'doctor';
    return 'user';
  }
}

