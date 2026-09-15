import { Injectable, inject, signal } from '@angular/core';
import { TermService } from '../../../../services/term-service/term.service';
import {
  ConditionType,
  TermsChangeType,
} from '../../../../services/term-service/term.model';

export type TermVersionStatus = 'published' | 'inactive';
export type TermVersionType = 'user' | 'corporate';

export interface TermVersionDetailInfo {
  code: string;
  name: string;
  version: string;
  createdBy: string;
  createdAt: string;
  type: TermVersionType;
  conditionType?: ConditionType;
  conditionTitle?: string;
  checkboxLabel?: string;
  checkboxRequired?: boolean;
  status: TermVersionStatus;
  content: string;
  operationBy?: string;
}

const MOCK_CONTENT_TH = `<h2>ข้อตกลงและเงื่อนไขการใช้บริการ</h2>
<p>กรุณาอ่านข้อกำหนดและเงื่อนไขต่าง ๆ ดังต่อไปนี้อย่างละเอียด โดยการเข้าถึงบริการของบริษัทไม่ว่าในช่องทางใด ถือว่าท่านตกลงที่จะผูกพันตามข้อตกลงและเงื่อนไขการใช้บริการนี้</p>
<h3>1. ขอบเขตการใช้บริการ</h3>
<p>บริษัทให้สิทธิ์แก่ท่านในการใช้บริการเพื่อวัตถุประสงค์ส่วนตัวและไม่ใช่เชิงพาณิชย์เท่านั้น ท่านไม่มีสิทธิ์ถ่ายโอน อนุญาต หรือให้สิทธิ์ช่วงบริการนี้แก่บุคคลใด</p>
<h3>2. ความเป็นส่วนตัวและการคุ้มครองข้อมูล</h3>
<p>บริษัทจะเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่านตามนโยบายความเป็นส่วนตัวที่บริษัทกำหนด ซึ่งท่านสามารถศึกษาได้ที่ช่องทางการให้บริการของบริษัท</p>
<h3>3. ข้อจำกัดความรับผิดชอบ</h3>
<p>บริษัทจะไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้นจากการใช้งานหรือไม่สามารถใช้งานบริการได้ ไม่ว่าจะเกิดจากสาเหตุใดก็ตาม</p>
<h3>4. การเปลี่ยนแปลงข้อกำหนด</h3>
<p>บริษัทขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขนี้ได้ตลอดเวลา โดยจะแจ้งให้ท่านทราบผ่านช่องทางการให้บริการ การใช้บริการต่อไปหลังจากการแจ้งเปลี่ยนแปลงถือว่าท่านยอมรับข้อกำหนดที่เปลี่ยนแปลงนั้น</p>`;

const MOCK_CONTENT_CORPORATE = `<h2>ข้อตกลงและเงื่อนไขการใช้บริการสำหรับนิติบุคคล</h2>
<p>ข้อกำหนดและเงื่อนไขนี้ใช้บังคับกับนิติบุคคลที่ใช้บริการของบริษัท โดยผู้มีอำนาจกระทำการแทนนิติบุคคลต้องดำเนินการยืนยันตัวตนและลงนามยอมรับข้อกำหนดนี้</p>
<h3>1. คำนิยาม</h3>
<p>"นิติบุคคล" หมายถึง บริษัท ห้างหุ้นส่วน สมาคม หรือองค์กรใด ๆ ที่จดทะเบียนตามกฎหมาย "ผู้แทน" หมายถึง บุคคลที่ได้รับมอบอำนาจให้กระทำการแทนนิติบุคคล</p>
<h3>2. การยืนยันตัวตน</h3>
<p>นิติบุคคลต้องแสดงเอกสารหลักฐานการจดทะเบียนและมอบอำนาจที่ถูกต้องตามกฎหมาย บริษัทขอสงวนสิทธิ์ในการปฏิเสธการให้บริการหากเอกสารไม่ครบถ้วนหรือไม่ถูกต้อง</p>
<h3>3. ความรับผิดชอบ</h3>
<p>นิติบุคคลรับผิดชอบต่อการกระทำของผู้แทนและพนักงานทั้งหมดที่ใช้บริการในนามของนิติบุคคล</p>`;

