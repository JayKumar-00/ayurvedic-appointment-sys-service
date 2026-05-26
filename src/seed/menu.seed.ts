import 'dotenv/config';
import mongoose from 'mongoose';
import { ConfigService } from '../config/config.service';
import { SidebarMenu, SidebarMenuSchema } from '../Sidebar-menu/Schema/sidebar-menu';

async function seedSidebarMenus() {
  const configService = new ConfigService();
  await mongoose.connect(configService.mongoUri);

  const sidebarMenuModel = mongoose.model(SidebarMenu.name, SidebarMenuSchema);

  // Clear existing configurations
  await sidebarMenuModel.deleteMany({});
  console.log('Cleared existing sidebar menus.');

  const menus = [
    {
      role: 'super-admin',
      sections: [
        {
          sectionName: 'System Control',
          items: [
            { label: 'Dashboard', icon: 'LayoutGrid', view: 'dashboard', href: '/dashboard' },
            { label: 'Hospitals', icon: 'Building2', view: 'hospital', href: '/dashboard?view=hospital' },
            { label: 'Admins', icon: 'Users', view: 'admin', href: '/dashboard?view=admin' },
            { label: 'Assignments', icon: 'UserCog', view: 'assignments', href: '/dashboard?view=assignments' },
            { label: 'Network', icon: 'Network', view: 'network', href: '/dashboard?view=network' },
            { label: 'Analytics', icon: 'BarChart3', view: 'analytics', href: '/dashboard?view=analytics' }
          ]
        }
      ]
    },
    {
      role: 'admin',
      sections: [
        {
          sectionName: 'Overview',
          items: [
            { label: 'Dashboard', icon: 'LayoutGrid', view: 'dashboard', href: '/dashboard' },
            { label: 'Analytics', icon: 'BarChart3', view: 'analytics', href: '/dashboard?view=analytics' }
          ]
        },
        {
          sectionName: 'Management',
          items: [
            { label: 'Doctors', icon: 'Stethoscope', view: 'doctors', href: '/dashboard?view=doctors' },
            { label: 'Reception', icon: 'ClipboardList', view: 'reception', href: '/dashboard?view=reception' },
            { label: 'Patients', icon: 'Users', view: 'patients', href: '/dashboard?view=patients' },
            { label: 'Appointments', icon: 'Calendar', view: 'appointments', href: '/dashboard?view=appointments' },
            { label: 'Staff', icon: 'Users2', view: 'staff', href: '/dashboard?view=staff' }
          ]
        },
        {
          sectionName: 'Operations',
          items: [
            { label: 'Inventory', icon: 'Package', view: 'inventory', href: '/dashboard?view=inventory' },
            { label: 'Therapies', icon: 'BarChart3', view: 'therapy', href: '/dashboard?view=therapy' }
          ]
        }
      ]
    },
    {
      role: 'doctor',
      sections: [
        {
          sectionName: 'Clinical Care',
          items: [
            { label: 'Dashboard', icon: 'LayoutGrid', view: 'dashboard', href: '/dashboard' },
            { label: 'Appointments', icon: 'Calendar', view: 'appointments', href: '/dashboard?view=appointments' },
            { label: 'Diagnosis Reports', icon: 'FileText', view: 'diagnosis', href: '/dashboard?view=diagnosis' },
            { label: 'Patient Records', icon: 'ClipboardList', view: 'patients', href: '/dashboard?view=patients' }
          ]
        }
      ]
    },
    {
      role: 'receptionist',
      sections: [
        {
          sectionName: 'Desk Operations',
          items: [
            { label: 'Dashboard', icon: 'LayoutGrid', view: 'dashboard', href: '/dashboard' },
            { label: 'Appointments', icon: 'Calendar', view: 'appointments', href: '/dashboard?view=appointments' },
            { label: 'Patients', icon: 'Users', view: 'patients', href: '/dashboard?view=patients' },
            { label: 'Patient Records', icon: 'ClipboardList', view: 'patient-records', href: '/dashboard?view=patient-records' },
            { label: 'Doctors', icon: 'Phone', view: 'doctors', href: '/dashboard?view=doctors' }
          ]
        },
        {
          sectionName: 'Patient Care Flow',
          items: [
            { label: 'Pre-Medical Test', icon: 'Heart', view: 'pre-medical-test', href: '/dashboard?view=pre-medical-test' },
            { label: 'Patient Queue', icon: 'ArrowRight', view: 'patient-queue', href: '/dashboard?view=patient-queue' },
            { label: 'Medicine Dispensing', icon: 'Pill', view: 'medicine-dispensing', href: '/dashboard?view=medicine-dispensing' }
          ]
        }
      ]
    }
  ];

  for (const menu of menus) {
    await sidebarMenuModel.create(menu);
    console.log(`Seeded menu configuration for role: ${menu.role}`);
  }

  console.log('Seeding sidebar menus complete!');
}

seedSidebarMenus()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown seed error';
    console.error(`Sidebar menu seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
