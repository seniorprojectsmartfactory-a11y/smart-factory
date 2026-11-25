# IIoT · อุปกรณ์และเครือข่าย

อุปกรณ์ WISE การเชื่อมต่อ และการยืนยันช่องสัญญาณจาก Lab

- [แผนและผู้รับผิดชอบ](PLAN.md)
- [รายละเอียดหน้าที่และเกณฑ์ส่งมอบ](../docs/roles/iiot.md)

## ไฟล์งานและแหล่งอ้างอิง

[Node-RED flows](../database/node-red/flows.json)

## สถานะจากเอกสารทีม

- WISE-4012 เป็นแหล่งข้อมูล Analog Input สำหรับงานตรวจจับ และ WISE-4250 ใช้ Digital I/O โดยมี flow เดิมให้ตรวจการแมปสัญญาณ
- เมื่อทดสอบที่ Lab ให้ยืนยันรุ่นอุปกรณ์ ช่อง I/O, Modbus address, หน่วย และค่าที่อ่านได้ แล้วส่งตารางพร้อมตัวอย่างให้ [Node-RED](../database/node-red/automation.md)
- งานอ่านสถานะ UR ผ่านเครือข่ายส่งต่อร่วมกับ [Robotics UR](../robotics/ur/README.md)

## จุดส่งต่องาน

ส่งตาราง I/O, Modbus address และหน่วยที่ตรวจแล้วให้ Node-RED
