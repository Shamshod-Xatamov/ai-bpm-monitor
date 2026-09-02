# AI-BPM Monitor — Universal Excel Import va AI Analysis Implementation Plan

> Status: MVP implementatsiyasi yakunlandi; verification davomida yangilandi  
> Sana: 2026-08-31  
> Stack: Next.js 16.3.2, React 19, Neon PostgreSQL, Prisma ORM, SheetJS CE, Gemini API

## 1. Maqsad

Hozirgi AI-BPM Monitor frontend demo holatida va barcha dashboard ma'lumotlari `lib/*-data.js` fayllaridagi mock datasetlardan olinadi. Ushbu ishning maqsadi mavjud demo interfeysni buzmasdan, foydalanuvchi turli tuzilishdagi spreadsheet fayllarni yuklay oladigan, tizim ularning strukturasini tushunadigan, real hisob-kitoblar bajaradigan va tushunarli AI xulosa chiqaradigan minimal ishlaydigan modul yaratishdir.

Yakuniy minimal oqim:

```text
Spreadsheet upload
  -> xavfsiz parse
  -> sheet/header/column profiling
  -> Gemini semantic mapping
  -> mapping validation yoki user review
  -> deterministic analysis
  -> Gemini narrative insights
  -> saqlangan analysis result
```

Bu modul mavjud mock dashboarddan mustaqil ishlaydi. Import qilingan data mavjud mock datani almashtirmaydi.

## 2. Qat'iy product qarorlari

### 2.1. Mavjud mock data saqlanadi

Quyidagi fayllardagi demo ma'lumotlar MVP davomida o'zgartirilmaydi va database bilan almashtirilmaydi:

- `lib/dashboard-data.js`
- `lib/processes-data.js`
- `lib/monitoring-data.js`
- `lib/kpi-data.js`
- `lib/ai-analytics-data.js`
- `lib/forecasts-data.js`
- `lib/risks-data.js`
- `lib/live-stream.js`

Mavjud ekranlar ishlashda davom etadi. Faqat yangi import navigation elementi, import sahifalari va kerak bo'lsa mavjud AI Analytics sahifasidan yangi modulga link qo'shiladi.

### 2.2. “Istalgan Excel” nimani anglatadi

MVP turli nom, tartib va ma'nodagi ustunlarga ega spreadsheetlarni qabul qiladi. Masalan, quyidagi nomlarning barchasi bir xil semantic rolga tushishi mumkin:

```text
department
bo'lim
бўлим
отдел
business_unit
team_name
```

Tizim qat'iy bitta template talab qilmaydi. Buning o'rniga:

1. fizik fayl formatini parser o'qiydi;
2. tizim header va data chegaralarini topadi;
3. column profiler data turlarini aniqlaydi;
4. Gemini biznes ma'nosi va mappingni aniqlaydi;
5. confidence past bo'lsa foydalanuvchi mappingni tasdiqlaydi yoki tuzatadi.

“Istalgan” degani 100% cheksiz format kafolati emas. Quyidagilar MVP doirasidan tashqarida yoki manual review talab qiladi:

- parol bilan himoyalangan fayllar;
- buzilgan yoki to'liq o'qilmaydigan fayllar;
- faqat rasm/chart mavjud, cell data bo'lmagan workbooklar;
- VBA macro ichida yashiringan data yoki hisoblashlar;
- tashqi workbooklarga bog'langan formula natijalari mavjud bo'lmagan fayllar;
- mutlaqo kontekstsiz `A`, `B`, `C` kabi sarlavhalar;
- bir cell ichiga butun jadval joylangan tartibsiz fayllar;
- belgilangan xavfsizlik limitidan katta fayllar.

### 2.3. AI hisob-kitob manbasi emas

Gemini quyidagi ishlarni qiladi:

- dataset turini taxmin qilish;
- sheetlar vazifasini tushuntirish;
- ustunlarning semantic rollarini aniqlash;
- mumkin bo'lgan analysis recipe'larni taklif qilish;
- deterministic natijalardan tushunarli xulosa va tavsiya yozish.

Gemini quyidagilarni bevosita bajarmaydi:

- database query yaratib, tekshiruvsiz ishga tushirish;
- `sum`, `average`, `duration`, `SLA`, trend yoki outlier natijasini o'zi o'ylab topish;
- fayldagi formulalarni execute qilish;
- foydalanuvchi datasi asosida tashqi action bajarish.

Barcha raqamli natijalar allowlist qilingan server analysis engine tomonidan hisoblanadi. AI xulosasidagi har bir muhim raqam hisoblangan evidence bilan bog'lanadi.

## 3. MVP scope

### 3.1. MVP ichiga kiradi

- spreadsheet drag-and-drop va file picker;
- `.xlsx`, `.xls`, `.xlsb`, `.xlsm`, `.csv` va `.ods` formatlarini o'qish;
- ko'p sheetli workbook;
- noodatiy header qatorini aniqlash;
- oddiy va ikki qatorli headerlarni birlashtirish;
- bo'sh qator/ustunlarni chetlab o'tish;
- physical va semantic column profiling;
- Gemini structured-output schema inference;
- confidence va warninglar;
- mapping review/correction UI;
- raw va normalized datani PostgreSQL'ga saqlash;
- universal data-quality analysis;
- aniqlangan schema imkon bersa process, time-series, plan/fact va financial analysis;
- deterministic metric va findinglar;
- Gemini summary va recommendation;
- import history va result detail;
- failure, retry va partial-success holatlari;
- mock data bilan eski ekranlarning regressiyasiz ishlashi.

### 3.2. MVP ichiga kirmaydi

