# Smart Factory Senior Project

ชุดซอร์สสำหรับแก้ไข flow, dashboard และ AMR Route Lab จากเครื่องอื่น

เริ่มส่งต่องาน AMR ที่ [Handoff สำหรับ Database และ Dashboard](docs/roles/amr-handoff.md) มีสถานะฟีเจอร์ 1–6, Node-RED flows, อุปกรณ์รายฟีเจอร์, แผนทดสอบ MATLAB และ Map Reference Backup

ดู [คู่มืออ่านโค้ดและทดสอบระบบ AMR](docs/amr-system-guide.md) สำหรับวิธีเปิด MATLAB ด้วยตัวเอง ผลทดสอบ D-11 บทสรุปจากคลิปอ้างอิง และแผนจองทางร่วมหลายคัน

- `node-red/` มี flow ที่ใช้งานอยู่ รวมหน้า Live Map ที่ route `/smart-factory/live-map` และไฟล์ล็อกสำหรับติดตั้งแพ็กเกจด้วย `npm ci`
- `grafana/dashboards/` มีไฟล์ dashboard resource ของ Grafana 13 ที่ export จากชุดที่ใช้งานอยู่ โดย datasource ของ dashboard ใช้ UID `cg4kftkp6p88wd`
- `amr-route-lab/` มีเว็บ แผนที่ และสคริปต์สำหรับใช้งานกับ MiR เมื่อเครื่องเข้าถึงเครือข่ายแล็บได้
- `infra/compose.migrated.yaml` คือค่าตั้งต้นอ้างอิงของ Docker ที่ใช้อยู่ในแล็บ โดย Grafana เปิดที่พอร์ต 3000 และ InfluxDB หลักเปิดที่พอร์ต 8086
- `node-red/amr-lab/compose.yaml` เปิด Node-RED สำหรับต้นแบบ AMR โดยเฉพาะ จาก root ของ repo รัน `docker compose -f node-red/amr-lab/compose.yaml up -d` แล้วเปิด [Node-RED Editor](http://127.0.0.1:1884/) หรือ [หน้าวางเส้นทาง](http://127.0.0.1:1884/amr/route-editor)

AMR Lab ใช้ flow จำลองและ Docker volume ของตัวเอง ตอนเปิดครั้งแรกจะโหลด Template สำหรับหน้าวางเส้นทาง, [Joystick](http://127.0.0.1:1884/amr/joystick) และ [ผังอ้างอิงชั้น 9](http://127.0.0.1:1884/amr/floor9/map) การแก้ใน Editor เก็บใน volume ของ AMR Lab และควร export กลับเข้า Git เมื่อต้องส่งต่อ รายละเอียดข้อมูลพิกัดและวิธีสร้าง flow ใหม่อยู่ใน [ชุดผังอ้างอิงชั้น 9](amr-route-lab/maps/floor9/README.md)

สำหรับนำไปใส่ใน Node-RED ของ Lab ให้ใช้เมนู **Import** เลือก [ไฟล์ flow ของหน้าวางเส้นทาง](node-red/amr-lab/amr-route-editor.flow.json) แล้วกด **Deploy** เปิดหน้าที่ `/amr/route-editor` บน Node-RED ของ Lab ไฟล์นี้มีผังอ้างอิงชั้น 9 ฝังอยู่ใน Template ใช้ node มาตรฐาน และแยกจาก flow Live Map เดิมที่ `/smart-factory/live-map` หากแก้ต้นแบบในไฟล์ HTML ให้สร้างไฟล์นำเข้าใหม่จาก root ของ repo ด้วย `node node-red/amr-lab/export-flow.cjs`

Node-RED ที่พอร์ต 1884 เปิดหน้าแก้เส้นทางและแท็บจาก `node-red/flows.json` ใน Editor เดียวกัน ติดตั้ง dependencies จาก lockfile ของทีม และเปิดแท็บจาก GitHub ในสถานะ Disabled สำหรับตรวจโหนดก่อนทดสอบกับ Lab หากมี volume จากรุ่นก่อนที่ยังไม่มีแท็บต้นฉบับ ให้ใช้ `docker compose -f node-red/amr-lab/compose.yaml exec -T node-red node /opt/amr/seed-flow.cjs --merge-github` เพื่อเพิ่มแท็บเข้าไปโดยเก็บ flow เดิมไว้

[Tap to Go](http://127.0.0.1:1884/amr/tap-to-go) เป็นหน้าจำลองการแตะจุดหมายสำหรับ AMR สามคัน หากนำไปใส่ Node-RED อีกเครื่อง ให้ Import [flow ผังอ้างอิง](node-red/amr-lab/floor9-reference.flow.json) และ [flow Tap to Go](node-red/amr-lab/amr-tap-to-go.flow.json) ใน Node-RED ตัวเดียวกัน ตัวคำนวณอ่านผังจาก Node-RED พอร์ตภายใน `1880` และใช้กริดพิกเซล ประตูในผังจำลองถือว่าเปิดอยู่ ยกเว้น D-11 หรือ D-23 ที่ผู้ใช้เลือกปิด เมื่อต้องสร้าง flow หลังแก้โค้ด ให้รัน `node node-red/amr-lab/export-tap-to-go-flow.cjs` จาก root ของ repo

สำหรับเครื่องใหม่ ให้ติดตั้ง dependencies ของ Node-RED แล้ว import `node-red/flows.json` เข้า Node-RED 5.0.8 ตั้งค่า InfluxDB datasource และ token ของเครื่องนั้นใน Node-RED และ Grafana ก่อนเปิด flow ที่ต้องใช้ข้อมูลจากเครื่องจริง ฐานหลักใช้ InfluxDB 2.9.1 กับ org `KU` และ bucket `senior_project` ส่วน flow รุ่นก่อนใช้ org `smart_factory` และ bucket `factory_iot` โฮสต์ `influxdb` และ `influxdb-legacy` ใน flow เป็นชื่อบริการของ Compose หากรันนอกเครือข่าย Compose ให้ปรับ URL เป็นที่อยู่ฐานของเครื่องนั้น

ไฟล์ Compose อ้างอิงใช้ไดเรกทอรีข้อมูลที่ย้ายมาจากเครื่องแล็บ ต้องเตรียมข้อมูลและ credentials ของเครื่องนั้นก่อนใช้ไฟล์นี้รัน GitHub ใช้เก็บซอร์สและประวัติการแก้ไข ส่วนการเชื่อมต่ออุปกรณ์จริงต้องเข้าถึงเครือข่ายแล็บ

??????? IP ??????????????????????????????????????? `192.0.2.0/24` ??????? IP ????????????????????????????????????????????????
