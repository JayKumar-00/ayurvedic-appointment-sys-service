import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../Doctors/Schemas/doctor.schema';
import { Reception, ReceptionDocument } from '../reception/Schemas/reception.schema';
import { Patients, PatientDocument } from '../patients/Schemas/patients.schema';
import { AdminAppointment, AdminAppointmentDocument } from '../admin-appointments/Schemas/admin-appointment.schema';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>,
    @InjectModel(Reception.name) private readonly receptionModel: Model<ReceptionDocument>,
    @InjectModel(Patients.name) private readonly patientModel: Model<PatientDocument>,
    @InjectModel(AdminAppointment.name) private readonly adminAppointmentModel: Model<AdminAppointmentDocument>,
  ) {}

  async getStats(user: JwtPayload) {
    const filter: any = {};
    if (!user.isSystemAdmin && user.hospitalId) {
      filter.hospitalId = user.hospitalId;
    }

    // 1. Core Metrics Counts
    const totalDoctors = await this.doctorModel.countDocuments(filter);
    const receptionists = await this.receptionModel.countDocuments(filter);
    const totalPatients = await this.patientModel.countDocuments(filter);

    // Active therapies (active appointments today and onwards)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeTherapies = await this.adminAppointmentModel.countDocuments({
      ...filter,
      isActive: true,
      date: { $gte: todayStart },
    });

    // Revenue calculation (completed appointments * $150)
    // We consider past appointments as completed
    const completedCount = await this.adminAppointmentModel.countDocuments({
      ...filter,
      date: { $lt: todayStart },
    });
    const rawRevenue = completedCount * 150;
    const revenue = `$${rawRevenue.toLocaleString()}`;

    // 2. Recent Registrations (Doctors, Receptionists, Patients merged)
    const [latestDoctors, latestReceptionists, latestPatients] = await Promise.all([
      this.doctorModel.find(filter).sort({ createdAt: -1 }).limit(5).exec(),
      this.receptionModel.find(filter).sort({ createdAt: -1 }).limit(5).exec(),
      this.patientModel.find(filter).sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    const recentRegistrations = [
      ...latestDoctors.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        role: 'Doctor',
        isActive: true,
        createdAt: (d as any).createdAt,
      })),
      ...latestReceptionists.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        email: r.email,
        role: 'Receptionist',
        isActive: true,
        createdAt: (r as any).createdAt,
      })),
      ...latestPatients.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        role: 'Patient',
        isActive: p.isActive,
        createdAt: (p as any).createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // 3. Registrations Trend (last 6 months)
    const registrationsTrend: any[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthFilter = {
        ...filter,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      };

      const [docs, recs, pats] = await Promise.all([
        this.doctorModel.countDocuments(monthFilter),
        this.receptionModel.countDocuments(monthFilter),
        this.patientModel.countDocuments(monthFilter),
      ]);

      registrationsTrend.push({
        month: monthNames[month],
        doctors: docs,
        receptionists: recs,
        patients: pats,
      });
    }

    // 4. Recent Activity Feed
    const latestAppointments = await this.adminAppointmentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const recentActivity: any[] = [];

    // Add appointment activities
    latestAppointments.forEach((app) => {
      recentActivity.push({
        id: app._id.toString(),
        type: 'appointment',
        title: 'Appointment Scheduled',
        description: `${app.patientName} scheduled with ${app.doctorName} at ${app.time}`,
        time: this.getRelativeTime((app as any).createdAt),
        createdAt: (app as any).createdAt,
      });
    });

    // Add doctor activities
    latestDoctors.forEach((doc) => {
      recentActivity.push({
        id: doc._id.toString(),
        type: 'doctor',
        title: 'Doctor Joined',
        description: `Dr. ${doc.name} (${doc.specialization}) was registered.`,
        time: this.getRelativeTime((doc as any).createdAt),
        createdAt: (doc as any).createdAt,
      });
    });

    // Add patient activities
    latestPatients.forEach((pat) => {
      recentActivity.push({
        id: pat._id.toString(),
        type: 'patient',
        title: 'Patient Registered',
        description: `${pat.name} was registered in the database.`,
        time: this.getRelativeTime((pat as any).createdAt),
        createdAt: (pat as any).createdAt,
      });
    });

    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return {
      totalDoctors,
      receptionists,
      totalPatients,
      activeTherapies,
      revenue,
      recentRegistrations,
      registrationsTrend,
      recentActivity: sortedActivity,
    };
  }

  private getRelativeTime(date: Date): string {
    if (!date) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}