- real authentication va multi-tenant access control;
- faylni Google Drive/OneDrive'dan olish;
- avtomatik scheduled import;
- millionlab qatorli streaming warehouse pipeline;
- background queue infrastructure;
- spreadsheet ichiga natijani qayta yozish;
- formula engine yoki macro execution;
- real model training;
- imported data bilan asosiy mock dashboardni avtomatik almashtirish;
- collaboration/comments;
- original faylni doimiy object storage'da saqlash.

## 4. Texnik arxitektura

```mermaid
flowchart TD
    UI[Import UI] -->|multipart upload| UP[POST /api/imports]
    UP --> VAL[File validation]
    VAL --> PARSE[SheetJS parser]
    PARSE --> PROFILE[Header detection + column profiler]
    PROFILE --> PG[(PostgreSQL via Prisma)]
    UI -->|start inference| INF[POST /api/imports/:id/infer]
    INF --> GEMINI[Gemini structured output]
    GEMINI --> VERIFY[Zod + semantic validation]
    VERIFY -->|high confidence| ANALYZE[Deterministic analysis engine]
    VERIFY -->|low confidence| REVIEW[Mapping review UI]
    REVIEW -->|confirmed mapping| ANALYZE
    ANALYZE --> RESULT[Metrics + findings + evidence]
    RESULT --> NARRATIVE[Gemini narrative pass]
    NARRATIVE --> PG
    PG --> PAGE[Import result page]
```

### 4.1. Runtime qarori

- Import va AI endpointlar Next.js Route Handler bo'ladi.
- Spreadsheet parsing va PostgreSQL client faqat Node.js runtime'da ishlaydi.
- Tegishli route fayllarda `runtime = "nodejs"` belgilanadi.
- SheetJS, Prisma, Gemini SDK va secretlar Client Component ichiga import qilinmaydi.
- Database access `server-only` Data Access Layer orqali bajariladi.
- UI faqat minimal DTO oladi; raw database record to'liq clientga yuborilmaydi.
- Original fayl local filesystem'da doimiy saqlanmaydi.

### 4.2. Nega pipeline bir necha requestga bo'linadi

Bitta uzoq upload request ichida parse, Gemini va analysis bajarish timeout va retry muammolarini keltiradi. Shu sabab pipeline quyidagi checkpointlarga bo'linadi:

1. `upload + parse + profile`;
2. `semantic inference`;
3. `mapping confirmation`, agar kerak bo'lsa;
4. `deterministic analysis`;
5. `narrative generation`.

Har bir bosqich database statusiga yoziladi. Gemini xato bersa parsed data saqlanib qoladi va faqat inference qayta ishlatiladi.

## 5. Texnologiya qarorlari

### 5.1. PostgreSQL

PostgreSQL quyidagilar uchun ishlatiladi:

- import metadata;
- sheet va column profile;
- arbitrary rowlar uchun `JSONB`;
- user-confirmed schema mapping;
- analysis runs va AI insights;
- retry va audit holatlari.

Hozirgi environment Neon PostgreSQL'dan foydalanadi. Runtime querylar pooled
`DATABASE_URL`, schema boshqaruvi esa direct `DIRECT_URL` orqali ishlaydi.

### 5.2. Prisma ORM

MVP uchun Prisma ORM 7.10.x pinned versiyasi ishlatiladi. Sabablar:

- mavjud Next.js loyihasiga qo'shish oqimi barqaror va tushunarli;
- Neon serverless PostgreSQL uchun `@prisma/adapter-neon` ishlatiladi;
- migration va generated client repo ichida boshqariladi;
- Prisma 7 hozir ham rasmiy qo'llab-quvvatlanadi;
- Prisma 8 migratsiyasi alohida upgrade sifatida keyin bajarilishi mumkin.

Rejalashtirilgan package'lar:

```text
dependencies:
  @prisma/client
  @prisma/adapter-neon
  @neondatabase/serverless
  @google/genai
  zod
  xlsx (official SheetJS CE tarball)

devDependencies:
  prisma
  dotenv
  tsx
```

Exact patch versiyalar install vaqtida `pnpm-lock.yaml`da pin qilinadi.

### 5.3. Spreadsheet parser

Universal format support uchun SheetJS Community Edition ishlatiladi. Sabab: `.xlsx` bilan birga legacy `.xls`, `.xlsb`, `.xlsm`, CSV va ODS'ni ham o'qiydi.

Package eski npm mirroridan emas, SheetJS rasmiy tarball manbasidan olinadi va exact version pin qilinadi. Parser faqat serverda ishlaydi.

Macro hech qachon execute qilinmaydi. Formula uchun:

- cached cell value mavjud bo'lsa qiymat olinadi;
- formula text metadata sifatida saqlanishi mumkin;
- cached value yo'q bo'lsa `null` va warning qaytariladi;
- tashqi linklar resolve qilinmaydi.

### 5.4. Gemini

- SDK: `@google/genai`.
- Default model environment orqali boshqariladi: `GEMINI_MODEL`.
- Boshlang'ich tavsiya: `gemini-3.7-flash`.
- API key faqat server environment'da saqlanadi.
- Structured output JSON Schema/Zod bilan cheklanadi.
- Temperature imkon qadar past va natija deterministik formatga yaqin bo'ladi.
- Model, prompt version va response schema version har bir inference'da yoziladi.

## 6. Environment va config

`.env.example` ichiga secret bo'lmagan placeholderlar qo'shiladi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ai_bpm"
GEMINI_API_KEY="replace-me"
GEMINI_MODEL="gemini-3.7-flash"