const MOCK_DETAIL: Record<string, TermVersionDetailInfo> = {
  'TC-1234569_v00.00.03': {
    code: 'TC-1234569',
    name: 'เงื่อนไขการใช้บริการ',
    version: 'v00.00.03',
    createdBy: 'สมชาย ดีมาก',
    createdAt: '27 พ.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'published',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234569_v00.00.02': {
    code: 'TC-1234569',
    name: 'เงื่อนไขการใช้บริการ',
    version: 'v00.00.02',
    createdBy: 'สมชาย ดีมาก',
    createdAt: '01 เม.ย. 2569 (10:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234569_v00.00.01': {
    code: 'TC-1234569',
    name: 'เงื่อนไขการใช้บริการ',
    version: 'v00.00.01',
    createdBy: 'สมชาย ดีมาก',
    createdAt: '01 ม.ค. 2569 (08:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234568_v00.00.02': {
    code: 'TC-1234568',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'วิภา รักงาน',
    createdAt: '20 พ.ค. 2569 (14:30 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234568_v00.00.01': {
    code: 'TC-1234568',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'วิภา รักงาน',
    createdAt: '10 ก.พ. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234567_v00.00.05': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.05',
    createdBy: 'สวัสดี ฉันแอดมิน',
    createdAt: '15 พ.ค. 2569 (11:00 น.)',
    type: 'user',
    status: 'published',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234567_v00.00.04': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.04',
    createdBy: 'สวัสดี ฉันแอดมิน',
    createdAt: '01 พ.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234567_v00.00.03': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.03',
    createdBy: 'สวัสดี ฉันแอดมิน',
    createdAt: '01 เม.ย. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234567_v00.00.02': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'สวัสดี ฉันแอดมิน',
    createdAt: '01 มี.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234567_v00.00.01': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'สวัสดี ฉันแอดมิน',
    createdAt: '01 ก.พ. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234566_v00.00.04': {
    code: 'TC-1234566',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.04',
    createdBy: 'ประภัส ใจงาม',
    createdAt: '10 พ.ค. 2569 (13:00 น.)',
    type: 'user',
    status: 'published',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234566_v00.00.03': {
    code: 'TC-1234566',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.03',
    createdBy: 'ประภัส ใจงาม',
    createdAt: '01 เม.ย. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234566_v00.00.02': {
    code: 'TC-1234566',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'ประภัส ใจงาม',
    createdAt: '01 มี.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234566_v00.00.01': {
    code: 'TC-1234566',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'ประภัส ใจงาม',
    createdAt: '01 ก.พ. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234565_v00.00.01': {
    code: 'TC-1234565',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'กานต์ ศรีสุข',
    createdAt: '05 พ.ค. 2569 (10:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234564_v00.00.02': {
    code: 'TC-1234564',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'มาลี สวยงาม',
    createdAt: '01 พ.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234564_v00.00.01': {
    code: 'TC-1234564',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'มาลี สวยงาม',
    createdAt: '01 มี.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234563_v00.00.03': {
    code: 'TC-1234563',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.03',
    createdBy: 'ธนัช พรอมร',
    createdAt: '25 เม.ย. 2569 (15:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234563_v00.00.02': {
    code: 'TC-1234563',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'ธนัช พรอมร',
    createdAt: '01 มี.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234563_v00.00.01': {
    code: 'TC-1234563',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'ธนัช พรอมร',
    createdAt: '01 ม.ค. 2569 (08:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234562_v00.00.04': {
    code: 'TC-1234562',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.04',
    createdBy: 'ณรงค์ สมศักดิ์',
    createdAt: '20 เม.ย. 2569 (09:30 น.)',
    type: 'user',
    status: 'published',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234562_v00.00.03': {
    code: 'TC-1234562',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.03',
    createdBy: 'ณรงค์ สมศักดิ์',
    createdAt: '01 เม.ย. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234562_v00.00.02': {
    code: 'TC-1234562',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.02',
    createdBy: 'ณรงค์ สมศักดิ์',
    createdAt: '01 มี.ค. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-1234562_v00.00.01': {
    code: 'TC-1234562',
    name: 'การสื่อสารส่งเสริมการขาย',
    version: 'v00.00.01',
    createdBy: 'ณรงค์ สมศักดิ์',
    createdAt: '01 ก.พ. 2569 (09:00 น.)',
    type: 'user',
    status: 'inactive',
    content: MOCK_CONTENT_TH,
  },
  'TC-2234569_v00.00.02': {
    code: 'TC-2234569',
    name: 'เงื่อนไขการใช้บริการนิติบุคคล',
    version: 'v00.00.02',
    createdBy: 'สมชาย ดีมาก',
    createdAt: '27 พ.ค. 2569 (09:00 น.)',
    type: 'corporate',
    status: 'published',
    content: MOCK_CONTENT_CORPORATE,
  },
  'TC-2234569_v00.00.01': {
    code: 'TC-2234569',
    name: 'เงื่อนไขการใช้บริการนิติบุคคล',
    version: 'v00.00.01',
    createdBy: 'สมชาย ดีมาก',
    createdAt: '01 ม.ค. 2569 (08:00 น.)',
    type: 'corporate',
    status: 'inactive',
    content: MOCK_CONTENT_CORPORATE,
  },
  'TC-2234568_v00.00.01': {
    code: 'TC-2234568',
    name: 'การสื่อสารส่งเสริมการขาย (นิติบุคคล)',
    version: 'v00.00.01',
    createdBy: 'วิภา รักงาน',
    createdAt: '15 พ.ค. 2569 (11:00 น.)',
    type: 'corporate',
    status: 'inactive',
    content: MOCK_CONTENT_CORPORATE,
  },
};

@Injectable()
export class TermVersionDetailState {
  private readonly termService = inject(TermService);
  private documentCode = '';
  private versionCode = '';

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly detail = signal<TermVersionDetailInfo | null>(null);
  readonly isAccepted = signal(false);
  readonly editModal = signal<EditStatusModal | null>(null);

  async loadDetail(code: string, version: string): Promise<void> {
    this.documentCode = code;
    this.versionCode = version;
    this.isLoading.set(true);
    try {
      const data = await this.termService.getVersionDetail(code, version);
      const firstCondition = data.conditions?.[0];
      const checkboxLabel =
        data.conditionTitle?.trim() || firstCondition?.label?.trim() || '';
      const checkboxRequired =
        firstCondition?.isRequired ?? data.conditionType === 'MANDATORY';

      this.detail.set({
        code: data.documentCode,
        name: data.name,
        version: data.version,
        createdBy: data.operationBy || data.createdBy || '-',
        createdAt: formatIsoDate(data.createdAt),
        type: data.conditionType === 'MANDATORY' ? 'user' : 'corporate',
        conditionType: data.conditionType,
        conditionTitle: data.conditionTitle ?? '',
        checkboxLabel,
        checkboxRequired,
        status: data.status === 'PUBLISHED' ? 'published' : 'inactive',
        content: data.content ?? '',
      });
    } catch {
      this.detail.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleAccepted(): void {
    this.isAccepted.update((v) => !v);
  }

  openEditModal(): void {
    const d = this.detail();
    if (!d) return;
    this.editModal.set({
      code: d.code,
      version: d.version,
      selectedStatus: d.status,
      changeType: 'MAJOR',
    });
  }

  closeEditModal(): void {
    this.editModal.set(null);
  }

  selectEditStatus(status: TermVersionStatus): void {
    const m = this.editModal();
    if (m) this.editModal.set({ ...m, selectedStatus: status });
  }

  selectChangeType(changeType: TermsChangeType): void {
    const m = this.editModal();
    if (m) this.editModal.set({ ...m, changeType });
  }

  async saveEditStatus(): Promise<void> {
    const m = this.editModal();
    if (!m) return;
    this.isSaving.set(true);
    try {
      if (m.selectedStatus === 'published') {
        await this.termService.publishVersion(m.code, m.version, m.changeType);
        this.triggerToast('Published ข้อมูลเรียบร้อยแล้ว');
      } else {
        await this.termService.deactivateVersion(m.code, m.version);
        this.triggerToast('Inactive ข้อมูลเรียบร้อยแล้ว');
      }
      this.closeEditModal();
      await this.loadDetail(this.documentCode, this.versionCode);
    } catch {
      this.triggerToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  private readonly _showToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _toastVariant = signal<'success' | 'error'>('success');
  private _toastTimer?: ReturnType<typeof setTimeout>;

  readonly showToast = this._showToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly toastVariant = this._toastVariant.asReadonly();

  triggerToast(
    message: string,
    variant: 'success' | 'error' = 'success',
  ): void {
    this._toastMessage.set(message);
    this._toastVariant.set(variant);
    this._showToast.set(false);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this._showToast.set(true), 0);
  }

  dismissToast(): void {
    this._showToast.set(false);
  }
}

export interface EditStatusModal {
  code: string;
  version: string;
  selectedStatus: TermVersionStatus;
  changeType: TermsChangeType;
}

function formatIsoDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    const datePart = date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Bangkok',
    });
    const timePart = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Bangkok',
    });
    return `${datePart} (${timePart} น.)`;
  } catch {
    return isoDate;
  }
}
