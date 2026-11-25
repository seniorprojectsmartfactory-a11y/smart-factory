# Smart Factory · แนวทางทำงานใน repo

เริ่มจาก [README](README.md) เพื่อดูวิธีเปิดระบบ แล้วเข้าโฟลเดอร์ของฝ่ายที่รับงาน

| ฝ่าย | จุดเริ่มต้น |
|---|---|
| Robotics · AMR และ UR | [`robotics/`](robotics/robotics.md) |
| Dashboard · Grafana และ AMR Web App | [`dashboard/`](dashboard/dashboard.md) |
| Database · InfluxDB และ Node-RED | [`database/`](database/database.md) |
| IIoT · อุปกรณ์และเครือข่าย | [`iiot/`](iiot/iiot.md) |
| Simulation · ข้อมูลและสถานการณ์ทดสอบ | [`simulation/`](simulation/simulation.md) |
| Infrastructure · Docker และ GitHub | [`infra/`](infra/infrastructure.md) |
| Integration · QA และ Demo | [`integration-qa/`](integration-qa/integration-qa.md) |

## วิธีทำงานตามฝ่าย

1. เปิดไฟล์หน้าที่ของฝ่ายและ `PLAN.md` ก่อนลงมือ ให้เจ้าของฝ่ายระบุผู้รับผิดชอบ งานที่จะทำ ไฟล์ที่เกี่ยวข้อง และผลที่ใช้ตรวจรับ
2. เก็บแผน ข้อสรุป และหลักฐานทดสอบที่แชร์ได้ในโฟลเดอร์ของฝ่าย แก้ซอร์สในโฟลเดอร์ย่อยของระบบนั้นและลิงก์จากแผน
3. งาน AMR ใช้ [Dashboard Web App](dashboard/web-app/README.md) สำหรับหน้าควบคุม [Database](database/database.md) สำหรับ API และการเก็บข้อมูล และ [Robotics AMR](robotics/amr/README.md) สำหรับตรรกะหุ่นยนต์ แผนที่ และผลทดสอบ
4. บันทึกว่าใช้ข้อมูลจำลองหรือทดสอบที่ Lab ในผลทดสอบ และประสานผู้ควบคุม Lab ก่อนทดสอบกับอุปกรณ์จริง
5. เก็บ token, credentials และไฟล์ฐานข้อมูลจาก Lab ไว้นอก Git

[รายละเอียดบทบาทและการส่งต่องาน](docs/roles/README.md) · [แบบกรอกข้อมูลสมาชิก](docs/roles/team-input.md)
