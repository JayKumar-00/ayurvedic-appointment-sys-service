import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { DiagnosisReport, DiagnosisReportDocument } from 'src/Doctors-admin/diagnosis-reports/Schemas/report';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(DiagnosisReport.name)
    private readonly diagnosisReportModel: Model<DiagnosisReportDocument>
  ) {}

  async exportPrescription(
    id: string,
    res: Response,
    queryDoctorName?: string,
    querySpecialization?: string,
  ) {
    // Attempt to search by diagnosis report ID, fallback to appointment ID
    let report = await this.diagnosisReportModel.findById(id).exec();
    if (!report) {
      report = await this.diagnosisReportModel.findOne({ appointmentId: id }).exec();
    }
    if (!report) {
      throw new NotFoundException(`Diagnosis report not found for ID or Appointment ID: ${id}`);
    }

    // Map Mongoose report document to PDF data structure
    let parsedMedicines: any[] = [];
    try {
      const parsed = JSON.parse(report.medicine);
      if (Array.isArray(parsed)) {
        parsedMedicines = parsed;
      }
    } catch (e) {
      // Ignore
    }

    let base64Image = '';
    try {
      let imagePath = path.join(process.cwd(), 'src', 'Prescription-pdf', 'caduceus.png');
      if (!fs.existsSync(imagePath)) {
        imagePath = path.join(__dirname, 'caduceus.png');
      }
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
      }
    } catch (e) {
      // Ignore
    }

    const diagnosis = {
      caduceusImg: base64Image,
      patientName: report.patientName,
      age: report.age,
      gender: report.gender,
      bp: report.Bp ? String(report.Bp) : 'N/A',
      sugar: report.bloodSugar ? String(report.bloodSugar) : 'N/A',
      condition: (() => {
        if (parsedMedicines.length > 0) {
          const conditions = parsedMedicines
            .map((m: any) => m.reason)
            .filter((reason: any) => typeof reason === 'string' && reason.trim() !== '');
          const uniqueConditions = Array.from(new Set(conditions));
          if (uniqueConditions.length > 0) {
            return uniqueConditions.join(', ');
          }
        }
        return report.condition || 'N/A';
      })(),
      observation: report.observation,
      weight: report.weight,
      symptoms: report.symptoms,
      Observation:report.observation,
      followUp:report.followUp,
      medicines: parsedMedicines.length > 0
        ? parsedMedicines.map((m: any) => `${m.name} - ${m.dosage} - ${m.frequency}`)
        : (report.medicine ? [report.medicine] : []),
      doctorName: queryDoctorName || 'Dr. Priya Sharma',
      qualification: querySpecialization || 'B.H.M.S.',
      date: new Date(report.date).toLocaleDateString(),
    };

    const html = this.generateHtml(diagnosis);

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0' as any,
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename=prescription-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  generateHtml(data: any) {

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
@page{
size:A4;
margin:0;
}
*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
background:#fff;
font-family:Arial,sans-serif;
  }
.page {
      width: 595.32pt;
      height: 841.92pt;
      position: relative;
      overflow: hidden;
      background: #fff;
      color: #000;
    }
.page-border {
      position: absolute;
      left: 24pt;
      top: 24pt;
      width: 547.44pt;
      height: 794.04pt;
      border: 3.6pt solid #4c94d8;
      pointer-events: none;
    }
.blue {
      color: #215f9a;
    }

    .clinic-mark {
      position: absolute;
      left: 36pt;
      top: 48pt;
      width: 11pt;
      height: 11pt;
      border: 1.8pt solid #215f9a;
      border-radius: 50%;
    }
.clinic-mark::before,
    .clinic-mark::after {
      content: "";
      position: absolute;
      background: #215f9a;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .clinic-mark::before {
      width: 7pt;
      height: 1.4pt;
    }
.clinic-mark::after {
      width: 1.4pt;
      height: 7pt;
    }

    .clinic-name {
      position: absolute;
      left: 51.72pt;
      top: 45.4pt;
      font-size: 26.04pt;
      line-height: 1;
      color: #215f9a;
      font-weight: 400;
      white-space: nowrap;
    }
.doctor-name {
      position: absolute;
      right: 36pt;
      top: 45.4pt;
      font-size: 26.04pt;
      line-height: 1;
      color: #215f9a;
      font-weight: 400;
      white-space: nowrap;
      text-align: right;
    }

    .clinic-line {
      position: absolute;
      left: 36pt;
      font-size: 12pt;
      line-height: 1;
      color: #215f9a;
      white-space: nowrap;
    }
addr-1 { top: 88.7pt; }
    .addr-2 { top: 107.7pt; }
    .addr-3 { top: 126.6pt; }
    .addr-4 { top: 145.6pt; }

    .qualification {
      position: absolute;
      right: 75pt;
      top: 88.7pt;
      font-size: 12pt;
      line-height: 1;
      color: #215f9a;
      white-space: nowrap;
    }
.header-rule {
      position: absolute;
      left: 35.8pt;
      top: 170.6pt;
      width: 521.25pt;
      height: 1.5pt;
      background: #156083;
    }

    .watermark {
      position: absolute;
      left: 218.5pt;
      top: 450.8pt;
      width: 157.9pt;
      height: 157.9pt;
      object-fit: contain;
      opacity:0.2;
    }
 .field-label {
      position: absolute;
      font-size: 12.96pt;
      line-height: 1;
      color: #000;
      white-space: nowrap;
    }

    .field-label.blue-label {
      font-size: 18pt;
      color: #215f9a;
      font-weight: 700;
    }
