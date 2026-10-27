<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminV2Header from '~/components/adminV2/AdminV2Header.vue'
import AdminV2MegaPanel from '~/components/adminV2/AdminV2MegaPanel.vue'
import AdminV2BottomNav from '~/components/adminV2/AdminV2BottomNav.vue'
import AdminV2MobileMenu from '~/components/adminV2/AdminV2MobileMenu.vue'
import AdminV2Popovers from '~/components/adminV2/AdminV2Popovers.vue'
import AdminV2Toast from '~/components/adminV2/AdminV2Toast.vue'
import AdminV2Icon from '~/components/adminV2/AdminV2Icon.vue'
import AdminV2Breadcrumb from '~/components/adminV2/AdminV2Breadcrumb.vue'
import { GROUPS, getAdminDestination, type GroupItem } from '~/components/adminV2/adminV2Data'
definePageMeta({ layout: false })
const route = useRoute(), router = useRouter(), supabase = useSupabaseClient()
const role = ref<'superadmin' | 'admin_tu' | 'guru'>('superadmin'), activeTab = ref<'overview'|'absensi'|'penilaian'|'administrasi'|'lainnya'>('overview')
const student = ref<any>(null), loading = ref(true), error = ref(''), sensitive = ref<any>(null), sensitiveLoading = ref(false), selectedCard = ref<'pelajar'|'ujian'|null>(null)
const attendance = ref({ loaded:false, hadir:0, sakit:0, izin:0, alpa:0, records:[] as any[] }), scores = ref({ loaded:false, rows:[] as any[] })
const isMegaOpen=ref(false), activeMegaGroup=ref<GroupItem|null>(null), isMobileMenuOpen=ref(false), isSearchOpen=ref(false), isNotifOpen=ref(false), isProfileOpen=ref(false), toastMessage=ref(''), isToastVisible=ref(false)
const isSmp=computed(()=>student.value?.grade==='SMP'), jenjang=computed<'smp'|'smk'>(()=>isSmp.value?'smp':'smk'), accent=computed(()=>isSmp.value?'#15803D':'#1B5FD9')
const school=computed(()=>isSmp.value?'SMP IT Bina Cendekia Assalam':'SMK IT Attaqwa 9'), cls=computed(()=>student.value?.classes?.name||'Belum ditempatkan'), wali=computed(()=>student.value?.classes?.homeroom_teacher?.name||'Belum ditetapkan')
const initials=computed(()=>String(student.value?.name||'?').split(' ').slice(0,2).map((x:string)=>x[0]).join('').toUpperCase()), rfid=computed(()=>student.value?.rfid_cards?.find((x:any)=>x.active)?.uid||''), hasRfid=computed(()=>Boolean(rfid.value))
const totalAttendance=computed(()=>attendance.value.hadir+attendance.value.sakit+attendance.value.izin+attendance.value.alpa), attendancePct=computed(()=>totalAttendance.value?Math.round(attendance.value.hadir/totalAttendance.value*100):Number(student.value?.attendance_pct||0))
const canReveal=computed(()=>role.value==='superadmin'||role.value==='admin_tu'), eligible=computed(()=>false)
const studentCode=computed(()=>{const year=String(student.value?.entry_year||'').trim(),nis=String(student.value?.nis||'').trim();return year&&nis?`ATQ9-${year}-${nis}`:nis||'—'})
const cardValidUntil=computed(()=>{const year=Number(student.value?.entry_year);return Number.isFinite(year)&&year>0?year+(isSmp.value?3:4):null})
const studentSlug=(name:string)=>name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('id-ID').trim().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'')
const clean=(v:any)=>String(v??'').trim()||'—', date=(v:any)=>v?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date(String(v)+'T00:00:00')):'—'
const wa=(phone:any)=>'https://wa.me/62'+String(phone||'').replace(/^0/,'').replace(/\D/g,'')
const field=(label:string,value:any,mono=false)=>({label,value:clean(value),mono})
const groups=computed(()=>!student.value?[]:[
 { title:'Identitas Pribadi',icon:'user',fields:[field('Nama Lengkap',student.value.name),field('Jenis Kelamin',student.value.gender==='L'?'Laki-laki':'Perempuan'),field('Tempat Lahir',student.value.birth_place),field('Tanggal Lahir',date(student.value.birth_date)),field('Agama',student.value.religion),field('Nomor HP / WhatsApp',student.value.phone)]},
 { title:'Akademik',icon:'book',fields:[field('Jenjang',school.value),field('Kelas / Rombel',cls.value),field('Jurusan',student.value.classes?.major),field('Wali Kelas',wali.value),field('Tahun Masuk',student.value.entry_year),field('Tanggal Masuk',date(student.value.entry_date)),field('Sekolah Asal',student.value.previous_school),field('No. Seri Ijazah Sebelumnya',student.value.previous_diploma_number,true),field('Status Siswa',student.value.student_status)]},
 { title:'Alamat & Tempat Tinggal',icon:'home',fields:[field('Alamat Lengkap',student.value.address),field('RT / RW',[student.value.rt,student.value.rw].filter(Boolean).join(' / ')),field('Kelurahan / Desa',student.value.village),field('Kecamatan',student.value.district),field('Kota / Kabupaten',student.value.city),field('Jenis Tempat Tinggal',student.value.living_type),field('Transportasi',student.value.transportation),field('Jarak Rumah ke Sekolah',student.value.distance_km&&student.value.distance_km+' km')]},
 { title:'Fisik & Data Tambahan',icon:'doc',fields:[field('Anak ke-',student.value.birth_order),field('Jumlah Saudara Kandung',student.value.siblings_count),field('Berat Badan',student.value.weight_kg&&student.value.weight_kg+' kg'),field('Tinggi Badan',student.value.height_cm&&student.value.height_cm+' cm'),field('Lingkar Kepala',student.value.head_circumference_cm&&student.value.head_circumference_cm+' cm'),field('Hobi',student.value.hobby),field('Cita-cita',student.value.ambition),field('Catatan',student.value.notes)]}
])
const parents=computed(()=>!student.value?[]:[{title:'Ayah / Wali',name:student.value.father_name,phone:student.value.father_phone,fields:[field('Tahun Lahir',student.value.father_birth_year),field('Pendidikan',student.value.father_education),field('Pekerjaan',student.value.father_job),field('Penghasilan',student.value.father_income)]},{title:'Ibu Kandung',name:student.value.mother_name,phone:student.value.mother_phone,fields:[field('Tahun Lahir',student.value.mother_birth_year),field('Pendidikan',student.value.mother_education),field('Pekerjaan',student.value.mother_job),field('Penghasilan',student.value.mother_income)]}])
async function loadStudent(){loading.value=true;error.value='';const key=decodeURIComponent(String(route.params.id||'')),legacyUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key),fields='id,nis,nisn,name,gender,grade,birth_place,birth_date,religion,address,phone,entry_year,entry_date,rt,rw,village,district,city,living_type,transportation,previous_school,previous_diploma_number,birth_order,siblings_count,weight_kg,height_cm,head_circumference_cm,distance_km,hobby,ambition,notes,father_name,father_birth_year,father_education,father_job,father_income,father_phone,mother_name,mother_birth_year,mother_education,mother_job,mother_income,mother_phone,student_status,active,attendance_pct,created_at,class_id,rfid_cards(uid,active),classes(name,major,active,homeroom_teacher:teachers(name))';const r=legacyUuid?await supabase.from('students').select(fields).eq('id',key).maybeSingle():await supabase.from('students').select(fields).ilike('name',key.replace(/-/g,' ')).maybeSingle();if(r.error||!r.data)error.value='Data siswa tidak ditemukan.';else{student.value=r.data;if(legacyUuid)await router.replace('/adminV2/siswa/'+encodeURIComponent(studentSlug(r.data.name)))}loading.value=false}
async function loadAttendance(){if(attendance.value.loaded||!student.value)return;const n=new Date(),a=new Date(n.getFullYear(),n.getMonth(),1).toISOString().slice(0,10),b=new Date(n.getFullYear(),n.getMonth()+1,0).toISOString().slice(0,10),r=await supabase.from('attendance').select('attendance_date,time_in,status,source').eq('student_id',student.value.id).gte('attendance_date',a).lte('attendance_date',b).order('attendance_date',{ascending:false});if(r.error){error.value='Rekap absensi tidak dapat dimuat: '+r.error.message;return}const x=r.data||[];attendance.value={loaded:true,hadir:x.filter((v:any)=>['tepat_waktu','terlambat'].includes(v.status)).length,sakit:x.filter((v:any)=>v.status==='sakit').length,izin:x.filter((v:any)=>v.status==='izin').length,alpa:x.filter((v:any)=>v.status==='alpa').length,records:x}}
async function loadScores(){if(scores.value.loaded||!student.value?.class_id)return;const b=await supabase.from('agenda_buku').select('id,subjects(name,kkm)').eq('kelas_id',student.value.class_id).eq('semester',1),ids=(b.data||[]).map((x:any)=>x.id);if(b.error){error.value='Data penilaian tidak dapat dimuat: '+b.error.message;return}if(!ids.length){scores.value={loaded:true,rows:[]};return}const [n,h,m]=await Promise.all([supabase.from('agenda_nilai').select('buku_id,jenis,nilai').eq('siswa_id',student.value.id).in('buku_id',ids),supabase.from('agenda_kehadiran').select('buku_id,status').eq('siswa_id',student.value.id).in('buku_id',ids),supabase.from('agenda_pertemuan').select('buku_id').in('buku_id',ids)]);if(n.error||h.error||m.error){error.value='Data penilaian tidak dapat dimuat dari sumber akademik.';return}scores.value={loaded:true,rows:ids.map((id:string)=>{const q=(n.data||[]).filter((x:any)=>x.buku_id===id),t=q.filter((x:any)=>x.jenis==='tugas').map((x:any)=>Number(x.nilai)),pts=Number(q.find((x:any)=>x.jenis==='pts')?.nilai),pas=Number(q.find((x:any)=>x.jenis==='pas')?.nilai),all=(m.data||[]).filter((x:any)=>x.buku_id===id).length,abs=(h.data||[]).filter((x:any)=>x.buku_id===id).length,meeting=all?Math.round((all-abs)/all*100):null,task=t.length?Math.round(t.reduce((s:number,v:number)=>s+v,0)/t.length):null,final=meeting!==null&&task!==null&&Number.isFinite(pts)&&Number.isFinite(pas)?Math.round(meeting*.3+task*.2+pts*.1+pas*.4):null,book=(b.data||[]).find((x:any)=>x.id===id);return{subject:book?.subjects?.name||'Mata pelajaran',kkm:book?.subjects?.kkm||75,meeting,task,pts:Number.isFinite(pts)?pts:null,pas:Number.isFinite(pas)?pas:null,final}})}}
async function reveal(){if(!canReveal.value||!student.value)return;sensitiveLoading.value=true;const r=await supabase.rpc('student_detail_sensitive',{target_student_id:student.value.id});if(r.error)error.value='Data rahasia tidak dapat ditampilkan: '+r.error.message;else sensitive.value=r.data;sensitiveLoading.value=false}
function openCard(kind:'pelajar'|'ujian'){if(kind==='ujian'&&!eligible.value){toast('Kartu ujian belum dapat dibuka karena status keuangan belum terverifikasi.');return}selectedCard.value=kind}
function escapeHtml(value:any){return String(value??'—').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]||char))}
function downloadCard(kind:'pelajar'|'ujian'){if(kind==='ujian'&&!eligible.value){toast('Kartu ujian hanya dapat diunduh setelah siswa eligible.');return}if(!import.meta.client||!student.value)return;const title=kind==='pelajar'?'Kartu Pelajar':'Kartu Peserta Ujian',detail=kind==='pelajar'?`NIS ${student.value.nis} · NISN ${student.value.nisn}`:`Login ${student.value.nis} · ${cls.value}`,footer=kind==='pelajar'?`Berlaku ${cardValidUntil.value?'s.d. '+cardValidUntil.value:'selama aktif'}`:'Peserta ujian terverifikasi',svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><defs><linearGradient id="a" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#1B5FD9"/><stop offset="1" stop-color="#0B2E63"/></linearGradient></defs><rect width="1200" height="700" rx="42" fill="url(#a)"/><circle cx="1110" cy="80" r="210" fill="#fff" opacity=".1"/><text x="76" y="105" fill="#bfdbfe" font-family="Inter,Arial,sans-serif" font-size="24" font-weight="800" letter-spacing="3">'+escapeHtml(title).toUpperCase()+' — '+escapeHtml(school.value).toUpperCase()+'</text><text x="76" y="250" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="58" font-weight="800">'+escapeHtml(student.value.name)+'</text><text x="76" y="308" fill="#dbeafe" font-family="Inter,Arial,sans-serif" font-size="29">'+escapeHtml(cls.value)+'</text><line x1="76" y1="500" x2="1124" y2="500" stroke="#fff" stroke-opacity=".35"/><text x="76" y="564" fill="#bfdbfe" font-family="Inter,Arial,sans-serif" font-size="21">IDENTITAS</text><text x="76" y="608" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="700">'+escapeHtml(detail)+'</text><text x="1124" y="608" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="700" text-anchor="end">'+escapeHtml(footer)+'</text></svg>',link=document.createElement('a');link.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));link.download=(kind==='pelajar'?'kartu-pelajar-':'kartu-ujian-')+studentSlug(student.value.name)+'.svg';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(link.href);toast('Kartu berhasil diunduh.')}
function closeAll(){isMegaOpen.value=false;isMobileMenuOpen.value=false;isSearchOpen.value=false;isNotifOpen.value=false;isProfileOpen.value=false} function selectModule(t:string){const x=getAdminDestination(t);if(x)router.push(x)} function toast(x:string){toastMessage.value=x;isToastVisible.value=true;setTimeout(()=>isToastVisible.value=false,2400)}
watch(activeTab,t=>{if(t==='absensi')void loadAttendance();if(t==='penilaian')void loadScores()});onMounted(loadStudent)
</script>

<template><div class="min-h-screen bg-[#EEF2F7] text-[#101828] pb-24 lg:pb-12" @click="closeAll">
<div class="sticky top-0 z-50" @click.stop>
<AdminV2Header :jenjang="jenjang" :role="role" :groups="GROUPS" current-route="akademik" :active-group-id="activeMegaGroup?.id||'akademik'" :is-mega-open="isMegaOpen" @update:jenjang="router.push('/adminV2/siswa')" @toggle-mega="g=>{activeMegaGroup=g;isMegaOpen=!isMegaOpen}" @open-mobile-menu="isMobileMenuOpen=true" @toggle-search="isSearchOpen=!isSearchOpen" @toggle-notif="isNotifOpen=!isNotifOpen" @toggle-profile="isProfileOpen=!isProfileOpen"/>
<AdminV2Breadcrumb :items="[{label:'Portal Admin',to:'/adminV2'},{label:'Akademik'},{label:'Data Siswa',to:'/adminV2/siswa'},{label:student?.name||'Detail Siswa'}]" :badge="school" :jenjang="jenjang"/>
<AdminV2MegaPanel :open="isMegaOpen" :group="activeMegaGroup" :jenjang="jenjang" @close="isMegaOpen=false" @select-item="selectModule"/>
</div>
<div v-if="loading||error" class="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8">
<div class="rounded-2xl border px-4 py-3 text-sm font-semibold" :class="error?'border-[#F5C6C0] bg-[#FFF8F7] text-[#B42318]':'border-[#C9DCFB] bg-[#F5F8FF] text-[#12459B]'">{{error||'Memuat detail siswa…'}}</div>
</div>
<template v-if="student">
<section class="relative overflow-hidden text-white" :class="isSmp?'bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#14532D]':'bg-gradient-to-br from-[#1B5FD9] via-[#12459B] to-[#0B2E63]'">
<div class="relative mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
<button type="button" class="mb-5 inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white" @click="router.push('/adminV2/siswa')">
<AdminV2Icon name="back" :size="14"/>Kembali ke Data Siswa</button>
<div class="flex flex-wrap items-center gap-4">
<div class="grid size-20 place-items-center rounded-[24px] border border-white/45 bg-white/15 text-2xl font-extrabold">{{initials}}</div>
<div class="min-w-0 flex-1">
<h1 class="text-2xl font-extrabold sm:text-3xl">{{student.name}}</h1>
<p class="mt-1 text-sm text-white/80">{{cls}} <span v-if="student.classes?.major">• {{student.classes.major}}</span> • {{school}}</p>
<div class="mt-3 flex flex-wrap gap-2">
<span class="rounded-full bg-white px-3 py-1 text-xs font-bold" :style="{color:accent}">{{student.student_status}}</span>
<span class="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold">Wali Kelas: {{wali}}</span>
<span class="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold">Administrasi belum diverifikasi</span>
</div>
</div>
<button type="button" class="min-h-11 rounded-xl bg-white px-4 text-xs font-bold" :style="{color:accent}" @click="router.push('/adminV2/siswa')">Edit Biodata</button>
</div>
<div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
<div v-for="x in [{v:attendancePct+'%',l:'Kehadiran bulan berjalan',i:'cal'},{v:'—',l:'Rata-rata nilai',i:'book'},{v:'—',l:'Tunggakan Administrasi',i:'wallet'},{v:hasRfid?'Aktif':'Belum ada',l:'Status Smartcard',i:'shield'}]" :key="x.l" class="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3.5">
<AdminV2Icon :name="x.i" :size="18"/>
<div>
<b class="block text-base">{{x.v}}</b>
<span class="text-[11px] font-semibold text-white/75">{{x.l}}</span>
</div>
</div>
</div>
</div>
</section>
<main class="relative z-10 mx-auto -mt-9 max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-8">
<div class="grid gap-4 lg:grid-cols-[348px_1fr]">
<aside class="space-y-4">
<section class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="mb-3 text-sm font-extrabold">Fakta Cepat</h2>
<dl class="divide-y divide-[#EFF2F7] text-xs">
<div v-for="x in [field('ID Siswa',studentCode,true),field('NIS',student.nis,true),field('NISN',student.nisn,true),field('Tahun Masuk',student.entry_year),field('UID Smartcard',rfid,true)]" :key="x.label" class="flex justify-between gap-3 py-2">
<dt class="text-[#667085]">{{x.label}}</dt>
<dd class="text-right font-bold" :class="x.mono?'font-mono text-[#12459B]':''">{{x.value}}</dd>
</div>
</dl>
<div class="mt-3 grid grid-cols-2 gap-2">
<a v-if="student.father_phone" :href="wa(student.father_phone)" target="_blank" class="grid min-h-10 place-items-center rounded-xl bg-[#E7F8F0] text-xs font-bold text-[#067647]">WA Ayah</a>
<a v-if="student.mother_phone" :href="wa(student.mother_phone)" target="_blank" class="grid min-h-10 place-items-center rounded-xl bg-[#E7F8F0] text-xs font-bold text-[#067647]">WA Ibu</a>
</div>
</section>
<section class="rounded-[20px] bg-white p-4 shadow-xs">
<div class="mb-3 flex items-center gap-2">
<AdminV2Icon name="book" :size="16" class="text-[#1B5FD9]"/>
<h2 class="text-sm font-extrabold">Kartu Pelajar</h2>
</div>
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5FD9] to-[#0B2E63] p-4 text-white">
<div class="absolute -right-12 -top-16 size-40 rounded-full bg-white/10"/>
<p class="relative text-[10px] font-extrabold uppercase tracking-widest text-white/70">Kartu Pelajar &middot; {{school}}</p>
<p class="relative mt-3 break-words text-base font-extrabold">{{student.name}}</p>
<p class="relative mt-1 text-xs text-white/80">{{cls}}<span v-if="student.classes?.major"> &middot; {{student.classes.major}}</span></p>
<div class="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/25 pt-3 text-[10px]">
<div><span class="block text-white/65">NIS</span><b class="break-all">{{student.nis}}</b></div>
<div><span class="block text-white/65">NISN</span><b class="break-all">{{student.nisn}}</b></div>
<div><span class="block text-white/65">Berlaku</span><b>{{cardValidUntil?'s.d. '+cardValidUntil:'aktif'}}</b></div>
</div>
</div>
<p class="mt-3 text-xs leading-5 text-[#667085]">Satu kartu untuk identitas dan absensi tap RFID{{rfid?' - UID '+rfid:''}}.</p>
<div class="mt-3 grid grid-cols-2 gap-2">
<button type="button" class="min-h-11 rounded-xl border border-[#C9DCFB] text-xs font-bold text-[#1B5FD9]" @click="openCard('pelajar')">Lihat</button>
<button type="button" class="min-h-11 rounded-xl bg-[#1B5FD9] text-xs font-bold text-white" @click="downloadCard('pelajar')">Unduh Kartu</button>
</div>
</section>
<section class="rounded-[20px] bg-white p-4 shadow-xs">
<div class="mb-3 flex items-center gap-2">
<AdminV2Icon name="doc" :size="16" class="text-[#7C3AED]"/>
<h2 class="text-sm font-extrabold">Kartu Ujian (CBT)</h2>
</div>
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2E63] to-[#1B5FD9] p-4 text-white" :class="!eligible&&'opacity-70'">
<div class="absolute -right-12 -top-16 size-40 rounded-full bg-white/10"/>
<p class="relative text-[10px] font-extrabold uppercase tracking-widest text-white/70">Kartu Peserta Ujian</p>
<p class="relative mt-3 break-words text-base font-extrabold">{{student.name}}</p>
<p class="relative mt-1 text-xs text-white/80">Login: {{student.nis}} - {{cls}}</p>
<div class="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/25 pt-3 text-[10px]">
<div><span class="block text-white/65">Status</span><b>{{eligible?'Eligible':'Terkunci'}}</b></div>
<div><span class="block text-white/65">Kelas</span><b class="break-words">{{cls}}</b></div>
<div><span class="block text-white/65">Sesi</span><b>-</b></div>
</div>
</div>
<p class="mt-3 text-xs leading-5 text-[#667085]">{{eligible?'Status eligible dibaca dari Keuangan dengan aturan yang sama di aplikasi CBT siswa.':'Status keuangan belum tersedia untuk memverifikasi kelayakan CBT.'}}</p>
<div class="mt-3 grid grid-cols-2 gap-2">
<button type="button" class="min-h-11 rounded-xl border text-xs font-bold" :class="eligible?'border-[#C9DCFB] text-[#1B5FD9]':'cursor-not-allowed border-[#EAECF0] text-[#98A2B3]'" :disabled="!eligible" @click="openCard('ujian')">Lihat</button>
<button type="button" class="min-h-11 rounded-xl text-xs font-bold" :class="eligible?'bg-[#1B5FD9] text-white':'cursor-not-allowed bg-[#EAECF0] text-[#98A2B3]'" :disabled="!eligible" @click="downloadCard('ujian')">Unduh Kartu</button>
</div>
</section>
</aside>
<section class="min-w-0">
<nav class="mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-[#E7EBF2] bg-white p-1.5 shadow-xs">
<button v-for="x in [{id:'overview',l:'Overview',i:'grid'},{id:'absensi',l:'Rekap Absensi',i:'clock'},{id:'penilaian',l:'Penilaian',i:'chart'},{id:'administrasi',l:'Administrasi',i:'wallet'},{id:'lainnya',l:'Data Lainnya',i:'doc'}]" :key="x.id" type="button" class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-bold" :class="activeTab===x.id?(isSmp?'bg-[#15803D] text-white':'bg-[#1B5FD9] text-white'):'text-[#667085] hover:bg-[#F8FAFD]'" @click="activeTab=x.id as any">
<AdminV2Icon :name="x.i" :size="14"/>{{x.l}}</button>
</nav>
<div v-if="activeTab==='overview'" class="space-y-4">
<section v-for="g in groups" :key="g.title" class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="mb-4 text-sm font-extrabold">{{g.title}}</h2>
<dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
<div v-for="x in g.fields" :key="x.label">
<dt class="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">{{x.label}}</dt>
<dd class="mt-1 break-words text-sm font-semibold" :class="x.mono?'font-mono text-xs':''">{{x.value}}</dd>
</div>
</dl>
</section>
<section class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<div class="mb-4 flex items-center justify-between">
<h2 class="text-sm font-extrabold">Data Rahasia</h2>
<button v-if="canReveal&&!sensitive" type="button" class="min-h-10 rounded-full bg-[#E8F0FE] px-3 text-xs font-bold text-[#1B5FD9]" :disabled="sensitiveLoading" @click="reveal">{{sensitiveLoading?'Memuat…':'Tampilkan'}}</button>
</div>
<dl class="grid gap-4 sm:grid-cols-2">
<div v-for="x in [['NIK Siswa','nik'],['No. Kartu Keluarga','noKk'],['NIK Ayah','fatherNik'],['NIK Ibu','motherNik']]" :key="x[1]">
<dt class="text-[10px] font-bold uppercase text-[#98A2B3]">{{x[0]}}</dt>
<dd class="mt-1 font-mono text-sm font-bold">{{sensitive?sensitive[x[1]]||'—':'—'}}</dd>
</div>
</dl>
<p class="mt-4 text-xs leading-5 text-[#667085]">Nilai lengkap hanya diminta dari server saat diakses Superadmin atau Admin TU.</p>
</section>
<section class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="mb-4 text-sm font-extrabold">Orang Tua</h2>
<div class="grid gap-4 md:grid-cols-2">
<article v-for="p in parents" :key="p.title" class="rounded-2xl border border-[#E7EBF2] bg-[#F8FAFD] p-4">
<div class="flex justify-between gap-2">
<h3 class="font-extrabold">{{p.title}}</h3>
<a v-if="p.phone" :href="wa(p.phone)" target="_blank" class="rounded-full bg-[#E7F8F0] px-3 py-1 text-[11px] font-bold text-[#067647]">Chat WA</a>
</div>
<p class="mt-2 font-semibold">{{clean(p.name)}}</p>
<p class="mt-1 text-xs text-[#667085]">{{clean(p.phone)}}</p>
<dl class="mt-4 grid gap-3">
<div v-for="x in p.fields" :key="x.label">
<dt class="text-[10px] font-bold uppercase text-[#98A2B3]">{{x.label}}</dt>
<dd class="mt-1 text-sm font-semibold">{{x.value}}</dd>
</div>
</dl>
</article>
</div>
</section>
</div>
<section v-else-if="activeTab==='absensi'" class="space-y-4">
<div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="text-sm font-extrabold">Rekap Kehadiran Bulan Berjalan</h2>
<div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
<div v-for="x in [['Hadir',attendance.hadir,'#067647'],['Sakit',attendance.sakit,'#3538CD'],['Izin',attendance.izin,'#B54708'],['Alpa',attendance.alpa,'#B42318']]" :key="x[0]" class="rounded-2xl border border-[#E7EBF2] bg-[#F8FAFD] p-4">
<b class="text-xl" :style="{color:x[2]}">{{x[1]}}</b>
<span class="mt-1 block text-xs text-[#667085]">{{x[0]}}</span>
</div>
</div>
<p class="mt-5 text-xs text-[#667085]">Kehadiran: <b>{{attendancePct}}%</b>. Sumber: modul Absensi RFID.</p>
</div>
<div class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="mb-3 text-sm font-extrabold">Riwayat Tap</h2>
<p v-if="!attendance.records.length" class="text-sm text-[#667085]">Belum ada data absensi pada bulan berjalan.</p>
<div v-else class="divide-y divide-[#EFF2F7]">
<div v-for="x in attendance.records" :key="x.attendance_date+x.status" class="flex justify-between gap-4 py-3 text-sm">
<span>{{date(x.attendance_date)}}</span>
<b class="capitalize">{{x.status.replace('_',' ')}}</b>
</div>
</div>
</div>
</section>
<section v-else-if="activeTab==='penilaian'" class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="text-sm font-extrabold">Nilai per Mata Pelajaran</h2>
<p class="mt-1 text-xs text-[#667085]">Komposisi F.32: Pertemuan 30% • Tugas 20% • PTS 10% • PAS 40%</p>
<div class="mt-5 overflow-x-auto">
<table class="min-w-[720px] w-full text-sm">
<thead class="bg-[#F8FAFD] text-left text-[10px] uppercase text-[#667085]">
<tr>
<th class="p-3">Mata Pelajaran</th>
<th class="p-3">Pertemuan</th>
<th class="p-3">Tugas</th>
<th class="p-3">PTS</th>
<th class="p-3">PAS</th>
<th class="p-3">Nilai Akhir</th>
<th class="p-3">KKM</th>
<th class="p-3">Status</th>
</tr>
</thead>
<tbody>
<tr v-for="x in scores.rows" :key="x.subject" class="border-t border-[#EFF2F7]">
<td class="p-3 font-bold">{{x.subject}}</td>
<td class="p-3">{{x.meeting??'—'}}</td>
<td class="p-3">{{x.task??'—'}}</td>
<td class="p-3">{{x.pts??'—'}}</td>
<td class="p-3">{{x.pas??'—'}}</td>
<td class="p-3 font-extrabold" :style="{color:accent}">{{x.final??'—'}}</td>
<td class="p-3">{{x.kkm}}</td>
<td class="p-3">{{x.final===null?'Belum lengkap':x.final>=x.kkm?'Tuntas':'Belum tuntas'}}</td>
</tr>
<tr v-if="!scores.rows.length">
<td colspan="8" class="p-6 text-center text-[#667085]">Belum ada nilai tersimpan untuk semester ini.</td>
</tr>
</tbody>
</table>
</div>
</section>
<section v-else-if="activeTab==='administrasi'" class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="text-sm font-extrabold">Ringkasan Administrasi</h2>
<div class="mt-4 rounded-2xl border border-[#FDE68A] bg-[#FFFAEB] p-4 text-sm text-[#92400E]">
<b>Data Keuangan belum tersedia di sumber terintegrasi.</b>
<p class="mt-1 leading-6">Nominal tagihan, pembayaran, dan status eligible CBT tidak ditampilkan agar tidak memalsukan status siswa.</p>
</div>
</section>
<section v-else-if="activeTab==='lainnya'" class="grid gap-4 md:grid-cols-2">
<article class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="text-sm font-extrabold">Berkas & Dokumen</h2>
<dl class="mt-3 divide-y divide-[#EFF2F7] text-sm">
<div v-for="x in ['Kartu Keluarga','Akta Kelahiran','KTP Ayah & Ibu','Ijazah Sebelumnya','Pas Foto 3x4']" :key="x" class="flex items-center justify-between gap-3 py-3">
<dt class="text-[#475467]">{{x}}</dt>
<dd class="font-bold text-[#98A2B3]">Belum terhubung</dd>
</div>
</dl>
<p class="mt-4 text-xs leading-5 text-[#667085]">Sumber berkas akan dibaca dari SPMB saat penyimpanan dokumen sudah terintegrasi.</p>
</article>
<article class="rounded-[20px] border border-[#E7EBF2] bg-white p-5 shadow-xs">
<h2 class="text-sm font-extrabold">Catatan & Riwayat</h2>
<dl class="mt-3 divide-y divide-[#EFF2F7] text-sm">
<div class="flex justify-between gap-3 py-3"><dt class="text-[#475467]">Catatan Siswa</dt><dd class="max-w-[60%] break-words text-right font-semibold">{{clean(student.notes)}}</dd></div>
<div class="flex justify-between gap-3 py-3"><dt class="text-[#475467]">Kontak Darurat</dt><dd class="text-right font-semibold">{{clean(student.mother_phone||student.father_phone)}}</dd></div>
<div class="flex justify-between gap-3 py-3"><dt class="text-[#475467]">Riwayat Mutasi</dt><dd class="text-right font-semibold">Belum ada</dd></div>
<div class="flex justify-between gap-3 py-3"><dt class="text-[#475467]">Terdaftar Sejak</dt><dd class="text-right font-semibold">{{date(student.created_at)}}</dd></div>
</dl>
</article>
</section>
</section>
</div>
</main>
<div v-if="selectedCard" class="fixed inset-0 z-[70] grid place-items-end bg-[#101828]/60 p-4 sm:place-items-center" @click="selectedCard=null">
<section class="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-2xl" @click.stop>
<div class="mb-4 flex items-center justify-between">
<h2 class="text-base font-extrabold">{{selectedCard==='pelajar'?'Kartu Pelajar':'Kartu Peserta Ujian'}}</h2>
<button type="button" class="grid size-11 place-items-center rounded-xl bg-[#F2F4F7] text-[#475467]" aria-label="Tutup" @click="selectedCard=null"><AdminV2Icon name="x" :size="18"/></button>
</div>
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5FD9] to-[#0B2E63] p-5 text-white">
<div class="absolute -right-14 -top-16 size-44 rounded-full bg-white/10"/>
<p class="relative text-[10px] font-extrabold uppercase tracking-widest text-white/70">{{selectedCard==='pelajar'?'Kartu Pelajar':'Kartu Peserta Ujian'}} · {{school}}</p>
<p class="relative mt-4 break-words text-xl font-extrabold">{{student.name}}</p>
<p class="relative mt-1 text-sm text-white/80">{{selectedCard==='pelajar'?cls:'Login: '+student.nis+' · '+cls}}</p>
<div class="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/25 pt-4 text-xs">
<div><span class="block text-white/65">NIS</span><b>{{student.nis}}</b></div>
<div><span class="block text-white/65">{{selectedCard==='pelajar'?'NISN':'Status'}}</span><b>{{selectedCard==='pelajar'?student.nisn:'Eligible'}}</b></div>
<div><span class="block text-white/65">{{selectedCard==='pelajar'?'Berlaku':'Kelas'}}</span><b>{{selectedCard==='pelajar'?(cardValidUntil?'s.d. '+cardValidUntil:'aktif'):cls}}</b></div>
</div>
</div>
<button type="button" class="mt-4 min-h-11 w-full rounded-xl bg-[#1B5FD9] text-sm font-bold text-white" @click="downloadCard(selectedCard)">Unduh Kartu</button>
</section>
</div>
</template>
<AdminV2BottomNav :role="role" :jenjang="jenjang" @open-menu="isMobileMenuOpen=true" @nav-click="selectModule"/>
<AdminV2MobileMenu :open="isMobileMenuOpen" :role="role" :groups="GROUPS" :jenjang="jenjang" @close="isMobileMenuOpen=false" @select-item="selectModule"/>
<AdminV2Popovers :is-search-open="isSearchOpen" :is-notif-open="isNotifOpen" :is-profile-open="isProfileOpen" :role="role" :jenjang="jenjang" @close-all="closeAll" @select-module="selectModule"/>
<AdminV2Toast :visible="isToastVisible" :message="toastMessage"/>
</div>
</template>
