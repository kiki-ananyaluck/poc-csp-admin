---
type: handoff
service: centralized
feature: amlo-company-blocking
date: 2026-09-07
tags: [frontend, hostapp, admin-portal, amlo]
---

# AMLO — handoff ฝั่ง Frontend

เขียนให้ developer ที่ไม่เคยแตะงานนี้มาก่อน อ่านจบแล้วต่องานได้เลย
ทุกอย่างในนี้ตรวจกับโค้ดบน `origin/development` เมื่อ **7 กันยายน 2569**

---

## 0. เริ่มตรงไหน

**แตกกิ่งจาก `origin/development` ของแต่ละ repo** ไม่ใช่จาก branch AMLO ตัวไหนทั้งนั้น

| repo | หัว `development` ณ 07/09 | ทำอะไรฝั่ง FE |
|---|---|---|
| `Frontend_HostAppSuperApp` | `f7eed4e` | กล่องบล็อกที่ลูกค้าเห็น |
| `Frontend_AdminSuperApp` | `ae527e3` | หน้าจัดการเคส / ประวัติ / operations |

🔴 **`fix/amlo-v2` ไม่ใช่ของล่าสุด** — เป็น snapshot ตอนก่อน merge ตามหลัง `development` อยู่ 3–4 commit
และไม่มี commit ไหนที่ `development` ยังไม่มีเลย (0 ทั้งสอง repo) ⇒ **ห้ามแตกกิ่งจากมัน** จะได้ของเก่า

branch AMLO อื่นทั้งหมด merge เข้า `development` ไปแล้ว
เหลือ `Frontend_HostAppSuperApp/promote/amlo-uat` ที่มี 1 commit ค้าง (`ce7adcb` 31/08 — port ขึ้น UAT)
ตัวนั้น**อย่าไปยุ่ง** จนกว่าจะคุยเรื่องรอบติดตั้ง UAT

⚠️ **UAT ยังไม่ได้ติดตั้งรุ่น 07/09** — ทุกอย่างในเอกสารนี้จริงบน `development` เท่านั้น

---

## 1. ไฟล์ทั้งหมดที่เกี่ยวข้อง

### HostApp (`apps/shell/src/`) — กล่องที่ลูกค้าเห็น

```
app/components/coordinators/amlo-blocking-coordinator/
    amlo-blocking-coordinator.ts        component + ปุ่ม + การสลับบริษัท
    amlo-blocking-coordinator.html       5 โหมดใน @switch เดียว
    amlo-blocking-coordinator.message.ts  $localize keys
    amlo-blocking-coordinator.spec.ts    13 เคส (เพิ่งเพิ่ม 07/09)
app/services/amlo/
    amlo-blocking-state.service.ts       state machine — โหมดไหนขึ้น ปิดได้เมื่อไหร่
    amlo-blocking-coordinator-logic.service.ts  effect ทั้งหมด (ui-kit-free)
    amlo-blocking.model.ts               type ของโหมด
app/interceptors/
    amlo-blocking.interceptor.ts         ดัก 403/503 แล้วสั่งเปิดกล่อง
```

ข้อความจริงอยู่ที่ `apps/shell/src/locale/shared/messages.th.arb:101-117` **ไม่ได้อยู่ในเทมเพลต**
· `amloVerifyingTitle` ... `amloLogoutBtn` รวม 13 key

รายการบริษัทที่ใช้สลับ กรองบริษัทที่ `Flagged` ออกที่ `corporate-panel.state.ts:33-35`
และการสลับจริงอยู่ที่ `corporate-panel.state.ts:63`

### Admin Portal (`apps/admin/src/`)

```
app/pages/amlo/cases/            ตารางเคส + กางแถว + ฟอร์มปลดล็อกทั้งบริษัท
app/pages/amlo/history/          ประวัติการปลดล็อก
app/pages/amlo/operations/       รอบข้อมูลปัจจุบัน + ปุ่มสั่งตรวจ
app/pages/amlo/components/name-view-table/    ตารางซ้อนแสดงชื่อในหลักฐาน
app/pages/amlo/components/evidence-viewer/    หน้าต่างดูไฟล์หลักฐาน
app/services/amlo/amlo.service.ts             ทุก HTTP call
app/services/amlo/amlo-display.util.ts        แปลค่าดิบเป็นข้อความไทย
app/services/amlo/amlo-error.util.ts
app/services/amlo/evidence-file-validation.ts ตรวจไฟล์ก่อนอัปโหลด
```

