# Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-18 | Product name: **Cleanclaim** (provisional) | "Clean claim" is the industry term for a claim paid on first submission. The .com and .ai domains are taken. Name lives in one config file so it can change. |
| 2026-11-18 | **Inpatient-first MVP** (MDC 4/5 demo cases) | Needs only free code sets (no CPT license), and DRG/CC-MCC impact gives the clearest ROI per case |
| 2026-11-18 | Outpatient rules engine built now; CPT deferred | NCCI/MUE/HCPCS use free data. CPT needs an AMA license |
| 2026-11-18 | Local-first + Firebase Hosting / Cloud Run demo | Lets us share a demo at `*.web.app` without waiting on a domain. Synthetic data only, Auth allowlist |
