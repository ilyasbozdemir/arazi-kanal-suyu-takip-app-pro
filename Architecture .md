# Kurum Başkanlığı — Arazi & Su Takip Sistemi

## Mimari Genel Bakış

---

## Katman Yapısı

```
┌─────────────────────────────────────────────────────┐
│                   RENDERER (React)                   │
│                                                     │
│  Component → Domain Service → ElectronService       │
│                                    ↓                │
│              window.api (Preload Bridge)             │
└─────────────────────────┬───────────────────────────┘
                          │ IPC (ipcRenderer.invoke)
┌─────────────────────────▼───────────────────────────┐
│                  MAIN PROCESS (Node.js)              │
│                                                     │
│  IpcHandler → Mediator → CommandHandler/Query       │
│                               ↓                    │
│          IUnitOfWork → Repository → SQLite          │
└─────────────────────────────────────────────────────┘
```

---

## Renderer Tarafı

### 1. Component

Kullanıcının gördüğü ekran. İş mantığı **bilmez**, sadece gösterir.

```tsx
// ✅ Doğru — store veya service çağırır
const { data } = useTapuStore()

// ❌ Yanlış — direkt IPC çağırır
const res = await window.api.saveRecord(...)
```

### 2. Zustand Store

Renderer tarafı cache katmanı. Aynı veri birden fazla component tarafından
istenirse tek seferinde çekilir.

```typescript
const useTapuStore = create((set, get) => ({
  data: [],
  loaded: false,
  fetch: async () => {
    if (get().loaded) return; // cache'den dön
    const res = await ElectronService.getRecords("DATA_Tapu_Verisi");
    set({ data: res.data, loaded: true });
  },
  invalidate: () => set({ loaded: false }), // kayıt sonrası çağır
}));
```

### 3. ElectronService

Tek ve saf IPC köprüsü. İş mantığı yok, sadece `window.api` çağrısı.

```typescript
export const ElectronService = {
  tapu: {
    getDetails: (id) => window.api.tapu.getDetails(id),
    saveFull: (cmd) => window.api.tapu.saveFull(cmd),
  },
  citizen: {
    getByTckn: (tckn) => window.api.citizen.getByTckn(tckn),
    getLands: (id) => window.api.citizen.getLands(id),
  },
};
```

### 4. Preload (window.api)

Electron güvenlik duvarı. Renderer'ın Node.js'e doğrudan erişimini engeller,
sadece tanımlı kanalları açar.

```typescript
const api = {
  tapu: {
    getDetails: (id) => ipcRenderer.invoke("get-tapu-details", id),
    saveFull: (cmd) => ipcRenderer.invoke("tasinmaz:save", cmd),
    getOwners: (id) => ipcRenderer.invoke("get-tapu-owners", id),
  },
  citizen: {
    getByTckn: (tckn) => ipcRenderer.invoke("get-citizen-by-tckn", tckn),
    getLands: (id) => ipcRenderer.invoke("get-citizen-lands", id),
  },
};
```

---

## Main Process Tarafı

### 5. IpcHandler

IPC kanallarını register eder, Mediator'a yönlendirir.

```typescript
@injectable()
export class TapuIpcHandler {
  constructor(@inject(Mediator) private mediator: Mediator) {}

  register() {
    ipcMain.handle(
      "tasinmaz:save",
      (_, cmd) => this.mediator.send("tapu:saveFull", cmd),
    );
    ipcMain.handle(
      "get-tapu-details",
      (_, id) => this.mediator.send("tapu:getDetails", id),
    );
  }
}
```

### 6. Mediator + Pipeline

MediatR pattern. Her command/query işlemi pipeline'dan geçer. Cross-cutting
concern'ler (loglama, validasyon) burada halledilir.

```typescript
// Pipeline otomatik çalışır, handler'a dokunmaz
mediator.addPipeline(new LoggingBehavior());
mediator.addPipeline(new ValidationBehavior());

// Handler sadece iş mantığına odaklanır
mediator.send("tapu:saveFull", command);
```

### 7. CommandHandler / QueryHandler (CQRS)

Write ve Read işlemleri ayrı sınıflarda.

```typescript
// Write
class SaveTasinmazCommandHandler {
  handle(command: SaveTasinmazCommand) {
    return this.uow.executeTransaction((uow) => {
      uow.getRepository("DATA_Tapu_Verisi").save(command.tapuData);
      // sahipler, zilyetler...
      return { success: true, id };
    });
  }
}

// Read
class GetTapuDetailQueryHandler {
  handle(id: string) {
    return this.uow.tapu.getDetailed(id);
  }
}
```

### 8. UnitOfWork + Repository

