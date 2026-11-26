# Smart Factory Senior Project

ชุดซอร์สสำหรับแก้ไข flow, dashboard และ AMR Route Lab จากเครื่องอื่น

**สถานี A · [คู่มือตั้งกล้อง RealSense และรัน QC บน Windows](docs/station-a-camera-setup-windows.md)** — ตั้งกล้องชั่วคราว เลือกความสูง ตรวจความคม และทดสอบ OpenCV จากภาพนิ่งถึงภาพสด

- `node-red/` มี flow ที่ใช้งานอยู่ รวมหน้า Live Map ที่ route `/smart-factory/live-map` และไฟล์ล็อกสำหรับติดตั้งแพ็กเกจด้วย `npm ci`
- `grafana/dashboards/` มีไฟล์ dashboard resource ของ Grafana 13 ที่ export จากชุดที่ใช้งานอยู่ โดย datasource ของ dashboard ใช้ UID `cg4kftkp6p88wd`
- `amr-route-lab/` มีเว็บ แผนที่ และสคริปต์สำหรับใช้งานกับ MiR เมื่อเครื่องเข้าถึงเครือข่ายแล็บได้
- `infra/compose.migrated.yaml` คือค่าตั้งต้นอ้างอิงของ Docker ที่ใช้อยู่ในแล็บ โดย Grafana เปิดที่พอร์ต 3000 และ InfluxDB หลักเปิดที่พอร์ต 8086

สำหรับเครื่องใหม่ ให้ติดตั้ง dependencies ของ Node-RED แล้ว import `node-red/flows.json` เข้า Node-RED 5.0.8 ตั้งค่า InfluxDB datasource และ token ของเครื่องนั้นใน Node-RED และ Grafana ก่อนเปิด flow ที่ต้องใช้ข้อมูลจากเครื่องจริง ฐานหลักใช้ InfluxDB 2.9.1 กับ org `KU` และ bucket `senior_project` ส่วน flow รุ่นก่อนใช้ org `smart_factory` และ bucket `factory_iot` โฮสต์ `influxdb` และ `influxdb-legacy` ใน flow เป็นชื่อบริการของ Compose หากรันนอกเครือข่าย Compose ให้ปรับ URL เป็นที่อยู่ฐานของเครื่องนั้น

ไฟล์ Compose อ้างอิงใช้ไดเรกทอรีข้อมูลที่ย้ายมาจากเครื่องแล็บ ต้องเตรียมข้อมูลและ credentials ของเครื่องนั้นก่อนใช้ไฟล์นี้รัน GitHub ใช้เก็บซอร์สและประวัติการแก้ไข ส่วนการเชื่อมต่ออุปกรณ์จริงต้องเข้าถึงเครือข่ายแล็บ

??????? IP ??????????????????????????????????????? `192.0.2.0/24` ??????? IP ????????????????????????????????????????????????
