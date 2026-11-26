# อัปเดตทีม Dashboard · 26 พฤศจิกายน 2569 (2026-11-26)

**ผู้รับผิดชอบงาน UI คือทีม Dashboard** ทีมดูแลหน้าตาและวิธีใช้งาน AMR Route Editor ตั้งแต่การโต้ตอบกับแผนที่จนถึงหน้าจัดการ Mission และ System Flow รอบนี้เป็นงานฝั่งหน้าเว็บสำหรับการจำลองในเบราว์เซอร์

| งาน UI | สิ่งที่พัฒนาวันนี้ |
| --- | --- |
| แผนที่ชั้น 9 | แสดง AMR จำลองทั้ง 3 คัน ซูมด้วยลูกกลิ้ง และคงมุมมองขณะเลือก AMR หรือเริ่มจำลอง |
| หน้า AMR | เลือกหุ่นและเส้นทางแยกกัน แล้วทดลองให้หุ่นวิ่งตามจุดเริ่มและเส้นทางที่บันทึกไว้ |
| คลัง Mission | วาดและแก้เส้นทาง ทดลองก่อนบันทึก บันทึกทับ สร้าง Mission ใหม่ ลบ และคืน Mission ที่เพิ่งลบ ระบบแสดงชื่อ Flow หาก Mission ยังถูกอ้างอิง |
| หน้า System Flow | กำหนด Mission และ AMR แยกกันในแต่ละขั้น จัดลำดับ และตั้งเงื่อนไขให้ขั้นวิ่งต่อกันหรือเริ่มพร้อมกันได้ |

## โค้ดและผลตรวจสอบ

- ซอร์ส UI ของทีม Dashboard อยู่ที่ [dashboard/web-app/curve-preview.html](../web-app/curve-preview.html) และอัปเดตใน [commit 9a3acef](https://github.com/seniorprojectsmartfactory-a11y/smart-factory/commit/9a3acefeff7104107059e5ff835f569f925be34e)
- ไฟล์ [Node-RED flow](../../database/node-red/amr-lab/amr-route-editor.flow.json) ใช้เปิดหน้าเว็บที่ `/amr/route-editor` และตรงกับซอร์ส UI ใน [commit 030a826](https://github.com/seniorprojectsmartfactory-a11y/smart-factory/commit/030a82645e0aae3263cb6cad7a34ca1d16daeeff)
- ทดสอบบน Node-RED พอร์ต 1881 แล้วสำหรับการซูม การเลือก AMR และการจำลองทั้งแบบต่อกันและแบบเริ่มพร้อมกัน ส่วนปุ่มคืน Mission และจัดลำดับขึ้น–ลงอยู่ในโค้ดบน GitHub และยังรอทดสอบบนหน้าที่รันจริง ดู [บันทึกทางเทคนิค](../../docs/amr-route-editor-update-2026-11-26.md)