---

## 2. กล่องฝั่งลูกค้าทำงานยังไง — อ่านก่อนแก้อะไรก็ตาม

component mount ที่ **root ของแอป** (`app.html`) เป็น sibling ของ `router-outlet`
⇒ ครอบทุกหน้า **ไม่มี route guard** route เบื้องหลังยังโหลดและทำงานอยู่ กล่องแค่บังจอ

มี **5 โหมด** ไม่ใช่ 4:

| โหมด | มาจากไหน | ปุ่มซ้าย | ปุ่มขวา |
|---|---|---|---|
| `verifying` | `verifyAndEvaluate()` กำลังยิง `/users/me` ยืนยัน | — | ออกจากระบบ |
| `blocked-switchable` | บริษัทปัจจุบัน `Flagged` และมีบริษัทอื่นที่ไม่ `Flagged` | ออกจากระบบ | ยืนยันการสลับบริษัท |
| `blocked-no-alternative` | `Flagged` และไม่มีบริษัทอื่น | — | ออกจากระบบ |
| `not-screenable` | HTTP **403** `COMPANY_AMLO_NOT_SCREENABLE` จาก interceptor | ออกจากระบบ | ยืนยันการสลับบริษัท |
| `unavailable` | HTTP **503** หรือ 403 `COMPANY_AMLO_STATUS_UNKNOWN` | ออกจากระบบ | ลองใหม่อีกครั้ง |

**สองสายที่เปิดกล่อง ไม่เหมือนกัน:**

- `blocked-*` มาจาก `amloStatus` ที่ติดมากับ `/users/me` — คำนวณใน `evaluateCurrentCompany()`
- `not-screenable` / `unavailable` มาจาก **interceptor** ดัก HTTP error ของ request อื่น

### 🔴 กฎที่ทำให้คนแก้ผิดบ่อยที่สุด

`evaluateCurrentCompany()` ปิดกล่องได้เฉพาะโหมดที่ตัวเองเปิด — allow-list มีแค่
`verifying` / `blocked-switchable` / `blocked-no-alternative` (`amlo-blocking-state.service.ts:34-42`)

**เป็นแบบนี้โดยตั้งใจ** — `not-screenable` มาจากสัญญาณคนละตัว การที่ `/users/me` refresh
ธรรมดาแล้วปิดกล่องนั้นทิ้งคือ bug ไม่ใช่ feature

⇒ ถ้าต้องปิด `not-screenable` จากเหตุการณ์ใหม่ **อย่าไปแก้ allow-list**
ให้พาสถานะกลับเข้า `verifying` ด้วย `verifyAndEvaluate()` แทน แล้วปล่อยให้กลไกเดิมปิดให้
(นี่คือวิธีที่ใช้แก้ปัญหากล่องค้างหลังสลับบริษัทเมื่อ 07/09)

### กล่องปิดเองไม่ได้ด้วยมือผู้ใช้

`closeOnEscape=false` · `closeOnBackdrop=false` · ไม่มีปุ่ม X · ไม่มี `(closed)` binding — ตั้งใจทั้งหมด

### ไม่มี polling / timer / retry อัตโนมัติเลย

ทุกการตรวจซ้ำเป็น event-driven: SignalR `AmloStateChanged` · HTTP error · authenticated emission
ของ `AuthService.user()` · หรือปุ่ม "ลองใหม่อีกครั้ง"
⇒ ถ้าเห็นใครจะเพิ่ม `setInterval` หรือ retry loop **ทัดทานไว้ก่อน** เคยมี bug ยิง `/users/me`
1,198 ครั้งใน 102.6 วินาที มาแล้ว

### 🔴 effect กับ signal — จุดที่ระเบิดซ้ำ

