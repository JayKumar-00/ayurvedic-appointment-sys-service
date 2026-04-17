import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { ConfigService } from '../config/config.service';
import {
  AdminUser,
  AdminUserSchema,
} from '../user/admin-user/schemas/admin-user.schema';

async function seedSystemAdmin() {
  const configService = new ConfigService();
  await mongoose.connect(configService.mongoUri);

  const adminUserModel = mongoose.model(AdminUser.name, AdminUserSchema);

  const existingSystemAdmin = await adminUserModel.findOne({
    isSystemAdmin: true,
  });

  if (existingSystemAdmin) {
    console.log('System admin already exists, skipping seed.');
    return;
  }

  const email =
    process.env.SYSTEM_ADMIN_EMAIL?.toLowerCase().trim() ??
    'systemadmin@ayurvedic.com';
  const name = process.env.SYSTEM_ADMIN_NAME?.trim() ?? 'System Admin';
  const password = process.env.SYSTEM_ADMIN_PASSWORD;

  if (!password) {
    throw new Error('SYSTEM_ADMIN_PASSWORD environment variable is required');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await adminUserModel.create({
    name,
    email,
    passwordHash,
    isAdmin: false,
    isSystemAdmin: true,
    isActive: true,
  });

  console.log(`Seeded system admin: ${email}`);
}

seedSystemAdmin()
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown seed error';
    console.error(`System admin seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
