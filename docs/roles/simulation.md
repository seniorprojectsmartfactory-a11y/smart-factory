# SIM / Simulation

**ผู้รับผิดชอบ** ____________________  
**ผู้สำรอง** ____________________

ดูแลข้อมูลและสถานการณ์จำลองสำหรับให้ทีมพัฒนาและทดสอบนอก Lab โดยใช้รูปแบบข้อมูลเดียวกับที่ระบบตกลงกัน

## งานหลัก

- ดูแล `SIM AI every 2 sec` สำหรับค่า Analog Input ของ WISE-4012 และ `Enterprise Simulation` สำหรับ KPI, สถานะ AMR และเหตุการณ์แจ้งเตือน
- เตรียมสถานการณ์ทดสอบที่ทำซ้ำได้ เช่น ค่าปกติ ค่าเปลี่ยนตามเวลา และอุปกรณ์หยุดส่ง พร้อมระบุผลที่คาดในแต่ละระบบ
- ตกลง measurement, field, tag, หน่วย และรอบส่งกับ Automation และ Database ใช้ป้ายกำกับข้อมูลจำลอง เช่น `simulated: true` ใน flow ที่รองรับ และระบุชุดข้อมูลทดสอบให้ Dashboard เลือกได้ถูกต้อง
- บันทึกวิธีเปิดและปิด simulation ก่อนสลับไปทดสอบอุปกรณ์จริง และส่งผลทดสอบให้ Integration / QA ใช้ประกอบเดโม

## ไฟล์ที่ใช้

- สคริปต์ติดตั้ง Enterprise Simulation (`node-red/install-enterprise-simulation.ps1`) และ รายการ measurement จำลอง (`enterprise-dashboard.md`)
- ตัวอย่าง WISE-4012 Analog Input Simulator (`WISE-4012_Node-RED_Modbus_Report_2026-09-16.md`)
- Compose ชุดทดลอง (`notebook/project-dashboard/compose.yaml`)

## ส่งมอบเมื่อ

- สมาชิกอีกคนเปิดและปิด simulation ตามคู่มือได้โดยไม่ต้องต่ออุปกรณ์ Lab
- มีตัวอย่างผลตั้งแต่ Node-RED เขียนข้อมูลเข้า InfluxDB จน Grafana แสดงค่า และผู้ดูแดชบอร์ดระบุได้ว่าข้อมูลชุดใดเป็นข้อมูลจำลอง
