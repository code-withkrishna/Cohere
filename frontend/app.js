const $ = (id) => document.getElementById(id);
const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

async function api(path, options = {}) {
  const res = await fetch(path, { headers: {'Content-Type':'application/json'}, ...options });
  return res.json();
}

function render(s) {
  const i = s.impact;
  $('severity').textContent = i.severity;
  $('severity').className = i.severity === 'CRITICAL' ? 'red-text' : '';
  $('supplier').textContent = s.disrupted ? 'Alpha Components • 18-day interruption' : 'No active disruption';
  $('line-stop').textContent = `${i.line_stop_days} days`;
  $('orders').textContent = i.affected_orders;
  $('order-value').textContent = `${money(i.affected_order_value)} exposure`;
  $('confidence').textContent = s.disrupted ? `${i.confidence}% confidence` : '—';
  $('supplier-state').textContent = s.disrupted ? 'DISRUPTED • 18 days' : 'Active';
  $('supplier-state').className = s.disrupted ? 'red-text' : '';
  $('affected-plants').textContent = `${i.affected_plants} plants`;
  $('affected-orders').textContent = `${i.affected_orders} orders at risk`;
  const rec = s.recommendation;
  $('buffer').textContent = rec ? `+${(i.line_stop_days - rec.recovery_days).toFixed(1)} days` : '—';
  $('buffer').className = rec ? 'green-text' : '';

  const status = $('system-status');
  status.textContent = s.executed ? '● RECOVERY VERIFIED' : s.disrupted ? '● DISRUPTION ACTIVE' : '● NORMAL OPERATIONS';
  status.className = `pill ${s.executed || !s.disrupted ? 'green' : 'red'}`;

  const list = $('scenarios');
  if (!s.scenarios.length) list.innerHTML = '<div class="empty">Trigger a disruption to generate recovery scenarios.</div>';
  else list.innerHTML = s.scenarios.map(x => `
    <div class="scenario ${rec && rec.id === x.id ? 'recommended' : ''}">
      <div class="scenario-top"><b>${x.name}</b><span class="tag ${x.feasible ? 'good':'bad'}">${x.feasible ? (rec?.id===x.id?'RECOMMENDED':'FEASIBLE') : x.compliance === 'REVIEW' ? 'REVIEW':'NOT VIABLE'}</span></div>
      <div class="scenario-meta"><span>Recovery <b>${x.recovery_days}d</b></span><span>Cost <b>${money(x.cost_delta)}</b></span><span>Risk <b>${x.line_stop_risk}</b></span></div>
      <div class="scenario-reason">${x.reason}</div>
      ${x.feasible && !s.approved && !s.executed ? `<button onclick="approve('${x.id}')">Select & Request Approval</button>` : ''}
    </div>`).join('');

  const decision = $('decision');
  if (s.executed) {
    decision.className = 'decision success';
    decision.innerHTML = '<div class="decision-icon">✓</div><div><b>Recovery approved & executed</b><p>Human approval was captured. COHERE executed the simulated recovery workflow and verified continuity.</p></div>';
  } else if (s.approved) {
    decision.className = 'decision success';
    decision.innerHTML = '<div class="decision-icon">✓</div><div><b>Human approval captured</b><p>The recovery plan is authorized. Execution is ready.</p><button class="primary" onclick="executeRecovery()">Execute Recovery</button></div>';
  } else if (s.disrupted && rec) {
    decision.className = 'decision warning';
    const approval = rec.cost_delta > s.policies.approval_cost_threshold ? `Policy threshold: ${money(s.policies.approval_cost_threshold)}. This action requires human approval.` : 'Policy checks passed; human confirmation is required for the simulated high-impact action.';
    decision.innerHTML = `<div class="decision-icon">!</div><div><b>HUMAN APPROVAL REQUIRED</b><p>${approval}</p><p><strong>Recommendation:</strong> ${rec.name}</p></div>`;
  } else {
    decision.className = 'decision idle';
    decision.innerHTML = '<div class="decision-icon">✓</div><div><b>No approval required</b><p>COHERE is operating normally. High-impact actions will pause here for human approval.</p></div>';
  }

  const execution = $('execution');
  if (s.executed) {
    execution.innerHTML = '<div class="exec-row"><span>Inventory transfer</span><b class="ok">✓ COMPLETE</b></div><div class="exec-row"><span>Procurement action</span><b class="ok">✓ COMPLETE</b></div><div class="exec-row"><span>Production schedule</span><b class="ok">✓ UPDATED</b></div><div class="exec-row"><span>Continuity</span><b class="ok">✓ RESTORED</b></div>';
  } else if (s.approved) {
    execution.innerHTML = '<div class="exec-row"><span>Inventory transfer</span><b>READY</b></div><div class="exec-row"><span>Procurement action</span><b>READY</b></div><div class="exec-row"><span>Production schedule</span><b>READY</b></div><div class="exec-row"><span>Continuity</span><b>AWAITING EXECUTION</b></div>';
  } else {
    execution.innerHTML = '<div class="exec-row"><span>Inventory transfer</span><b>—</b></div><div class="exec-row"><span>Procurement action</span><b>—</b></div><div class="exec-row"><span>Production schedule</span><b>—</b></div><div class="exec-row"><span>Continuity</span><b>—</b></div>';
  }

  $('audit').innerHTML = s.audit.length ? s.audit.map(a => `<div class="audit-row"><time>${new Date(a.timestamp).toLocaleTimeString()}</time><b>${a.event}</b><span>${a.detail}</span></div>`).join('') : '<div class="empty">No events yet.</div>';
}

async function refresh() { render(await api('/api/state')); }
async function simulateDisruption() { render(await api('/api/disruptions/simulate', {method:'POST'})); render(await api('/api/recovery/generate', {method:'POST'})); }
async function approve(id) { render(await api('/api/recovery/approve', {method:'POST', body:JSON.stringify({strategy_id:id})})); }
async function executeRecovery() { render(await api('/api/recovery/execute', {method:'POST'})); }
async function resetDemo() { render(await api('/api/reset', {method:'POST'})); }
refresh();
