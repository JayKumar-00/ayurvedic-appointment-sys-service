const mongoose = require('mongoose');

const mongoUri = "mongodb://kumjay93:jq8Xp8mONH1qFyr9@ac-gqqce1l-shard-00-00.kdl8mh8.mongodb.net:27017,ac-gqqce1l-shard-00-01.kdl8mh8.mongodb.net:27017,ac-gqqce1l-shard-00-02.kdl8mh8.mongodb.net:27017/ayurvedic-appointment?ssl=true&replicaSet=atlas-d0kj0m-shard-0&authSource=admin&appName=ClusterOne";

async function checkDetails() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  // Hospitals details
  console.log("\n--- HOSPITALS ---");
  const hospitals = await mongoose.connection.db.collection('hospitals').find().toArray();
  console.log(`Found ${hospitals.length} hospitals:`);
  hospitals.forEach(h => console.log(`Hospital ID: ${h._id}, Name: ${h.name}, Code: ${h.code}, IsActive: ${h.isActive}`));

  // Users details
  console.log("\n--- USERS ---");
  const users = await mongoose.connection.db.collection('users').find().toArray();
  console.log(`Found ${users.length} users:`);
  users.forEach(u => console.log(`User ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, IsAdmin: ${u.isAdmin}, IsSystemAdmin: ${u.isSystemAdmin}, HospitalId: ${u.hospitalId}`));

  // Doctors details
  console.log("\n--- DOCTORS ---");
  const doctors = await mongoose.connection.db.collection('doctors').find().toArray();
  console.log(`Found ${doctors.length} doctors:`);
  doctors.forEach(d => console.log(`Doctor ID: ${d._id}, Name: ${d.name}, Email: ${d.email}, HospitalId: ${d.hospitalId}`));

  // Appointments details
  console.log("\n--- ADMIN APPOINTMENTS ---");
  const appointments = await mongoose.connection.db.collection('admin_appointments').find().toArray();
  console.log(`Found ${appointments.length} appointments:`);
  appointments.forEach(a => console.log(`Appointment ID: ${a._id}, Patient: ${a.patientName}, Doctor: ${a.doctorName}, Date: ${a.date}, IsActive: ${a.isActive}`));

  await mongoose.disconnect();
}

checkDetails().catch(console.error);