`untracked()` ต้องครอบ **ทั้ง** `verifyAndEvaluate()` ไม่ใช่หยุดแค่ `isAuthenticated()`
เพราะ `verifyAndEvaluate()` เรียก `syncUserProfile()` ซึ่งเขียน signal ตัวเดียวกับที่
`isAuthenticated` computed มาจาก · ครอบแคบกว่านั้น = effect subscribe ตัวเองแล้ววนไม่จบ
(`amlo-blocking-coordinator-logic.service.ts` ใน effect ของ SignalR)

---

## 3. สิ่งที่เปลี่ยนเมื่อ 07/09 — และเหตุผล

### HostApp — PR [#3010](https://dev.azure.com/eximth/SuperApp/_git/Frontend_HostAppSuperApp/pullrequest/3010)

**กล่อง `not-screenable` ปิดตัวเองหลังสลับบริษัทสำเร็จ**

ลูกค้ากดสลับบริษัทตามที่กล่องเสนอ สลับสำเร็จ แต่กล่องยังค้างทับจอ อธิบายบริษัทที่เขาออกมาแล้ว
ทางออกที่เหลือคือออกจากระบบ

`confirmSwitch()` ส่งผลลัพธ์ผ่าน `logic.onCompanySwitchSettled(outcome)` ซึ่งเรียก
`verifyAndEvaluate()` → เข้า `verifying` → `/users/me` รอบถัดไปปิดกล่องให้

**gate 2 ชั้น ห้ามถอดทั้งคู่:**

1. `mode() === 'not-screenable'` เท่านั้น — `switchCompany()` เขียน profile ใหม่ลง
   `AuthService.user()` **กลางทาง** ก่อน emit ⇒ กล่อง `blocked-switchable` ปิดไปแล้วตอน
   switch settle ถ้ายิงทุกโหมด เส้นปกติจะเห็น `verifying` แวบซ้ำอีกจังหวะ
2. `outcome === 'ok'` เท่านั้น — 🔴 `switchCompany()` รายงานการสลับที่ถูกปฏิเสธมาทาง
   **`next()` ไม่ใช่ `error()`** ถ้าไม่ gate การสลับที่ server ปฏิเสธจะปิดกล่องที่ยังต้องอยู่

**เพิ่ม spec ของ component 13 เคส** — ดูข้อ 5

### Admin — PR [#3008](https://dev.azure.com/eximth/SuperApp/_git/Frontend_AdminSuperApp/pullrequest/3008)

`auditActionLabel()` รู้จักแค่ 3 action แต่ endpoint ประวัติคืนมา 4 ⇒ `CompanyUnblocked`
ซึ่งเป็นเคสปกติหลังมติ 04/09 ขึ้นเป็นคำอังกฤษดิบกลางคอลัมน์ภาษาไทย

เพิ่ม `'ปลดล็อกทั้งบริษัทโดยผู้ดูแล'` (`amlo-display.util.ts`) และ spec ผูกไว้ว่า
**ทุก action ที่ endpoint คืนได้ต้องมีคำแปล** ⇒ เพิ่ม action ที่ 5 เข้า filter ฝั่ง BE
เมื่อไหร่ เทสต์จะแดงก่อนถึงหน้าจอผู้ใช้

### BE ที่กระทบพฤติกรรมฝั่ง FE — PR [#3009](https://dev.azure.com/eximth/SuperApp/_git/Backend_UserService/pullrequest/3009)

- **ใบปลดล็อกหมดอายุตี 2 ส่ง `AmloStateChanged` แล้ว** (เดิมเงียบ) ⇒ จอที่เปิดค้างข้ามคืน
  จะได้สัญญาณและขึ้นกล่องเอง **ภายใน 15 นาที** (รอบกวาดทุก 15 นาที ไม่ได้ยิงตรง 02:00:00)
- **เลิกส่งสัญญาณ `Flagged` ใส่คนที่ใบระดับบริษัทยังคุ้มอยู่** ⇒ กล่องไม่เด้งกลางคันใส่คนที่ยังใช้งานได้

ฝั่ง FE ไม่ต้องแก้อะไรรับสองข้อนี้ — สัญญาณเป็นแค่ trigger FE ยืนยันกับ `/users/me` ทุกครั้งอยู่แล้ว

---

## 4. ความเชื่อผิดที่ต้องล้างก่อนเริ่ม

