# AMR Control Web App

พื้นที่ซอร์สและแผนงานหน้าควบคุม AMR ของทีม Dashboard

| ฟังก์ชัน | ซอร์สและสถานะใน repo |
|---|---|
| Save Mission / Route Editor | [ต้นแบบหน้าวางเส้นทาง](curve-preview.html) และ [flow](../../database/node-red/amr-lab/amr-route-editor.flow.json) มีหน้าวาดเส้นทาง งานบันทึกภารกิจลงฐานกลางอยู่ในแผน |
| Joystick | [ต้นแบบหน้าจอ](joystick-preview.html) และ [flow](../../database/node-red/amr-lab/amr-joystick.flow.json) สำหรับ AMR จำลองสามคัน ช่องทางควบคุมรถจริงรอการยืนยันใน Lab |
| Tap-to-Go | [หน้าจอ](tap-to-go.html), [flow](../../database/node-red/amr-lab/amr-tap-to-go.flow.json) และ [ตัววางแผน](../../robotics/amr/route-lab/tap-to-go-planner.cjs) มีผลทดสอบเส้นทางจำลอง |
| Map Zones & Points | [ผัง Floor 9](../../robotics/amr/route-lab/maps/floor9/README.md) พร้อมใช้เป็นฐาน งานแก้โซน จุดจอด และจุดชาร์จอยู่ในแผน |
| Fleet Schedule / Save Workflow | รายละเอียดและผลตรวจรับอยู่ใน [AMR Handoff](../../docs/roles/amr-handoff.md) |

เปิดหน้าที่ส่งผลผ่าน API ด้วย [Node-RED AMR Lab](../../README.md) ส่วน Live Map เดิมอยู่ใน [Node-RED flows](../../database/node-red/flows.json) ที่เส้นทาง `/smart-factory/live-map`
