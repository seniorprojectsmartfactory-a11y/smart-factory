# Database / InfluxDB

**ผู้รับผิดชอบ** ____________________  
**ผู้สำรอง** ____________________

ดูแล schema, ประวัติข้อมูล, สิทธิ์เข้าถึง และ query ที่ Node-RED กับ Grafana ใช้ร่วมกัน

## งานหลัก

- ดูแลฐานหลัก `KU/senior_project` ที่ [localhost:8086](http://localhost:8086) โดย flow ปัจจุบันเขียน `object_detection`, `object_detection_event` และ `sf_device_health`
- ดูแลฐาน `smart_factory/factory_iot` ที่ [localhost:8087](http://localhost:8087) สำหรับ flow รุ่นก่อน เช่น `wise4012_ai_raw`, `wise4250_di` และข้อมูล Enterprise Simulation ระบุฐานที่ใช้ทุกครั้งในตัวอย่าง query
- จัดทำรายการ measurement, tag, field, ชนิดข้อมูล, หน่วย และเวลาอ้างอิง พร้อมแยกสิทธิ์เขียนของ Node-RED และสิทธิ์อ่านของ Grafana
- ออกแบบ schema สำหรับเส้นทางที่วางแผน รอยวิ่งจริง และเหตุการณ์ภารกิจตามเอกสารส่งต่อ โดยกำหนด ID สำหรับเชื่อมข้อมูลกับ AMR และรุ่นแผนที่ รับค่ากรอบพิกัดจาก Robotics ก่อนสรุป schema
- สำรองข้อมูลตามรอบที่ทีมตกลง และทดสอบกู้คืนในฐานแยกก่อนใช้สำเนานั้นกับระบบหลัก

## ไฟล์ที่ใช้

- Compose ของ InfluxDB สองฐาน (`infra/docker-migration/compose.yaml`) และ สคริปต์เริ่ม InfluxDB บน Windows (`influxdb/start-influxdb.ps1`)
- Schema ระบบตรวจจับวัตถุ (`Object-Detection-WISE4012.md`) และ การตั้งค่า Enterprise Overview (`enterprise-dashboard.md`)

## ส่งมอบเมื่อ

- Automation ส่งค่าทดสอบแล้ว query เจอค่า เวลา และหน่วยตามที่ตกลง
- Dashboard ได้ตัวอย่าง query ที่ระบุ org, bucket และช่วงเวลา พร้อมกรณีที่ query ไม่พบข้อมูล
- มีบันทึกเวลาสำรองข้อมูลและผลทดสอบกู้คืน โดยเก็บ token และไฟล์ฐานข้อมูลจริงแยกจาก GitHub