### 🔴 "เทสต์ `AmloBlockingCoordinatorComponent` ไม่ได้เพราะ quill" — **ไม่จริงแล้ว**

คอมเมนต์เก่าในโค้ดบอกว่า jest parse `@exim/ui-kit` ไม่ได้เพราะลาก `quill` (ESM) ติดมา
นั่นคือเหตุผลที่ effect ทั้งหมดถูกแยกไปไว้ที่ `AmloBlockingCoordinatorLogicService` ตั้งแต่ commit แรก

`apps/shell/jest.config.cts:41-44` ใส่ `quill|parchment|lodash-es` ไว้ใน `transformIgnorePatterns`
เรียบร้อยแล้ว · import และ `TestBed.createComponent()` ทำงานได้ปกติ

ที่ขวางจริงเหลือเรื่อง DI: component ประกาศ `providers: [CorporateState]` ซึ่งลาก
`UserService` → `AUTH_SDK_CONFIG` เข้ามาทั้งสาย ได้ `NG0201`
**override provider เดียวก็จบ:**

```ts
TestBed.overrideComponent(AmloBlockingCoordinatorComponent, {
  set: { providers: [{ provide: CorporateState, useValue: mockCorporateState }] },
});
```

คอมเมนต์ที่ล้าสมัยถูกแก้ไปแล้วทั้งใน service และ spec ของมัน

### ⚠️ `$localize` ไม่มี default text ⇒ ข้อความทุกตัวเป็นสตริงว่างใต้เทสต์

`amloBlockedTitle` ฯลฯ เขียนเป็น `$localize\`:@@amloBlockedTitle:\`` (ไม่มีเนื้อหาต่อท้าย)
⇒ **อย่าเขียน assert ที่อิงคำ** ใช้ `data-testid` กับพฤติกรรมของปุ่มแทน
คำจริงอยู่ในไฟล์ `.arb` เปลี่ยนได้โดยไม่ต้องแก้เทสต์

### ⚠️ ปุ่มของ `ex-modal` เป็น signal input ต้องเรียกฟังก์ชัน

`modal().rightButton()` **ไม่ใช่** `modal().rightButton`
ถ้าลืม จะได้ `[Function inputValueFn]` แทนค่าที่ต้องการ แล้ว assert ผ่านแบบหลอก ๆ

### 🔴 ui-kit ข้าม major — build พังโดยไม่เกี่ยวกับโค้ดที่แก้

`development` ทั้งสอง repo ปัก `@exim/ui-kit` **2.0.2** ใน `pnpm-lock.yaml`
ถ้า `node_modules` ยังเป็น 1.8.x จะได้ error แบบนี้ ทั้งที่โค้ดไม่ผิด:

```
error TS2339: Property 'link' does not exist on type 'MenuItemConfig'
error TS2345: Argument of type 'Event' is not assignable to parameter of type 'string'
```

เจอแล้วให้ `pnpm install --frozen-lockfile` ก่อน อย่าไปไล่แก้เทมเพลต
· branch เก่าที่ `package.json` ยังประกาศ `^1.8.25` ต้อง rebase แล้ว build ก่อนเปิด PR

---

## 5. คำสั่งตรวจ + ตัวเลขที่ต้องได้

### HostApp

```
npx jest -c apps/shell/jest.config.cts "services/amlo|interceptors/amlo|coordinators/amlo-blocking"
npx nx build shell --skip-nx-cache
```

ณ 07/09: **4 suites / 47 tests ผ่าน** · build exit 0

แยกเป็น: component spec 13 · logic service 12 · state service + interceptor ที่เหลือ

### Admin

```
npx jest -c apps/admin/jest.config.cts "pages/amlo|services/amlo"
npx nx build admin --skip-nx-cache
```

ณ 07/09: **8 suites / 191 tests ผ่าน** · build exit 0 (lint 0 errors / 336 warnings ซึ่งมีมาก่อนแล้ว)

### 🔴 อย่าเชื่อ exit code อย่างเดียว

`passWithNoTests` เปิดอยู่ ⇒ pattern ที่ไม่ match อะไรเลยก็ exit 0
**ต้องอ่านบรรทัด `Test Suites:` และ `Tests:` ทุกครั้ง** ถ้า suite เป็น 0 แปลว่าไม่ได้รันอะไร

