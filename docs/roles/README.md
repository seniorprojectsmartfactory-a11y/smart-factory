# หน้าที่ทีม Smart Factory

เปิด [AGENTS.md](../../AGENTS.md) เพื่อเข้าโฟลเดอร์ของแต่ละฝ่ายและอัปเดตผู้รับผิดชอบกับแผนใน `PLAN.md` เอกสารชุดนี้เก็บรายละเอียดหน้าที่และเกณฑ์ส่งมอบ

คนหนึ่งรับได้หลายบทบาท ให้ทีมกรอกชื่อผู้รับผิดชอบและผู้สำรองในแผนของแต่ละฝ่าย

ใช้ [แบบกรอกข้อมูลสมาชิก](team-input.md) เพื่อรวบรวมงานที่ทำอยู่ ความถนัด และข้อจำกัดก่อนจัดคน

| ตำแหน่ง | แผนของฝ่าย | ผลงานหลัก |
|---|---|---|
| [Automation / Node-RED](automation.md) | [แผน](../../database/node-red/PLAN.md) | Flow อ่านอุปกรณ์ แปลงค่า และส่ง telemetry |
| [IIoT / อุปกรณ์และเครือข่าย](iiot.md) | [แผน](../../iiot/PLAN.md) | การเชื่อมต่ออุปกรณ์จริงและตาราง Modbus ที่ตรวจแล้ว |
| [SIM / Simulation](simulation.md) | [แผน](../../simulation/PLAN.md) | ข้อมูลจำลองและสถานการณ์ทดสอบที่ทำซ้ำได้ |
| [Database / InfluxDB](database.md) | [แผน](../../database/PLAN.md) | Schema, query, token ตามสิทธิ์ และแผนสำรองข้อมูล |
| [Dashboard / Grafana & Live Map](dashboard.md) | [แผน](../../dashboard/PLAN.md) | แผงแสดงเซนเซอร์และแผนที่ AMR พร้อมสถานะข้อมูล |
| [Robotics / AMR Route Lab & UR](robotics.md) | [แผน](../../robotics/PLAN.md) | ข้อมูลอ้างอิงหุ่นยนต์ แผนที่ และหลักฐานทดสอบ Lab |
| [Infrastructure / Docker & GitHub](infrastructure.md) | [แผน](../../infra/PLAN.md) | สภาพแวดล้อมที่ทำซ้ำได้และขั้นตอนส่งโค้ดขึ้น GitHub |
| [Integration / QA & Demo](integration-qa.md) | [แผน](../../integration-qa/PLAN.md) | เกณฑ์รับงานและหลักฐานทดสอบข้ามระบบ |

เส้นทางข้อมูลหลักคือ **WISE / MiR / UR → Node-RED → InfluxDB → Grafana** ส่วน Live Map มีหน้าแสดงผลใน Node-RED และ AMR Route Lab มีเว็บของตัวเอง

IIoT ส่งมอบสัญญาณจากอุปกรณ์และตาราง Modbus ให้ Automation นำไปทำ flow ส่วน SIM เตรียมข้อมูลและสถานการณ์จำลองให้ Automation, Database และ Dashboard ทดสอบจากเครื่องนอก Lab ได้

เมื่อเปลี่ยนชื่อ measurement, field, tag, หน่วย หรือสถานะ ให้ Automation, Database และ Dashboard ตกลงร่วมกันก่อน merge เมื่อเปลี่ยน map ID หรือกรอบพิกัด ให้ Robotics ส่งค่าที่ตรวจแล้วแก่ Dashboard และ Database เมื่อเปลี่ยนพอร์ตหรือบริการ ให้ Infrastructure แจ้งทุกคนที่ใช้ URL นั้น

อ้างอิง เอกสารส่งต่องาน Lab (`2026-11-16_amr-dashboard-lab-handoff woray.md`) และ Compose ของชุด Docker ที่ย้ายมา (`infra/docker-migration/compose.yaml`)
