# COHERE Internal Hackathon Demo Runbook

## Target duration

3–5 minutes. The demo should tell one story rather than explain every implementation detail.

## Scenario

An electronics manufacturer depends on Alpha Components for critical component MC-204 (Control Processor). Alpha reports an 18-day supply interruption.

Chennai-01 has only 3.4 days of MC-204 runway.

## Live sequence

### 1. Normal state

Start on the dashboard. Say:

> “This is the supply chain before the failure. COHERE is watching the dependency between suppliers, components, plants and customer orders.”

### 2. Trigger disruption

Click **Simulate Supplier Failure**.

Say:

> “At 09:17, our primary supplier becomes unavailable for 18 days. A conventional system would raise an alert. COHERE asks a different question: what will actually stop?”

### 3. Show impact

Point to:

- MC-204 as the critical component
- 3 affected plants
- 4 affected orders
- 3.4-day production runway
- order value exposed

Say:

> “The disruption is now translated from a supplier event into a production-impact event.”

### 4. Show scenarios

Compare the recovery cards:

- wait for primary supplier
- switch to alternate supplier
- transfer existing inventory
- substitute component requiring engineering review

Say:

> “COHERE evaluates time, cost, risk and constraints instead of blindly choosing the cheapest option.”

### 5. Human gate

Select the feasible recommended option and show the approval panel.

Say:

> “The system does not silently change a high-impact procurement decision. Governance decides whether a human must approve it.”

Click **Approve**.

### 6. Execute

Click **Execute Recovery**.

Say:

> “Only after approval does the execution layer simulate the inventory, procurement and production actions.”

### 7. Verify + audit

Show the green continuity state and audit trail.

Close with:

> “The goal isn't to predict every disruption. The goal is to reduce the time between disruption and recovery — while keeping the decision explainable and governed.”

## Failure recovery

If anything behaves unexpectedly, click **Reset Demo** and restart. Do not improvise new features during the presentation.

## Q&A anchors

**Why AI?** Agents interpret disruption signals, coordinate specialist reasoning and explain decisions; deterministic business rules remain the source of truth for critical calculations.

**Why SAP?** The concept maps naturally to SAP IBP planning, S/4HANA business data, SAP Transportation Management, SAP Business Network/Ariba and SAP BTP/AI capabilities.

**Why human-in-the-loop?** Supplier changes, elevated-risk routes and decisions above policy thresholds can have material business/compliance consequences.

**Is the demo using real enterprise data?** No. It uses synthetic data to demonstrate the workflow safely.