IMPORT_MAX_FILE_BYTES="10485760"
IMPORT_MAX_SHEETS="20"
IMPORT_MAX_ROWS="50000"
IMPORT_MAX_COLUMNS_PER_SHEET="250"
IMPORT_SAMPLE_ROWS_PER_SHEET="25"
IMPORT_AUTO_CONFIRM_THRESHOLD="0.82"
```

Qoidalar:

- haqiqiy API key commit qilinmaydi;
- `NEXT_PUBLIC_` prefix ishlatilmaydi;
- server ishga tushganda majburiy envlar Zod bilan validate qilinadi;
- Gemini key yo'q bo'lsa upload va profiling ishlaydi, import `NEEDS_REVIEW`ga o'tadi;
- database yo'q bo'lsa import endpoint aniq configuration error qaytaradi.

## 7. Data modeli

Model nomlari implementation davomida Prisma naming talabiga moslashtirilishi mumkin, lekin quyidagi ma'no saqlanadi.

### 7.1. Enumlar

```text
ImportStatus:
  UPLOADING
  PARSING
  PROFILED
  INFERRING
  NEEDS_REVIEW
  READY_TO_ANALYZE
  ANALYZING
  COMPLETED
  PARTIAL
  FAILED

MappingStatus:
  DRAFT
  AUTO_CONFIRMED
  USER_CONFIRMED
  REJECTED

AnalysisStatus:
  PENDING
  RUNNING
  COMPLETED
  PARTIAL
  FAILED
