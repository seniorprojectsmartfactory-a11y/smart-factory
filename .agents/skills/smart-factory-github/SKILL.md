---
name: smart-factory-github
description: Save, push, pull, or clone only the Smart Factory team repo. Use for GitHub SF commands that start from a named role and record other roles that actually worked in the current session.
---

# GitHub SF

คำสั่ง `GitHub SF <save|push|pull|clone> <ตำแหน่ง>` เช่น `GitHub SF push Dashboard` หรือ `GitHub SF clone Robotic`

- `Git Hub` = `GitHub`, `SF` = `Smart Factory` ละคำว่า `Skill` ได้ และใช้รูปแบบเดิม `Push GitHub Smart Factory Dashboard` ได้
- ชื่อท้ายคำสั่งเป็นจุดเริ่ม รองรับ **Dashboard**, **Robotic/Robotics**, **Database**, **IIoT**, **Simulation** ถ้าพิมพ์หลายชื่อให้ใช้ทั้งหมดเป็นจุดเริ่ม ถ้าบริบทยังไม่บอกการกระทำ ให้ถามว่าจะ save, push, pull หรือ clone

## ทำงาน

1. ใช้เฉพาะ `seniorprojectsmartfactory-a11y/smart-factory` ตรวจ `origin` สำหรับ fetch และ push ดึง refs ล่าสุด แล้วอ่าน `AGENTS.md` และเอกสารฝ่ายเพื่อหา path กับ branch ที่ใช้ เช่น Route Editor อาจอยู่ใน `handoff/team-folder-structure` ขณะที่กล้อง Station A อยู่ใน `main` ตรวจจากไฟล์จริงบน remote ทุกครั้ง
2. **Save / Push** อ่านงานในแชตรอบนี้ เทียบกับ diff และ commit ที่ยังไม่ส่งเพื่อหาฝ่ายที่ลงมือทำจริง แม้ผู้ใช้พิมพ์ชื่อเดียว นับฝ่ายจากงานที่ทำและหลักฐานในแชต การอ้างอิงไฟล์ของอีกฝ่ายเป็นเพียง dependency จนกว่าจะพบงานของฝ่ายนั้นในรอบนี้ เก็บโค้ดล่าสุดที่ path เดิม รวมไฟล์ที่ต้องไปคู่กัน เช่น HTML ของ AMR Route Editor กับ Node-RED flow ที่สร้างจาก HTML นั้น
3. **บันทึกตามฝ่าย** เขียนหรืออัปเดต `<role>/updates/YYYY-MM-DD-<topic>.md` ตามเวลาไทยสำหรับแต่ละฝ่ายที่ลงมือ ระบุว่าใครทำอะไร เปลี่ยนไฟล์ไหน ผลทดสอบ และงานถัดไปที่ตกลงแล้ว เว้นชื่อผู้ทำที่ยังยืนยันไม่ได้ หากทำร่วมกัน ให้ลิงก์บันทึกของอีกฝ่ายและระบุว่าใครส่งอะไรให้ใคร ส่งไฟล์ร่วมกันครั้งเดียวต่อ branch หากงานอยู่คนละ branch ให้ดำเนินการและรายงานแยกตาม branch
4. **ส่งขึ้น GitHub** ทำเมื่อเรียก `push` เท่านั้น ตรวจ staged diff และช่วง commit ที่จะส่ง เก็บเฉพาะงานที่เกี่ยวข้อง ตัด credentials และข้อมูล Lab ที่ไม่ควรแชร์ แล้ว commit และ push ไป branch ที่ยืนยันแล้ว ถ้า branch ไม่ชัด งานชนกัน หรือ remote ปฏิเสธ ให้รักษางานเดิมและรายงานจุดติดขัด หลีกเลี่ยง force push
5. **Pull / Clone** ใช้ `pull --ff-only` กับ checkout ที่ตรง branch หรือ clone ทั้ง repo ลงโฟลเดอร์แยกถ้ายังไม่มีหรือใช้คนละ branch สรุปงานล่าสุดตามฝ่ายที่ผู้ใช้ระบุ พร้อม dependencies ที่ต้องใช้ต่อ เช่น Node-RED กับผัง Floor 9 สำหรับ Dashboard
6. **ผลลัพธ์** แจ้ง branch, commit และ path ที่บันทึกหรือดึงมา หลัง push ให้ตรวจ commit บน remote ถ้าต้องการโค้ดรุ่นเก่า ให้เปิดจาก Git history แล้วกู้เป็น commit ใหม่เมื่อผู้ใช้ขอ

ตัวอย่าง `GitHub SF push Dashboard` ถ้ารอบนี้แก้ UI กับ API ของ Database จริง ให้บันทึกทั้งสองฝ่าย ถ้าแก้ UI แล้วสร้าง flow ใหม่จาก UI เพียงอย่างเดียว ให้ส่ง flow คู่กับ UI และลงบันทึกใน Dashboard
