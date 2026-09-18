# COHERE Internal Hackathon Demo Runbook

## Target duration

3–5 minutes. The demo should tell one concise, impactful story rather than explain every implementation detail.

## Context & Synthetic Scenario

**Scenario Context**: Toyota Motor Corporation × DENSO supply-chain context.  
**Disclaimer**: Real company relationships are used **only as contextual grounding** so evaluators immediately understand the supply-chain scenario. The disruption, component identifier (`VCP-204`), plants, order values, recovery decisions, and operational figures are **synthetic demonstration data**.

In this synthetic demonstration scenario:
- Primary Tier-1 supplier **DENSO** reports an 18-day simulated interruption for critical component **VCP-204 — Vehicle Control Processor**.
- **Chennai-01** has only 3.4 days of VCP-204 inventory runway remaining before line stoppage.
- 4 customer production orders totaling **₹58.7 lakh** in order exposure are immediately placed at risk across the Bill of Materials (**V-BOM-204 — Vehicle Control Assembly**).

---

## Live Sequence

### 1. Normal state (Sense Stage)

Start on the dashboard. Say:

> “This is Toyota's production continuity baseline before any disruption occurs. COHERE continuously monitors multi-tier dependencies between Tier-1 suppliers like DENSO, critical components, vehicle assembly plants, and customer delivery schedules. Note that while we use real-world enterprise context for grounding, all operational and incident metrics shown are synthetic demonstration figures.”

### 2. Trigger disruption (Trace Stage)

Click **Simulate Supplier Failure**.

Say:

> “At 09:17, our Tier-1 supplier DENSO encounters a simulated 18-day interruption for critical component VCP-204 (Vehicle Control Processor). A conventional alert system simply pings an inbox. COHERE asks a different question: what manufacturing line will actually stop, and when?”

### 3. Show impact & blast radius

Point to:

- **VCP-204 — Vehicle Control Processor** as the single-point-of-failure component
- **V-BOM-204 — Vehicle Control Assembly** dependency
- **Chennai-01** with **3.4 days** of production runway remaining
- **4 committed customer production orders** exposed
- **₹58.7 lakh** total order exposure

Say:

> “COHERE immediately translates a raw supplier signal into an operational blast radius across plants and committed customer orders.”

### 4. Show evaluated scenarios (Simulate Stage)

Click **Find Recovery Options →**. Compare the 4 deterministic recovery cards:

1. **WAIT (Primary Supplier - DENSO)**: 18 days, ₹0 cost delta, **HIGH Risk / INFEASIBLE**, Buffer: **-14.6 days**
2. **ALT SUPPLIER (Beta Components)**: 3 days, ₹42,000, **LOW Risk / FEASIBLE**, Buffer: **+0.4 days**
3. **TRANSFER INVENTORY (Hyderabad-02 → Chennai-01)**: 2 days, ₹18,000, **LOW Risk / FEASIBLE**, Buffer: **+1.4 days** *(RECOMMENDED)*
4. **SUBSTITUTE (VCP-204B)**: 3 days, ₹15,000, **MEDIUM Risk / REVIEW REQUIRED**, Buffer: **+0.4 days**

Say:

> “COHERE evaluates time, cost, risk, and compliance deterministically rather than guessing. The engine recommends transferring existing VCP-204 inventory from Hyderabad-02 to Chennai-01, arriving in 2 days and restoring a +1.4-day safety buffer before Chennai exhausts stock.”

### 5. Human-in-the-loop gate (Govern Stage)

Select the recommended **Transfer Inventory** option and click **Proceed to Governance Gate**.

Say:

> “Crucially, COHERE does not silently alter procurement routes or dispatch freight without human authorization. The Human Approval Gate enforces governance policy, verifies cost thresholds, and requests explicit planner authorization.”

Click **Approve & Execute**.

### 6. Execute & Digital Twin update

Watch the 4-phase execution sequence: Human Authorization Recorded → Inventory Transfer Dispatched → Production Schedule Adjusted → Digital Twin Synchronized.

Say:

> “Upon explicit approval, the execution layer simulates the inventory reallocation, updates ERP records, and synchronizes the Digital Twin.”

### 7. Verify + audit (Verify Stage)

Click **View Verification Report**.

Show the Digital Twin transformation:
- **Chennai-01 Runway**: 3.4 days → **5.4 days**
- **Hyderabad-02 Runway**: 8.2 days → **6.2 days** (balanced)
- **Orders Protected**: 0/4 → **4/4 (100%)**
- **Continuity Status**: AT RISK → **PROTECTED**
- **Recovery Buffer**: **+1.4 days**

Open the **Audit Log** modal to show the complete, immutable event trail from detection to verification.

Close with:

> “The goal isn't to predict every black-swan event. The goal is to compress the time from disruption signal to verified recovery from days to seconds — with deterministic precision, explainable trade-offs, and human governance.”

---

## Failure Recovery

If anything behaves unexpectedly during presentation, click **Reset** in the top header to return to the baseline state.

---

## Q&A Anchors

**Why use Toyota × DENSO context?**  
It provides immediate, intuitive grounding in real-world tier-1 automotive manufacturing relationships. Operational metrics and disruption parameters are synthetic demo data.

**Why AI + Deterministic Rules?**  
Agents interpret disruption signals, orchestrate multi-agent analysis, and explain recovery trade-offs; deterministic arithmetic retains absolute authority over runway days, recovery buffers, feasibility, and financial exposure.

**Enterprise direction?**  
Enterprise direction: SAP operational data + events. Concepts map directly to SAP Integrated Business Planning (IBP), S/4HANA supply chain data, SAP Transportation Management, and SAP Business Network / Ariba.

**Why human-in-the-loop?**  
Inter-facility transfers, alternate supplier qualifications, and emergency freight incur costs and compliance overhead that must remain under human governance.

**Is the demo using real enterprise data?**  
No. All operational figures, component IDs, disruption durations, and order values are synthetic demonstration data.