```

### 7.2. `DataImport`

```text
id                String/cuid primary key
originalName      String
extension         String
mimeType          String?
sizeBytes         Int
sha256            String
status            ImportStatus
progress          Int
activeStage       String?
sheetCount        Int
totalRows         Int
totalColumns      Int
parserVersion     String
errorCode         String?
errorMessage      String?
warnings          Json
createdAt         DateTime
updatedAt         DateTime
completedAt       DateTime?
```

`sha256` duplicate uploadni aniqlash, debugging va idempotency uchun ishlatiladi. Bir xil faylni qayta tahlil qilishga ruxsat beriladi, lekin UI ogohlantiradi.

### 7.3. `WorkbookSheet`

```text
id                String/cuid primary key
importId          String foreign key
sheetIndex        Int
name              String
visibility        String?
selected          Boolean
headerStartRow    Int?
headerDepth       Int
dataStartRow      Int?
rowCount          Int
columnCount       Int
qualityScore      Float?
metadata          Json
warnings          Json
```

### 7.4. `ColumnProfile`

```text
id                String/cuid primary key
sheetId           String foreign key
columnIndex       Int
columnKey         String
originalLabel     String
normalizedLabel   String
physicalType      String
semanticRole      String?
semanticType      String?
nullable          Boolean
nullCount         Int
uniqueCount       Int?
confidence        Float?
sampleValues      Json
statistics        Json
mappingConfig     Json?
warnings          Json
```

### 7.5. `ImportedRow`

```text
id                BigInt/autoincrement primary key
importId          String foreign key
sheetId           String foreign key
sourceRowNumber   Int
rawData           Json     // PostgreSQL JSONB
normalizedData    Json?    // mappingdan keyin hosil bo'ladi
validationErrors  Json
createdAt         DateTime
```

Indexlar:

- `(importId, sheetId)`;
- `(sheetId, sourceRowNumber)` unique;
- kerak bo'lganda `rawData` yoki `normalizedData` uchun GIN index keyingi scale bosqichida.

### 7.6. `SchemaMapping`

```text
id                String/cuid primary key
importId          String foreign key
version           Int
status            MappingStatus
datasetType       String
languageHints     Json
mapping           Json
relationships     Json
analysisPlan      Json
confidence        Float
blockingWarnings  Json
modelName         String?
promptVersion     String
schemaVersion     String
createdAt         DateTime
confirmedAt       DateTime?
```

Har bir user correction yangi mapping version yaratadi. Eski mapping audit uchun saqlanadi.

### 7.7. `AnalysisRun`

```text
id                String/cuid primary key
importId          String foreign key
mappingId         String foreign key
status            AnalysisStatus
engineVersion     String
metrics           Json
findings          Json
chartSpecs        Json
dataQuality       Json
startedAt         DateTime
completedAt       DateTime?
errorCode         String?
errorMessage      String?
```

### 7.8. `AiNarrative`

```text
id                String/cuid primary key
analysisRunId     String foreign key
modelName         String
promptVersion     String
summary           String
recommendations   Json
limitations       Json
evidenceLinks     Json
usageMetadata     Json?
createdAt         DateTime
```

## 8. File ingestion pipeline

### 8.1. Upload validation

Server quyidagilarni tekshiradi:

- request `multipart/form-data` ekanligi;
- `file` mavjudligi;
- filename va size;
- extension allowlist;
- MIME type yordamchi signal sifatida;
- file signature/magic bytes;
- maximum size;
- bo'sh fayl emasligi;
- parser workbookni ochishi;
- sheet/row/column limitlari.

Faqat extensionga ishonilmaydi. File nomi loglarda sanitize qilinadi.

### 8.2. Workbook parsing

Parser har bir sheet uchun cell matrix yaratadi va quyidagilarni saqlaydi:

- sheet nomi va index;
- hidden/visible holati;
- used range;
- merged cells metadata;
- value, detected type va optional formula metadata;
- blank row/column information.

Style, rang, rasm va chartlar analysis source sifatida ishlatilmaydi. Ular mavjud bo'lsa warning metadata qaytarilishi mumkin.

### 8.3. Header detection

Header detector dastlabki 30 meaningful qatorni score qiladi:

- non-empty cell ratio;
- string label ratio;
- ustun nomlarining uniqueness'i;
- undan keyingi qatorlarda type consistency;
- merged headerlar;
- ketma-ket ikki qatorli header ehtimoli;
- title/subtitle qatorlaridan farqi.

Natija:

```text
headerStartRow
headerDepth
dataStartRow
confidence
warnings
```

Confidence past bo'lsa mapping review UI header qatorini qo'lda tanlash imkonini beradi.

### 8.4. Column key normalization

Har bir original label saqlanadi. Internal key quyidagicha hosil qilinadi:

- Unicode normalize;
- trim va whitespace collapse;
- lower-case comparison form;
- punctuationni xavfsiz separatorga aylantirish;
- duplicate nomlarga suffix berish;
- bo'sh headerga `column_1` kabi nom berish.

Original label UI'da ko'rsatiladi; normalized key database va analysis engine uchun ishlatiladi.

### 8.5. Physical profiling

Gemini chaqirilishidan oldin server har bir ustun uchun aniqlaydi:

- string/number/boolean/date/blank/mixed ratio;
- null count va null rate;
- unique count yoki capped estimate;
- min/max/mean/median, agar numeric bo'lsa;
- earliest/latest, agar date bo'lsa;
- top categories, agar categorical bo'lsa;
- average/max text length;
- suspected ID, email, phone, currency, percent va duration;
- suspicious formula yoki error cells;
- 20 tagacha representative sample.

Bu bosqich Gemini bo'lmasa ham ishlaydi.

### 8.6. Row persistence

- Qatorlar `createMany` orqali batchlarda yoziladi.
- Tavsiya batch size: 500–1000 row.
- Har bir qator original source row numberini saqlaydi.
- Import metadata va rowlar imkon qadar transaction/checkpoint bilan yoziladi.
- Parsing yarim yo'lda xato bersa import `FAILED` bo'ladi va yarim data analysisga berilmaydi.
- Failed import metadata debugging uchun qoladi; rowlarni cleanup qilish alohida transactionda bajariladi.

## 9. Gemini semantic inference

### 9.1. Gemini'ga yuboriladigan payload

To'liq workbook yuborilmaydi. Quyidagilar yuboriladi:

- original filename'ning sanitized shakli;
- sheet nomlari va o'lchamlari;
- header nomlari;
- physical type distribution;
- statistik profile;
- representative sample values;
- local heuristic taxminlari;
- foydalanuvchi tanlagan locale, default `uz-UZ`;
- output schema va qat'iy instructions.

Uzun text samplelar truncate qilinadi. Bir ustundan ortiqcha PII namuna yuborilmaydi.

### 9.2. Structured output contract

Gemini taxminan quyidagi contractga mos JSON qaytaradi:

```json
{
  "datasetType": "business_process_events",
  "datasetSummary": "...",
  "languageHints": ["uz", "ru"],
  "primarySheetIds": ["..."],
  "sheets": [
    {
      "sheetId": "...",
      "purpose": "fact_table",
      "confidence": 0.93,
      "columns": [
        {
          "columnId": "...",
          "semanticRole": "department",
          "semanticType": "category",
          "businessLabel": "Bo'lim",
          "unit": null,
          "confidence": 0.97,
          "reason": "..."
        }
      ]
    }
  ],
  "relationships": [],
  "analysisRecipes": [
    {
      "operation": "duration",
      "inputColumnIds": ["start-id", "end-id"],
      "groupByColumnIds": ["department-id"],
      "priority": 1
    }
  ],
  "blockingWarnings": [],
  "confidence": 0.91
}
```

### 9.3. Semantic role katalogi

Boshlang'ich allowlist:

```text
identifier
name
description
category
department
team
owner
employee
customer
supplier
process
stage
status
priority
start_datetime
end_datetime
event_datetime
deadline
duration
sla_target
actual
target
amount
cost
revenue
quantity
percent
score
risk
location
free_text
unknown
```

Gemini yangi arbitrary role bilan analysis engine'ga command bera olmaydi. Noma'lum role `unknown` yoki `free_text`ga tushadi va mapping review'da ko'rsatiladi.

### 9.4. Analysis operation allowlist

Gemini faqat quyidagi operationlardan analysis plan taklif qiladi:

```text
count
distinct_count
sum
average
median
min_max
distribution
group_by
trend
duration
completion_rate
target_variance
sla_breach_rate
missing_rate
duplicate_rate
iqr_outlier
zscore_outlier
top_n
correlation
```

Gemini SQL yoki JavaScript code qaytarmaydi. Server operation, column ID va type compatibility'ni validate qilib, xavfsiz internal functionni chaqiradi.

### 9.5. Confidence policy

Auto-confirm shartlari:

- overall confidence `>= 0.82`;
- selected primary sheet mavjud;
- analysis uchun kerakli columnlar mavjud;
- blocking warning yo'q;
- Gemini mapping physical profile bilan zid emas;
- column IDlar faqat real workbook columnlariga tegishli.

Shartlardan biri bajarilmasa import `NEEDS_REVIEW`ga o'tadi.

### 9.6. Gemini failure policy

- request timeout bilan chegaralanadi;
- transient error uchun maksimal 2 retry;
- exponential backoff va jitter;
- invalid JSON bo'lsa structured repair uchun bir retry;
- quota yoki auth xatosi aniq error code bilan saqlanadi;
- parsed data o'chirilmaydi;
- local heuristic mapping review uchun ko'rsatiladi;
- foydalanuvchi keyin `Retry AI mapping` qila oladi.

## 10. Deterministic analysis engine

### 10.1. Har qanday dataset uchun universal analysis

- row/sheet/column count;
- missing value rate;
- duplicate row estimate/count;
- column type consistency;
- numeric summary;
- categorical top values;
- date coverage;
- invalid date/number count;
- suspicious constant columns;
- potential ID uniqueness;
- outlier candidates;
- data-quality score.

### 10.2. Process dataset aniqlansa

Kerakli columnlar mavjud bo'lsa:

- instance count;
- completed/in-progress/cancelled distribution;
- cycle time;
- average va median duration;
- SLA breach rate;
- department/process/stage bo'yicha performance;
- bottleneck candidate;
- overdue items;
- throughput trend;
- rework/repeated event candidate;
- top risk groups.

### 10.3. Plan/fact dataset aniqlansa

- actual vs target;
- absolute va percentage variance;
- department/category bo'yicha variance;
- vaqt bo'yicha trend;
- eng katta negative va positive deviationlar.

### 10.4. Financial dataset aniqlansa

- amount/cost/revenue totals;
- period comparison;
- category concentration;
- abnormal transaction candidates;
- missing yoki negative value warnings;
- plan/fact bo'lsa budget variance.

### 10.5. Time-series dataset aniqlansa

- period aggregation;
- moving average;
- trend direction;
- period-over-period change;
- gap va spike detection;
- yetarli tarix bo'lmasa limitation.

### 10.6. Finding evidence contract

Har bir finding quyidagiga ega bo'ladi:

```text
id
type
severity
title
metricKey
actualValue
baselineValue
unit
affectedRows
group
evidence
calculationMethod
limitations
```

Narrative AI faqat shu contractdagi facts asosida yozadi.

## 11. Narrative generation

Deterministic analysis tugagach Gemini'ga faqat quyidagilar beriladi:

- dataset summary;
- verified mapping;
- computed metrics;
- findings va evidence;
- data-quality limitations;
- desired output language.

Output:

- 3–5 jumlalik executive summary;
- critical/warning/positive insightlar;
- priority bo'yicha tavsiyalar;
- har tavsiyaga evidence reference;
- model ishonmasligi kerak bo'lgan limitationlar.

Gemini yangi raqam qo'shmasligi uchun output schema'dagi numeric value'lar metric IDga bog'lanadi. UI narrative bilan birga `Hisoblash usuli` va evidence'ni ko'rsata oladi.

## 12. API contractlar

### 12.1. `POST /api/imports`

Vazifa: file upload, validation, parsing, profiling va persistence.

Request:

```text
multipart/form-data
file: File
```

Success `201`:

```json
{
  "importId": "...",
  "status": "PROFILED",
  "summary": {
    "sheetCount": 3,
    "rowCount": 1240,
    "columnCount": 27
  },
  "warnings": []
}
```

### 12.2. `GET /api/imports`

Vazifa: import history.

Query:

```text
page
pageSize
status
```

Response faqat list DTO qaytaradi; row data qaytarmaydi.

### 12.3. `GET /api/imports/:id`

Vazifa: import status, sheet summary, mapping status va oxirgi analysis summary.

### 12.4. `POST /api/imports/:id/infer`

Vazifa: Gemini semantic inference. Faqat `PROFILED`, `NEEDS_REVIEW` yoki retry qilinadigan failed inference uchun.

### 12.5. `GET /api/imports/:id/mapping`

Vazifa: current mapping va UI correction uchun column profiles.

### 12.6. `PUT /api/imports/:id/mapping`

Vazifa: user mapping correction va confirmation.

Server barcha sheet/column IDlarni importga tegishli ekanini qayta tekshiradi.

### 12.7. `POST /api/imports/:id/analyze`

Vazifa: tasdiqlangan mapping bilan deterministic analysis va narrative generation.

Idempotency:

- ayni mapping/version uchun completed run mavjud bo'lsa qaytariladi;
- `force=true` faqat keyingi iterationda yoki admin holatida.

### 12.8. `GET /api/imports/:id/analysis`

Vazifa: metrics, findings, chart specs, narrative va limitations.

### 12.9. `POST /api/imports/:id/retry`

Vazifa: faqat failed stage'ni qayta ishga tushirish. Parse xato bo'lsa yangi upload talab qilinadi; inference/narrative xato bo'lsa stored profile/result qayta ishlatiladi.

### 12.10. `DELETE /api/imports/:id`

MVP'da UI'ga qo'shilmasligi mumkin. Qo'shilsa explicit confirmation talab qiladi va relational cascade orqali importga tegishli rows, mapping va analysis o'chiriladi.

## 13. UI/UX rejasi

### 13.1. Navigation

`Operatsiyalar` guruhiga yangi element:

```text
Ma'lumot importi -> /data-imports
```

Yangi icon kerak bo'lsa mavjud `Icon` component tizimi ichida qo'shiladi.

### 13.2. `/data-imports`

Sahifa tarkibi:

- title va qisqa izoh;
- drag-and-drop upload zone;
- supported format va limitlar;
- privacy notice;
- upload/progress state;
- recent imports table;
- status, filename, rows, upload time va action.

### 13.3. `/data-imports/[id]`

Progress stepper:

```text
1. Fayl
2. Struktura
3. Mapping
4. Tahlil
5. Natija
```

Holatlar:

- parsing;
- profiling;
- AI interpreting;
- needs review;
- analyzing;
- completed;
- partial;
- failed/retry.

### 13.4. Mapping review UI

Har sheet uchun:

- include/exclude toggle;
- detected header row;
- sample table;
- original column label;
- detected physical type;
- AI semantic role dropdown;
- confidence badge;
- unit/format;
- warning;
- `Confirm mapping` action.

Low-confidence columnlar tepada ko'rsatiladi. User correction qilmagan yuqori-confidence mappinglar saqlanadi.

### 13.5. Result UI

Natija quyidagicha joylashadi:

- dataset executive summary;
- data-quality score va warnings;
- top KPI cards;
- chart specs asosidagi grafiklar;
- critical/warning/positive findings;
- har finding uchun evidence drawer;
- AI recommendations;
- analysis limitations;
- `Mappingni ko'rish`, `AI xulosani retry qilish` actions.

