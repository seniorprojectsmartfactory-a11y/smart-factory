# บทบาท Database

**เรียกบทบาทนี้เมื่อผู้ใช้ระบุ** Database, InfluxDB, Node-RED, Automation หรือ Backend

## หน้าที่และไฟล์ที่ใช้งาน

- **InfluxDB** ดูแล schema, query, ประวัติ, สิทธิ์ และการสำรองข้อมูล เริ่มที่ [InfluxDB](influxdb/README.md)
- **Node-RED / Automation** ดูแลการรับสัญญาณ แปลงข้อมูล เขียนฐาน และ API ของ AMR Web App เริ่มที่ [Node-RED](node-red/automation.md) และ [แผน Automation](node-red/PLAN.md)
- **MATLAB** เก็บ [สคริปต์และผลเดิม](matlab/README.md) ไว้ในฝ่ายนี้ งานรอบถัดไปรอ Woray กำหนดขอบเขต

## งานรอบนี้

เปิด [PLAN.md](PLAN.md) เพื่อดูงานและผู้รับผิดชอบที่ทีมระบุ เมื่อได้รับเพียงชื่อตำแหน่ง ให้สรุปหน้าที่ตามหมวดที่ระบุและบอกข้อมูลที่ต้องใช้เริ่มรอบนั้น ระบุว่ารับงาน InfluxDB หรือ Node-RED พร้อมแหล่งข้อมูล ข้อมูลขาออก และผู้ที่จะนำไปใช้

## จุดส่งต่องาน

ส่งตัวอย่าง API หรือ query พร้อมฟิลด์ หน่วยและเวลาให้ [Dashboard](../dashboard/AGENTS.md) รับพิกัดจาก [Robotics](../robotics/AGENTS.md) และข้อมูลสัญญาณจาก [IIoT](../iiot/AGENTS.md)
