# Smart Factory · แนวทางทำงานใน repo

นี่คือจุดเริ่มต้นของ AI ที่ทำงานใน repo นี้ ใช้ตำแหน่งหรือระบบที่ผู้ใช้ระบุเพื่อเลือกบทบาทจากตาราง ส่วน [README](README.md) มีวิธีเปิดระบบ

| ตำแหน่งหรือระบบที่เรียก | ไฟล์ที่ AI ต้องอ่าน |
|---|---|
| Robotics, Robotic, Robot, AMR, MiR, UR, Floor 9 3D | [Robotics](robotics/AGENTS.md) |
| Dashboard, Grafana, Frontend, AMR Web App | [Dashboard](dashboard/AGENTS.md) |
| Database, InfluxDB, Node-RED, Automation, Backend, MATLAB | [Database](database/AGENTS.md) |
| IIoT, IoT, WISE, Modbus, Sensor | [IIoT](iiot/AGENTS.md) |
| Simulation, SIM, ข้อมูลจำลอง | [Simulation](simulation/AGENTS.md) |
| Infrastructure, Infra, Docker, Compose | [Infrastructure](infra/AGENTS.md) |
| Integration, QA, Test, Demo | [Integration / QA](integration-qa/AGENTS.md) |

## วิธีทำงานตามฝ่าย

1. เมื่อผู้ใช้ระบุตำแหน่ง ให้อ่าน `AGENTS.md` ของฝ่ายนั้นโดยตรงจากลิงก์ในตาราง แล้วอ่าน `PLAN.md` ของฝ่ายเพื่อทราบงานล่าสุด
2. ถ้าผู้ใช้บอกเพียงตำแหน่ง ให้สรุปว่า **รับผิดชอบอะไร · อ่านไฟล์ไหนต่อ · ต้องประสานใคร** ถ้าได้รับงานด้วย ให้ใช้เอกสารและไฟล์ที่เกี่ยวข้องกับงานนั้นแล้วลงมือตามคำขอ สถานะที่ยังไม่ยืนยันหรือรอขอบเขตให้บอกตามที่แผนระบุ
3. งาน AMR ใช้ [Dashboard Web App](dashboard/web-app/README.md) สำหรับหน้าควบคุม [Database](database/database.md) สำหรับ API และการเก็บข้อมูล และ [Robotics AMR](robotics/amr/README.md) สำหรับตรรกะหุ่นยนต์ แผนที่ และผลทดสอบ
4. บันทึกว่าใช้ข้อมูลจำลองหรือทดสอบที่ Lab ในผลทดสอบ และประสานผู้ควบคุม Lab ก่อนทดสอบกับอุปกรณ์จริง
5. เก็บ token, credentials และไฟล์ฐานข้อมูลจาก Lab ไว้นอก Git

ตัวอย่าง เมื่อผู้ใช้บอกว่า “ผมดูแล Node-RED” ให้เปิด [Database AGENTS.md](database/AGENTS.md) แล้วอ่าน [แผน Node-RED](database/node-red/PLAN.md) เพื่อสรุปหน้าที่ด้าน flow และ API รวมถึงข้อมูลที่ต้องส่งให้ Dashboard

[รายละเอียดบทบาทและการส่งต่องาน](docs/roles/README.md) · [แบบกรอกข้อมูลสมาชิก](docs/roles/team-input.md)