MVP chartlar existing CSS/SVG patternlar orqali quriladi; yangi og'ir chart library faqat zarur bo'lsa qo'shiladi.

### 13.6. Existing AI Analytics integratsiyasi

Birinchi delivery'da `AI tahlil` mock sahifasi o'zgarmaydi. Faqat `Real faylni tahlil qilish` linki yangi import moduliga olib borishi mumkin. Keyingi iterationda mock va imported resultlar tab orqali ajratiladi.

## 14. Kod strukturasi

Rejalashtirilgan fayl/folderlar:

```text
app/
  (product)/
    data-imports/
      page.jsx
      [id]/
        page.jsx
  api/
    imports/
      route.js
      [id]/
        route.js
        infer/route.js
        mapping/route.js
        analyze/route.js
        analysis/route.js
        retry/route.js

components/
  imports/
    ImportCenter.jsx
    ImportCenter.module.css
    UploadDropzone.jsx
    ImportProgress.jsx
    MappingReview.jsx
    AnalysisResults.jsx

lib/
  server/
    env.js
    db.js
    imports/
      repository.js
      parser.js
      header-detector.js
      profiler.js
      normalizer.js
      inference.js
      inference-schema.js
      analysis-engine.js
      narrative.js
      errors.js
      limits.js
  imports/
    contracts.js
    formatters.js

prisma/
  schema.prisma
  migrations/

prisma.config.ts
.env.example
```