Veri erişim katmanı. Transaction yönetimi burada.

```typescript
interface IUnitOfWork {
  executeTransaction<T>(fn: (uow: IUnitOfWork) => T): T;
  getRepository(table: string): IRepository;
  tapu: ITapuRepository;
  vatandas: IVatandasRepository;
}
```

### 9. SQLite (better-sqlite3)

Fiziksel veri. WAL modu ile eş zamanlı okuma/yazma desteklenir.

---

## DI Container (tsyringe)

Tüm bağımlılıklar merkezi container'dan çözümlenir.

```typescript
export function bootstrapDI() {
  const db = getDb();
  container.registerInstance("IUnitOfWork", new SqliteUnitOfWork(db));
  container.registerSingleton(Mediator);
  container.registerSingleton(WindowService);

  // Handler'ları register et
  container.resolve(TapuIpcHandler).register();
  container.resolve(CitizenIpcHandler).register();
  container.resolve(WindowIpcHandler).register();

  return { container };
}
```

---

## Veri Akışı Örnekleri

### Tapu Kaydetme

```
TapuCreateView.onSave()
  → window.api.tapu.saveFull(command)
    → ipcMain: 'tasinmaz:save'
      → TapuIpcHandler
        → Mediator → LoggingBehavior → SaveTasinmazCommandHandler
          → UnitOfWork.executeTransaction()
            → DATA_Tapu_Verisi.save()
            → TASINMAZ_SAHIP.save() (her sahip için)
            → TASINMAZ_ZILYET.save() (opsiyonel)
          → { success: true, id }
        ← result
      ← result
    ← result
  ← tapuStore.invalidate() → UI güncellenir
```

### Veri Okuma (Cache)

```
TapuListView mount()
  → tapuStore.fetch()
    → isLoaded? → cache'den dön ✅
    → değilse → ElectronService.getRecords()
      → window.api.getDbData('DATA_Tapu_Verisi')
        → ipcMain: 'get-db-data'
          → GenericRepository.getAll()
            → WHERE deleted_at IS NULL
          ← data[]
        ← data[]
      ← data[]
    → store.set({ data, loaded: true })
  ← data[] (tüm component'ler paylaşır)
```

---

## Veritabanı Şeması

Modüler TypeScript şema sistemi:

```
src/main/database/
  tables/
    DATA_Vatandas.ts       ← defineTable({ ... })
    DATA_Tapu_Verisi.ts    ← defineTable({ ... })
    DATA_Dagitim_Mahalleleri_Donem.ts  ← Defter/Tablo Kayıt Rehberi
    DATA_Mahalle_Fisleri_{MAHALLE}_{YIL}    ← Dinamik Sulama Kayıtları (Otomatik Üretilir)
    ...
  audit.ts                 ← auditColumns (created_at, deleted_at, ...)
  BaseTable.ts             ← defineTable() factory
  index.ts                 ← schema export
```

Her tablo `defineTable()` ile sarmalanır, audit kolonları otomatik eklenir.
`db.ts` açılışta şemayı okur, eksik kolonları `ALTER TABLE` ile ekler.

---

## Teknik Borç (TODO)

```
[ ] useRecordDetail → domain service'lere taşınacak
    (şu an window.api direkt çağırıyor)

[ ] Fiş → Tahakkuk otomatik akış
    (SaveSuFisiCommandHandler transaction içinde)

[ ] Devir Al butonu
    (Ledger.Sorumlu_Merav_id değişimi)

[ ] Dağıtım defteri UI
    (fiziksel deftere benzer tablo görünümü)

[ ] LEDGER_MERAV tablosu
    (birden fazla merav desteği)
```

---

## Klasör Yapısı

```
src/
  main/
    core/
      di/
        container.ts      ← DI bootstrap
        Mediator.ts       ← MediatR pattern
      interfaces/         ← IUnitOfWork, IRepository
    application/
      features/
        tapu/
          commands/       ← SaveTapuCommandHandler
          queries/        ← GetTapuDetailQueryHandler
        vatandas/
        accounting/
    infrastructure/
      database/
        SqliteUnitOfWork.ts
        repositories/
    ipc/
      TapuIpcHandler.ts
      CitizenIpcHandler.ts
      WindowIpcHandler.ts
    services/
      WindowService.ts
    database/             ← Modüler şema
      tables/
      BaseTable.ts
      index.ts
    db.ts                 ← SQLite init & migration

  renderer/src/
    components/
      detail/             ← Form & detay ekranları
    services/
      ElectronService.ts  ← IPC köprüsü
    stores/               ← Zustand store'lar
    types/
      api.d.ts            ← window.api tip tanımları
```
