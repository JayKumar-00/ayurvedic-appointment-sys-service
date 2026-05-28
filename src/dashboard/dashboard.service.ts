import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../Doctors/Schemas/doctor.schema';
import { Reception, ReceptionDocument } from '../reception/Schemas/reception.schema';
import { Patients, PatientDocument } from '../patients/Schemas/patients.schema';
import { AdminAppointment, AdminAppointmentDocument } from '../admin-appointments/Schemas/admin-appointment.schema';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { Hospital, HospitalDocument } from '../user/admin-user/schemas/hospital.schema';
import { AdminUser, AdminUserDocument } from '../user/admin-user/schemas/admin-user.schema';
import { ReceptionistAppointment, ReceptionistAppointmentDocument } from '../receptionist-admin/appointment/Schemas/receptionist-appointment';
import { PatientQueue, PatientQueueDocument } from '../receptionist-admin/patient-queue/Schema/patient-queue.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>,
    @InjectModel(Reception.name) private readonly receptionModel: Model<ReceptionDocument>,
    @InjectModel(Patients.name) private readonly patientModel: Model<PatientDocument>,
    @InjectModel(AdminAppointment.name) private readonly adminAppointmentModel: Model<AdminAppointmentDocument>,
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<HospitalDocument>,
    @InjectModel(AdminUser.name) private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(ReceptionistAppointment.name) private readonly receptionistAppointmentModel: Model<ReceptionistAppointmentDocument>,
    @InjectModel(PatientQueue.name) private readonly patientQueueModel: Model<PatientQueueDocument>,
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

    // 5. System Admin growth trends (cumulative counts for last 6 months)
    const networkGrowthData: any[] = [];
    if (user.isSystemAdmin) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const month = d.getMonth();

        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const [hospitalsCount, adminsCount, doctorsCount, receptionistsCount, patientsCount] = await Promise.all([
          this.hospitalModel.countDocuments({ createdAt: { $lte: endOfMonth } }),
          this.adminUserModel.countDocuments({ isAdmin: true, isSystemAdmin: false, createdAt: { $lte: endOfMonth } }),
          this.doctorModel.countDocuments({ createdAt: { $lte: endOfMonth } }),
          this.receptionModel.countDocuments({ createdAt: { $lte: endOfMonth } }),
          this.patientModel.countDocuments({ createdAt: { $lte: endOfMonth } }),
        ]);

        const totalUsersCount = doctorsCount + receptionistsCount + patientsCount + adminsCount;

        networkGrowthData.push({
          month: monthNames[month],
          hospitals: hospitalsCount,
          admins: adminsCount,
          users: totalUsersCount,
        });
      }
    }

    // 6. Receptionist-specific Stats (when user is scoped to a hospital)
    let receptionistStats: any = null;
    if (user.hospitalId) {
      // Calculate today's date range locally and in UTC (timezone-robust)
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const utcTodayStart = new Date();
      utcTodayStart.setUTCHours(0, 0, 0, 0);
      const utcTomorrowStart = new Date(utcTodayStart);
      utcTomorrowStart.setUTCDate(utcTomorrowStart.getUTCDate() + 1);

      const dateFilter = {
        $or: [
          { date: { $gte: todayStart, $lt: tomorrowStart } },
          { date: { $gte: utcTodayStart, $lt: utcTomorrowStart } }
        ]
      };

      // Today's appointments (receptionist collection)
      const receptionistAppointmentsToday = await this.receptionistAppointmentModel.countDocuments({
        hospitalId: user.hospitalId,
        ...dateFilter,
      });

      // Active / Confirmed appointments (isActive is true)
      const receptionistAppointmentsPending = await this.receptionistAppointmentModel.countDocuments({
        hospitalId: user.hospitalId,
        isActive: true,
      });

      // Waiting now in queue
      const patientsWaitingNow = await this.patientQueueModel.countDocuments({
        hospitalId: user.hospitalId,
        status: { $in: ['waiting', 'ready-for-doctor'] },
      });

      // Hourly data (Today's appointments mapped to hours)
      const todayAppointments = await this.receptionistAppointmentModel.find({
        hospitalId: user.hospitalId,
        ...dateFilter,
      }).exec();

      const todayQueues = await this.patientQueueModel.find({
        hospitalId: user.hospitalId,
        $or: [
          { createdAt: { $gte: todayStart, $lt: tomorrowStart } },
          { createdAt: { $gte: utcTodayStart, $lt: utcTomorrowStart } }
        ]
      }).exec();

      const hourSlots = [
        '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', 
        '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', 
        '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
      ];
      const hourlyData = hourSlots.map((slot) => {
        const hourNum = parseInt(slot, 10);
        const isPM = slot.includes('PM');
        const targetHour = slot === '12 AM' ? 0 : (slot === '12 PM' ? 12 : (isPM ? hourNum + 12 : hourNum));

        // Filter appointments that match this hour using our robust helper
        const matches = todayAppointments.filter((app) => this.parseHour(app.time) === targetHour);

        // Find matches in queue that are completed
        const completedMatches = matches.filter((app) => {
          const queue = todayQueues.find((q) => q.appointmentId?.toString() === app._id?.toString());
          return queue && queue.status === 'completed';
        });

        return {
          time: slot,
          appointments: matches.length,
          completed: completedMatches.length,
        };
      });

      // Category breakdown (covering all possible options from UI dropdown)
      const walkIns = todayAppointments.filter(app => /walk|general|therapy/i.test(app.checkupType || '')).length;
      const newPatients = todayAppointments.filter(app => /new|consultation/i.test(app.checkupType || '')).length;
      const followUps = todayAppointments.filter(app => /follow/i.test(app.checkupType || '')).length;
      const urgentCases = todayAppointments.filter(app => /urgent|emergency/i.test(app.checkupType || '')).length;

      const totalToday = todayAppointments.length || 1;
      const appointmentTypesData = [
        { name: 'New Patients', value: newPatients, color: '#3b82f6' },
        { name: 'Follow-ups', value: followUps, color: '#10b981' },
        { name: 'Urgent Cases', value: urgentCases, color: '#ef4444' },
        { name: 'Walk-ins', value: walkIns, color: '#f59e0b' },
      ];

      const appointmentCategories = [
        { name: 'New Patients', count: newPatients, percentage: Math.round((newPatients / totalToday) * 100), icon: 'Users', color: 'blue' },
        { name: 'Follow-ups', count: followUps, percentage: Math.round((followUps / totalToday) * 100), icon: 'CheckCircle', color: 'emerald' },
        { name: 'Urgent Cases', count: urgentCases, percentage: Math.round((urgentCases / totalToday) * 100), icon: 'AlertCircle', color: 'red' },
        { name: 'Walk-ins', count: walkIns, percentage: Math.round((walkIns / totalToday) * 100), icon: 'Clock', color: 'amber' },
      ];

      // Doctor availability list
      const hospitalDoctors = await this.doctorModel.find({ hospitalId: user.hospitalId }).exec();
      const doctorAvailability = hospitalDoctors.map((doc) => {
        const docApps = todayAppointments.filter(app => app.doctorName === doc.name).length;
        const status = docApps > 0 ? 'In Consultation' : 'Available';
        return {
          name: `Dr. ${doc.name}`,
          status,
          appointments: docApps,
          nextBreak: docApps > 3 ? '2:30 PM' : '2:00 PM',
        };
      });

      // Weekly trend (timezone-robust daily query ranges)
      const weeklyTrend: any[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const localDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const localDayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const utcDayStart = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const utcDayEnd = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));

        const [appsCount, waitingCount] = await Promise.all([
          this.receptionistAppointmentModel.countDocuments({
            hospitalId: user.hospitalId,
            $or: [
              { date: { $gte: localDayStart, $lte: localDayEnd } },
              { date: { $gte: utcDayStart, $lte: utcDayEnd } }
            ]
          }),
          this.patientQueueModel.countDocuments({
            hospitalId: user.hospitalId,
            status: { $in: ['waiting', 'ready-for-doctor'] },
            $or: [
              { createdAt: { $gte: localDayStart, $lte: localDayEnd } },
              { createdAt: { $gte: utcDayStart, $lte: utcDayEnd } }
            ]
          }),
        ]);

        weeklyTrend.push({
          day: dayNames[d.getDay()],
          appointments: appsCount,
          waiting: waitingCount,
        });
      }

      receptionistStats = {
        receptionistAppointmentsToday,
        receptionistAppointmentsPending,
        patientsWaitingNow,
        hourlyData,
        appointmentTypesData,
        appointmentCategories,
        doctorAvailability,
        weeklyTrend,
      };
    }

    // 7. Doctor-specific Stats (when user is a doctor or scoped to a doctor profile)
    let doctorStats: any = null;
    if (user.isDoctor || (user.name && !user.isAdmin && !user.isReceptionist && !user.isSystemAdmin)) {
      const docName = user.name || '';
      const docNameRegex = new RegExp(docName.replace(/^Dr\.\s+/i, ''), 'i');

      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const utcTodayStart = new Date();
      utcTodayStart.setUTCHours(0, 0, 0, 0);
      const utcTomorrowStart = new Date(utcTodayStart);
      utcTomorrowStart.setUTCDate(utcTomorrowStart.getUTCDate() + 1);

      const dateFilter = {
        $or: [
          { date: { $gte: todayStart, $lt: tomorrowStart } },
          { date: { $gte: utcTodayStart, $lt: utcTomorrowStart } }
        ]
      };

      // Fetch today's appointments for this doctor
      const todayAppointments = await this.receptionistAppointmentModel.find({
        hospitalId: user.hospitalId,
        doctorName: docNameRegex,
        ...dateFilter,
      }).exec();

      // Fetch today's queue entries for this hospital
      const todayQueues = await this.patientQueueModel.find({
        hospitalId: user.hospitalId,
        $or: [
          { createdAt: { $gte: todayStart, $lt: tomorrowStart } },
          { createdAt: { $gte: utcTodayStart, $lt: utcTomorrowStart } }
        ]
      }).exec();

      const todayAppointmentsCount = todayAppointments.length;

      // Completed today count
      const completedCount = todayAppointments.filter((app) => {
        const queue = todayQueues.find((q) => q.appointmentId?.toString() === app._id?.toString());
        return queue && queue.status === 'completed';
      }).length;

      // Pending diagnoses count (waiting/ready for doctor or sent to doctor)
      const pendingCount = todayAppointments.filter((app) => {
        const queue = todayQueues.find((q) => q.appointmentId?.toString() === app._id?.toString());
        return queue && ['ready-for-doctor', 'sent-to-doctor', 'with-doctor'].includes(queue.status);
      }).length;

      // Total distinct patients seen historically by this doctor
      const uniquePatients = await this.receptionistAppointmentModel.distinct('phone', {
        hospitalId: user.hospitalId,
        doctorName: docNameRegex,
      });
      const totalPatientsCount = uniquePatients.length || todayAppointmentsCount;

      // Hourly appointments mapping for this doctor
      const hourSlots = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'];
      const dailyBreakdownData = hourSlots.map((slot) => {
        const hourNum = parseInt(slot, 10);
        const isPM = slot.includes('PM');
        const targetHour = slot === '12 AM' ? 0 : (slot === '12 PM' ? 12 : (isPM ? hourNum + 12 : hourNum));

        const matches = todayAppointments.filter((app) => this.parseHour(app.time) === targetHour);
        return {
          time: slot,
          count: matches.length,
        };
      });

      // Weekly Trend (Appointments vs Completed) over the last 6 days for this doctor
      const weeklyTrendData: any[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const localDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const localDayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const utcDayStart = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const utcDayEnd = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));

        const [appsCount, queueEntries] = await Promise.all([
          this.receptionistAppointmentModel.find({
            hospitalId: user.hospitalId,
            doctorName: docNameRegex,
            $or: [
              { date: { $gte: localDayStart, $lte: localDayEnd } },
              { date: { $gte: utcDayStart, $lte: utcDayEnd } }
            ]
          }).exec(),
          this.patientQueueModel.find({
            hospitalId: user.hospitalId,
            $or: [
              { createdAt: { $gte: localDayStart, $lte: localDayEnd } },
              { createdAt: { $gte: utcDayStart, $lte: utcDayEnd } }
            ]
          }).exec(),
        ]);

        const completedForDay = appsCount.filter((app) => {
          const queue = queueEntries.find((q) => q.appointmentId?.toString() === app._id?.toString());
          return queue && queue.status === 'completed';
        }).length;

        weeklyTrendData.push({
          day: dayNames[d.getDay()],
          appointments: appsCount.length,
          completed: completedForDay,
        });
      }

      // Today's Appointment list with patient vitals
      const todayAppointmentsList = todayAppointments.map((app) => {
        const queue = todayQueues.find((q) => q.appointmentId?.toString() === app._id?.toString());
        return {
          id: app._id.toString(),
          patient: app.patientName,
          time: app.time,
          type: app.checkupType,
          status: queue ? queue.status : 'waiting',
          bp: queue?.Bp || null,
          bloodSugar: queue?.bloodSugar || null,
          weight: queue?.Weight || null,
        };
      });

      // Recent Diagnoses list (completed appointments for this doctor)
      const pastAppointments = await this.receptionistAppointmentModel.find({
        hospitalId: user.hospitalId,
        doctorName: docNameRegex,
        date: { $lt: todayStart }
      }).sort({ date: -1 }).limit(5).exec();

      const recentDiagnosesList = pastAppointments.map((app) => ({
        id: app._id.toString(),
        patient: app.patientName,
        condition: app.visitReason,
        date: app.date.toISOString().split('T')[0],
        status: 'completed'
      }));

      doctorStats = {
        todayAppointmentsCount,
        pendingCount,
        completedCount,
        totalPatientsCount,
        dailyBreakdownData,
        weeklyTrendData,
        todayAppointmentsList,
        recentDiagnosesList,
      };
    }

    return {
      totalDoctors,
      receptionists,
      totalPatients,
      activeTherapies,
      revenue,
      recentRegistrations,
      registrationsTrend,
      recentActivity: sortedActivity,
      ...(user.isSystemAdmin ? {
        totalHospitals: await this.hospitalModel.countDocuments(),
        totalAdmins: await this.adminUserModel.countDocuments({ isAdmin: true, isSystemAdmin: false }),
        totalAppointments: await this.adminAppointmentModel.countDocuments(),
        networkGrowthData,
        systemMetrics: {
          responseTime: `${Math.floor(180 + Math.random() * 80)}ms`,
          apiSuccessRate: `${(99.7 + Math.random() * 0.2).toFixed(1)}%`,
          dbLoad: `${Math.floor(35 + Math.random() * 15)}%`,
          memoryUsage: `${(2.1 + Math.random() * 0.5).toFixed(1)}GB`,
        }
      } : {}),
      receptionistStats,
      doctorStats,
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

  private parseHour(timeStr: string): number {
    if (!timeStr) return -1;
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d+):(\d+)(?:\s*(AM|PM))?/);
    if (!match) {
      const simpleMatch = cleanStr.match(/^(\d+)(?:\s*(AM|PM))?/);
      if (!simpleMatch) return -1;
      let hour = parseInt(simpleMatch[1], 10);
      const ampm = simpleMatch[2];
      if (ampm) {
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
      }
      return hour;
    }
    let hour = parseInt(match[1], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
    }
    return hour;
  }
}