Server modullar `import "server-only"` bilan belgilanadi. Shared client contractlar secret yoki database client import qilmaydi.

## 15. Security va privacy

### 15.1. Secret isolation

- `GEMINI_API_KEY` faqat server env'da;
- API key log qilinmaydi;
- client bundle'da Gemini SDK yo'q;
- env object clientga serialize qilinmaydi;
- `.env*` gitignore'da qoladi, faqat `.env.example` commit qilinadi.

### 15.2. Untrusted spreadsheet

Spreadsheet celllari untrusted input hisoblanadi:

- HTML sifatida render qilinmaydi;
- `dangerouslySetInnerHTML` ishlatilmaydi;
- formula yoki macro execute qilinmaydi;
- `javascript:` hyperlinklar chiqarib tashlanadi;
- filename sanitize qilinadi;
- cell text prompt instruction sifatida bajarilmasligi system promptda aniq yoziladi;
- long cell content truncate qilinadi;
- prompt-injection test fixture bilan tekshiriladi.

### 15.3. Resource limits

- default file size: 10 MB;
- default total row limit: 50,000;
- default sheet limit: 20;
- default column limit: 250 per sheet;
- compressed archive abuse/zip bombga qarshi parse timeout va dimension limit;
- Gemini request timeout va retry cap;
- upload endpoint rate limiting production hardeningda.

### 15.4. Data exposure

- Gemini'ga to'liq workbook emas, compact profile/sample yuboriladi;
- API response raw rowsni default qaytarmaydi;
- logs cell contentni saqlamaydi;
- error message secret yoki raw promptni ochmaydi;
- deletion qo'shilsa importga tegishli barcha data cascade bilan o'chadi.

### 15.5. Authentication holati

Hozirgi login demo bo'lgani sabab MVP single-tenant hisoblanadi. Productiondan oldin:

- real auth;
- organization/user foreign key;
- har endpointda auth + ownership check;
- audit log;
- row-level access policy

alohida majburiy milestone bo'ladi.

## 16. Error taxonomy

Stable internal error codelar:

```text
IMPORT_FILE_MISSING
IMPORT_FILE_TOO_LARGE
IMPORT_FORMAT_UNSUPPORTED
IMPORT_SIGNATURE_INVALID
IMPORT_PASSWORD_PROTECTED
IMPORT_WORKBOOK_EMPTY
IMPORT_LIMIT_EXCEEDED
IMPORT_PARSE_FAILED
IMPORT_PROFILE_FAILED
DB_UNAVAILABLE
DB_WRITE_FAILED
GEMINI_NOT_CONFIGURED
GEMINI_AUTH_FAILED
GEMINI_RATE_LIMITED
GEMINI_TIMEOUT
GEMINI_INVALID_OUTPUT
MAPPING_INVALID
MAPPING_REVIEW_REQUIRED
ANALYSIS_NOT_SUPPORTED
ANALYSIS_FAILED
NARRATIVE_FAILED
```

Userga qisqa va tushunarli Uzbek message ko'rsatiladi; technical detail server logda `importId` bilan bog'lanadi.

`NARRATIVE_FAILED` butun analysisni failed qilmaydi. Deterministic natijalar mavjud bo'lsa status `PARTIAL` bo'ladi.

## 17. Performance strategiyasi

- workbook buffer faqat request davomida memory'da;
- original file diskka yozilmaydi;
- raw rows batch insert qilinadi;
- samples va statistics parsing paytida bir passda yig'iladi;
- Gemini'ga rowlar emas compact profile yuboriladi;
- analysis 50k row cap ichida server memory'da yoki incremental aggregatorda bajariladi;
- API list endpointlari pagination bilan;
- Client Componentga raw dataset yuborilmaydi;
- Prisma client development hot-reload vaqtida singleton bo'ladi;
- og'ir parser client bundle'ga kirmaydi.

