# InfluxDB

รายละเอียดการตั้งค่าอ้างอิงอยู่ใน [Infra Compose](../../infra/compose.migrated.yaml) ใช้ร่วมกับ [Node-RED flows](../node-red/flows.json)

| ระบบ | Org / Bucket | ข้อมูลตามเอกสารทีม |
|---|---|---|
| หลัก | `KU/senior_project` | `object_detection`, `object_detection_event`, `sf_device_health` |
| รุ่นก่อน | `smart_factory/factory_iot` | `wise4012_ai_raw`, `wise4250_di` และข้อมูล Enterprise Simulation |

งานต่อด้าน AMR คือกำหนด schema ของภารกิจ เส้นทางที่วางแผน รอยวิ่งจริง และเหตุการณ์สถานะ โดยตกลงรหัสเชื่อมข้อมูลและรุ่นแผนที่กับ Robotics ส่วน Map Catalog และภาพ Floor 9 ปัจจุบันเผยแพร่จาก Node-RED โดยใช้ [ชุดอ้างอิงจาก Git](../../robotics/amr/route-lab/maps/floor9/README.md) แหล่งเก็บถาวรของภาพและข้อมูลแผนที่ยังอยู่ระหว่างออกแบบ

[แผน Database](../PLAN.md) · [เกณฑ์ส่งมอบ InfluxDB](../../docs/roles/database.md) · [AMR Handoff](../../docs/roles/amr-handoff.md)