`apps/shell` **ไม่มี lint target** — `nx lint shell` ไม่มีจริง อย่าอ้างว่าผ่าน lint

### mutation check — ใช้จริงกับงานนี้แล้ว ได้ผล

ก่อน claim ว่าเทสต์คุมอะไรอยู่ ให้ถอด logic ตัวนั้นออกแล้วรันซ้ำ ต้องแดง
ตัวอย่างที่ทำไปเมื่อ 07/09: ถอด `verifyAndEvaluate()` → เทสต์ปิดกล่องแดง ·
ถอด gate `outcome !== 'ok'` → เทสต์สลับที่ถูกปฏิเสธแดง ·
ให้ `blocked-no-alternative` มีปุ่มที่สอง → component spec แดง ·
ถอด filter `Flagged` ออกจาก `switchableCompanies` → component spec แดง

---

## 6. งานที่ยังเปิดอยู่ฝั่ง FE

1. 🔴 **ไม่มีใครกดดูการแก้ 07/09 บนจอจริงเลยสักข้อ** — หลักฐานทั้งหมดเป็น unit test + build
   เคสที่ต้องกดจริงอยู่ใน `UAT_TEST_CASES_AMLO_COMPANY_BLOCKING.xlsx` (โฟลเดอร์เดียวกับไฟล์นี้):
   AMC-205 · AMC-112 ข้อ 4 · AMC-115 · AMC-310 · AMA-008 ข้อ 2.3
2. **`unavailable` ไม่มีทางออกอัตโนมัติ** — ลูกค้าที่ค้างอยู่โหมดนี้จะอยู่ตรงนั้นจนกว่าจะกด
   "ลองใหม่อีกครั้ง" เอง ไม่มี retry ให้ · เป็นการออกแบบ ไม่ใช่ bug แต่ยังไม่มีใครยืนยันว่ายอมรับ
3. **`blocked-no-alternative` / `not-screenable` ที่ไม่มีบริษัทอื่น** — ปุ่ม "ยืนยันการสลับบริษัท"
   ยังแสดงอยู่แต่กดไม่ได้ตลอด อ่านแล้วเหมือนระบบค้าง · ต้องตัดสินว่าจะซ่อนปุ่มไปเลยหรือคงไว้
   **เป็น design call ไม่ใช่ bug** อย่าเปลี่ยนเองโดยไม่ถาม
4. **`AMLO_STATUS_UNAVAILABLE` FE ดักไว้แต่ยังไม่พบโค้ดฝั่ง UserService ที่ส่งมันออกมา**
   เส้นที่เกิดจริงวันนี้คือ 403 `COMPANY_AMLO_STATUS_UNKNOWN` — **ยังไม่ verify** ว่าโค้ดนั้นเคยมีไหม
5. **`amlo-blocking.interceptor.ts` ยังไม่ได้ตรวจซ้ำในรอบนี้** — spec มีอยู่และผ่าน แต่ผมไม่ได้อ่าน
   เนื้อในเทียบกับ error code ฝั่ง BE ปัจจุบัน ใครแตะ error path ควรเริ่มจากตรงนี้

---

## 7. อ่านต่อ

- สถาปัตยกรรมทั้งระบบ + sequence diagram: `private-docs` → `/docs/amlo-screening/01-architecture`
- ตาราง สถานะ และสถานการณ์ A–L: `/docs/amlo-screening/02-data-and-status`
  (สถานการณ์ I คือเส้นสลับบริษัทออกจากกล่อง `not-screenable` แบบละเอียด)
- เคสทดสอบ UAT ฉบับ 5.0 + changelog: โฟลเดอร์เดียวกับไฟล์นี้

⚠️ เอกสารสองไฟล์แรกกำกับพฤติกรรมไว้เป็นคู่ — บรรทัดที่ขึ้นต้นด้วย *เดิม:* คือสิ่งที่ **UAT**
ยังเป็นอยู่ ส่วนข้อความหลักคือ `development` ปัจจุบัน อ่านให้ตรงกับ environment ที่กำลังดู