Katta scale uchun keyingi yo'l:

- direct object-storage upload;
- background job queue;
- streaming parser;
- warehouse yoki materialized aggregate;
- progress event/polling;
- import chunking.

## 18. Observability

Har stage uchun structured log:

```text
importId
stage
status
durationMs
fileBytes
sheetCount
rowCount
warningCount
modelName
retryCount
errorCode
```

Loglarda quyidagilar bo'lmaydi:

- API key;
- full database URL;
- raw spreadsheet row;
- Gemini'ga yuborilgan to'liq sample payload;
- PII cell values.

Optional health endpoint database connectivity va Gemini configuration mavjudligini secretni ochmasdan ko'rsatadi.

## 19. Testing rejasi

### 19.1. Unit testlar

- header row detection;
- multi-row header merge;
- normalized key generation;
- physical type inference;
- date/number/percent/currency parsing;
- column statistics;
- semantic output validation;
- confidence policy;
- allowlisted analysis operations;
- process duration va SLA calculation;
- outlier detection;
- error mapping.

### 19.2. Integration testlar

- upload -> rows PostgreSQL'da;
- parse/profile status transitions;
- mocked Gemini -> mapping persistence;
- invalid Gemini output -> `NEEDS_REVIEW`;
- mapping correction -> new version;
- analysis -> metrics/findings;
- narrative failure -> `PARTIAL`;
- retry failed stage;
- duplicate upload warning;
- unsupported/oversized file rejection.

### 19.3. Fixture workbooklar

```text
standard-process.xlsx
nonstandard-header.xlsx
two-row-header.xlsx
multi-sheet-relations.xlsx
uzbek-russian-columns.xlsx
legacy-format.xls
binary-workbook.xlsb
macro-enabled.xlsm
semicolon.csv
financial-plan-fact.xlsx
generic-survey.xlsx
missing-values.xlsx
formula-with-cache.xlsx
formula-without-cache.xlsx
prompt-injection-cells.xlsx
empty-workbook.xlsx
corrupted.xlsx
oversized-generated.xlsx
```

### 19.4. Gemini test strategiyasi

- CI unit/integration testlarida Gemini SDK mock qilinadi;
- structured output fixturelar versionlanadi;
- real API smoke test default o'chirilgan bo'ladi;
- `RUN_GEMINI_TESTS=1` va real key bilan manual/secure CI smoke ishlaydi;
- real test samplelari synthetic data bo'ladi.

### 19.5. UI testlar

- drag/drop va file picker;
- upload progress;
- low-confidence mapping correction;
- completed result rendering;
- retry flow;
- mobile layout;
- keyboard navigation;
- screen-reader status announcements.

### 19.6. Majburiy verification

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Prisma uchun:

```bash
pnpm prisma validate
pnpm prisma generate
pnpm prisma migrate status
```

## 20. Implementation milestones

MVP holati (2026-09-02): Milestone 0–6 ning asosiy upload, profiling,
Gemini mapping, user confirmation, deterministic analysis, AI narrative va UI
oqimi implementatsiya qilindi. DB-backed background queue, session auth,
organization isolation, persistent data-quality issues va unit/coverage testlari
ham qo‘shildi. Header override, sheet include/exclude UI va keng E2E fixture
matrix keyingi hardening iteratsiyasiga qoldi.

Neon bazada loyihadan oldingi Prisma migration history mavjud, lekin uning
local migration fayllari repoda yo‘q. Shu sabab data yo‘qotadigan reset
qilinmadi va MVP schema o‘zgarishlari idempotent additive SQL orqali qo‘llandi.
`pnpm db:apply-import` shu migrationni qayta xavfsiz bajaradi; tarix baseline
qilinmaguncha bu bazada `prisma migrate dev` ishlatilmaydi.

### Milestone 0 — Baseline va environment

Deliverable:

- current lint/build baseline;
- `.env.example`;
- dependency versions;
- server-only env validation;
- local/hosted PostgreSQL connection qarori.

Acceptance:

- mock app oldingidek build bo'ladi;
- secretlar clientga chiqmaydi;
- missing env aniq error beradi.

### Milestone 1 — Prisma/PostgreSQL foundation

Deliverable:

- Prisma config va schema;
- initial migration;
- Prisma client singleton;
- import repository/DAL;
- DB smoke test.

Acceptance:

- migration fresh database'da ishlaydi;
- basic import record create/read qilinadi;
- generated client builddan o'tadi.

### Milestone 2 — Upload va universal parsing

Deliverable:

- upload Route Handler;
- size/signature/format validation;
- SheetJS parser;
- header detector;
- physical profiler;
- batch row persistence;
- upload UI va import history.

Acceptance:

- `.xlsx`, `.xls`, `.xlsb`, `.xlsm`, `.csv`, `.ods` fixturelar parse bo'ladi;
- existing mock pages o'zgarmaydi;
- bad files tushunarli error beradi;
- profile Gemini'siz ham ko'rinadi.

### Milestone 3 — Gemini schema inference

Deliverable:

- server-only Gemini client;
- prompt v1;
- structured response schema;
- Zod validation;
- confidence policy;
- inference endpoint;
- retry/fallback.

Acceptance:

- turli column nomlari semantic role'ga tushadi;
- invalid/hallucinated column IDs reject qilinadi;
- low confidence reviewga tushadi;
- API key client bundle/logga chiqmaydi.

### Milestone 4 — Mapping review

Deliverable:

- mapping review UI;
- header override;
- sheet include/exclude;
- semantic role correction;
- mapping versioning va confirmation.

Acceptance:

- user noto'g'ri AI mappingni tuzata oladi;
- correction reload'dan keyin saqlanadi;
- faqat confirmed mapping analysisga o'tadi.

### Milestone 5 — Deterministic analysis

Deliverable:

- universal data quality;
- numeric/category/time analysis;
- process, plan/fact va financial recipe'lar;
- findings/evidence contract;
- analysis endpoint;
- chart DTO/spec.

Acceptance:

- UI'dagi har raqam server calculationdan keladi;
- analysis recipe allowlistdan tashqariga chiqa olmaydi;
- unsupported analysis graceful limitation beradi;
- repeated request idempotent.

### Milestone 6 — AI narrative va result UI

Deliverable:

- narrative prompt v1;
- structured narrative schema;
- recommendation/evidence link;
- result dashboard;
- partial-success state;
- AI Analytics sahifasidan real import CTA.

Acceptance:

- narrative yangi raqam o'ylab topmaydi;
- Gemini ishlamasa real metrics ko'rinadi;
- findings evidence bilan ochiladi;
- retry faqat kerakli stage'ni ishlatadi.

### Milestone 7 — Hardening va QA

Deliverable:

- fixture test suite;
- rate limit strategy;
- prompt-injection hardening;
- accessibility/responsive QA;
- performance profiling;
- documentation.

Acceptance:

- lint, format, tests va build o'tadi;
- file limits ishlaydi;
- secrets leak bo'lmaydi;
- 390px, 1440px va 1920px ekranlarda asosiy flow ishlaydi;
- mock pages regressiyasiz.

## 21. Definition of Done

MVP quyidagi holatda tugallangan hisoblanadi:

1. Foydalanuvchi supported spreadsheet yuklay oladi.
2. Data PostgreSQL'da restartdan keyin ham saqlanadi.
3. Tizim header va column typelarini avtomatik topadi.
4. Gemini columnlarning biznes ma'nosini structured mappingga aylantiradi.
5. Past confidence mapping user reviewga chiqadi.
6. User mappingni tasdiqlashi yoki tuzatishi mumkin.
7. Raqamli analysis deterministic server engine orqali hisoblanadi.
8. Gemini faqat verified facts asosida summary va recommendation beradi.
9. Gemini ishlamay qolsa upload va deterministic natijalar yo'qolmaydi.
10. Existing dashboard/process/monitoring/KPI/AI mock datalari o'zgarishsiz ishlaydi.
11. Secretlar repo, client bundle va loglarda mavjud emas.
12. Required test, lint va production build o'tadi.

## 22. Environment inputlari

Majburiy:

- ishlaydigan Neon PostgreSQL `DATABASE_URL` va `DIRECT_URL`;
- Gemini `GEMINI_API_KEY`, server environment orqali;
- deployment target: local/VPS yoki serverless platform.

Tavsiya qilinadi:

- kamida 2–3 xil realga yaqin, sensitive bo'lmagan Excel sample;
- expected business questions, masalan “qayerda kechikish bor?” yoki “qaysi bo'lim rejadan ortda?”;
- MVP file size/row limitini oshirish zarurati bo'lsa oldindan aytish.

API key chat yoki source code ichiga yozilmaydi. User uni local `.env`/secret manager orqali o'rnatadi.

## 23. Risklar va mitigation

| Risk                               | Ta'sir                        | Mitigation                                                      |
| ---------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| Noodatiy header noto'g'ri topiladi | Column mapping xato           | Header confidence + manual override                             |
| Gemini semantic mapping xato       | Noto'g'ri analysis            | Zod validation + confidence gate + user review                  |
| Gemini raqam uydiradi              | Ishonchsiz natija             | Deterministic metrics + evidence-bound narrative                |
| Juda katta workbook                | Memory/timeout                | File/row/sheet limits + future background queue                 |
| Legacy encoding                    | Noto'g'ri matn                | SheetJS codepage support + fixture tests                        |
| Formula cached result yo'q         | Missing value                 | Formula warning, formula execute qilmaslik                      |
| Prompt injection cell              | AI instructionni qabul qiladi | Untrusted-data prompt, truncation, structured output, allowlist |
| API quota/timeout                  | Analysis to'xtaydi            | Stage persistence + retry + heuristic/manual fallback           |
| Secret leak                        | Security incident             | server-only DAL, env validation, no logging                     |
| Prisma/Next bundling               | Build/runtime error           | Node runtime, official adapter, build verification              |
| Serverless request timeout         | Partial processing            | Split-stage endpoints; later queue/object storage               |

## 24. Keyingi, MVPdan tashqari evolyutsiya

1. Real authentication va organization isolation.
2. Original fayllar uchun object storage.
3. Large imports uchun queue va worker.
4. User-created reusable mapping templates.
5. Scheduled imports va external integrations.
6. Imported datasetni asosiy dashboardga data source sifatida ulash.
7. Dataset version comparison.
8. Exportable PDF/Excel analysis report.
9. Domain-specific analysis packs.
10. Feedback orqali mapping va recommendation quality monitoring.

## 25. Rasmiy reference'lar

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js backend-for-frontend guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js data security guide](https://nextjs.org/docs/app/guides/data-security)
- [Prisma + Next.js guide](https://www.prisma.io/docs/guides/v7/frameworks/nextjs)
- [Prisma PostgreSQL connector](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [SheetJS supported formats](https://docs.sheetjs.com/docs/miscellany/formats/)
- [SheetJS Node.js installation](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/)
- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Gemini API key security](https://ai.google.dev/gemini-api/docs/api-key)