.date-label {
      position: absolute;
      left: 430.06pt;
      top: 196pt;
      font-size: 12pt;
      line-height: 1;
      color: #215f9a;
      font-weight: 700;
    }

    .field-line {
      position: absolute;
      min-height: 14pt;
      font-size: 12.96pt;
      line-height: 13pt;
      padding-left: 6pt;
      color: #000;
      white-space: nowrap;
    }
// .blue-line {
//       border-bottom-color: #215f9a;
//       color: #000;
//     }

    .patient-title { left: 36pt; top: 192pt; }
    .patient-title-line { left: 199.61pt; top: 198pt; width: 205pt; }
    .date-line { left: 467.38pt; top: 198pt; width: 89pt; }

    .patient-name-label { left: 36pt; top: 221.8pt; }
    .patient-name-line { left: 123.74pt; top: 222pt; width: 433pt; }

    .age-gender-label { left: 36pt; top: 244.3pt; }
    .age-gender-line { left: 106.7pt; top: 244.5pt; width: 450pt; }

    .vital-label { left: 36pt; top: 268.3pt; }
    .vital-line { left: 130.82pt; top: 274.2pt; width: 426pt; }

    .weight-label { left: 36pt; top: 300.1pt; }
    .weight-line { left: 81.26pt; top: 300.3pt; width: 475.5pt; }
.bp-label { left: 36pt; top: 322.5pt; }
    .bp-line { left: 126.74pt; top: 322.7pt; width: 430pt; }

    .symptoms-label { left: 36pt; top: 344.8pt; }
    .symptoms-line { left: 100.1pt; top: 345pt; width: 456.5pt; }

    .observations-label { left: 36pt; top: 367.3pt; }
    .observations-line { left: 114.74pt; top: 367.5pt; width: 442pt; }

    .rx-image {
      position: absolute;
      left: 36pt;
      top: 390.27pt;
      width: 35.25pt;
      height: 39pt;
      object-fit: contain;
    }
.rx-fallback {
      position: absolute;
      left: 36pt;
      top: 390.27pt;
      width: 35.25pt;
      height: 39pt;
      color: #215f9a;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 25pt;
      font-weight: 700;
      line-height: 39pt;
    }

    .rx-fallback sub {
      font-size: 11pt;
      vertical-align: baseline;
      position: relative;
      bottom: -2pt;
    }
.medicine-list {
      position: absolute;
      left: 86pt;
      top: 402pt;
      width: 470pt;
      font-size: 13pt;
      line-height: 1.55;
      color: #000;
    }

    .medicine-item {
      margin-bottom: 5pt;
    }

    .signature-line {
      position: absolute;
      left: 404.25pt;
      top: 729.74pt;
      width: 141pt;
      border-bottom: 1.5pt solid #0f9ed5;
    }
.signature-label {
      position: absolute;
      left: 451.3pt;
      top: 739.1pt;
      font-size: 12pt;
      line-height: 1;
      color: #000;
      white-space: nowrap;
    }
</style>
</head>
<body>
  <div class="page">
    <div class="page-border"></div>

    <div class="clinic-mark"></div>
    <div class="clinic-name">BalaJi Clinic</div>
    <div class="doctor-name">${data.doctorName}</div>

    <div class="clinic-line addr-2">Address Line 2</div>
    <div class="clinic-line addr-3">Address Line 3</div>
    <div class="clinic-line addr-4">+91 9876543210</div>
    <div class="qualification">${data.qualification}</div>

    <div class="header-rule"></div>

    ${data.caduceusImg ? `<img class="watermark" src="${data.caduceusImg}" alt="" />` : ""}

    <div class="field-label blue-label patient-title">Patient Information:</div>
    <div class="field-line blue-line patient-title-line"></div>
    <div class="date-label">Date:</div>
    <div class="field-line blue-line date-line">${data.date}</div>

    <div class="field-label patient-name-label">Patient Name :</div>
    <div class="field-line patient-name-line">${data.patientName}</div>

    <div class="field-label age-gender-label">Age/Gender:</div>
    <div class="field-line age-gender-line">${data.gender}</div>

    <div class="field-label blue-label vital-label">Vital Signs :</div>
    

    <div class="field-label weight-label">Weight:</div>
    <div class="field-line weight-line">${data.weight} Kg</div>

    <div class="field-label bp-label">Blood Pressure :</div>
    <div class="field-line bp-line">${data.bp} mmHg</div>

    <div class="field-label symptoms-label">Symptoms:</div>
    <div class="field-line symptoms-line">${data.symptoms}</div>

    <div class="field-label observations-label">Observations:</div>
    <div class="field-line observations-line">${data.observations}</div>

    ${
      data.rxImg
        ? `<img class="rx-image" src="${data.rxImg}" alt="Rx" />`
        : `<div class="rx-fallback">R<sub>x</sub></div>`
    }
    <div class="medicine-list">${data.medicines}</div>

    <div class="signature-line"></div>
    <div class="signature-label">Signature</div>
  </div>
</body>
</html>
`;
}
}