const $ = (id) => document.getElementById(id);
const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
let busy = false;

async function api(path, options = {}) {
  const res = await fetch(path, { headers: {'Content-Type':'application/json'}, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function setBusy(value) {
  busy = value;
  const button = $('simulate');
  if (button) {
    button.disabled = value;
    button.textContent = value ? 'Processing disruption…' : '⚡ Simulate Supplier Failure';
  }
}

function renderGraph(graph, disrupted) {
  const root = $('impact-graph');
  if (!disrupted || !graph?.nodes?.length) {
    root.innerHTML = '<div class="empty">Trigger a disruption to trace the dependency chain.</div>';
    return;
  }
  const byType = (type) => graph.nodes.filter(n => n.type === type);
  const supplier = byType('supplier')[0];
  const component = byType('component')[0];
  const plants = byType('plant');
  const orders = byType('order');
  root.innerHTML = `
    <div class="graph-node supplier-node"><span>SUPPLIER</span><b>${supplier.label}</b><small>${supplier.status}</small></div>
    <div class="graph-arrow">↓ <span>supplies</span></div>
    <div class="graph-node component-node"><span>CRITICAL COMPONENT</span><b>${component.label}</b><small>${component.status}</small></div>
    <div class="graph-arrow">↓ <span>BOM dependency</span></div>
    <div class="graph-columns">
      <div><label>PLANTS</label>${plants.map(n => `<div class="mini-node"><b>${n.label}</b><small>${n.status}</small></div>`).join('')}</div>
      <div><label>ORDERS AT RISK</label>${orders.map(n => `<div class="mini-node"><b>${n.label}</b><small>${n.status}</small></div>`).join('')}</div>
    </div>
    <div class="graph-footer"><span>${graph.nodes.length} nodes</span><span>${graph.edges.length} dependency edges traced</span></div>`;
}

function renderActivity(s) {
  const root = $('agent-activity');
  const seen = new Set();
  const rows = (s.audit || []).slice().reverse().filter(a => {
    if (seen.has(a.event)) return false;
    seen.add(a.event);
    return true;
  });
  if (!rows.length) {
    root.innerHTML = '<div class="activity-empty">Agent activity will appear as COHERE processes the disruption.</div>';
    return;
  }
  root.innerHTML = `<div class="activity-title">LIVE AGENT ACTIVITY</div>` + rows.map((a, idx) => `
    <div class="activity-row ${idx === rows.length - 1 ? 'latest' : ''}"><span class="activity-dot"></span><div><b>${a.actor}</b><small>${a.event.replaceAll('_',' ')}</small></div><span class="activity-check">✓</span></div>`).join('');
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
  $('buffer').textContent = s.selected_strategy ? `${i.line_stop_days - s.selected_strategy.recovery_days >= 0 ? '+' : ''}${(i.line_stop_days - s.selected_strategy.recovery_days).toFixed(1)} days` : '—';
  $('buffer').className = s.selected_strategy ? 'green-text' : '';

  const status = $('system-status');
  status.textContent = s.executed ? '● RECOVERY VERIFIED' : s.disrupted ? '● DISRUPTION ACTIVE' : '● NORMAL OPERATIONS';
  status.className = `pill ${s.executed || !s.disrupted ? 'green' : 'red'}`;

  renderGraph(s.impact_graph, s.disrupted);
  renderActivity(s);

  const list = $('scenarios');
  const rec = s.recommendation;
  if (!s.scenarios.length) list.innerHTML = '<div class="empty">Trigger a disruption to generate recovery scenarios.</div>';
  else list.innerHTML = s.scenarios.map(x => `
    <div class="scenario ${rec && rec.id === x.id ? 'recommended' : ''} ${s.selected_strategy?.id === x.id ? 'selected' : ''}">
      <div class="scenario-top"><b>${x.name}</b><span class="tag ${x.feasible ? 'good':'bad'}">${x.feasible ? (rec?.id===x.id?'RECOMMENDED':'FEASIBLE') : x.compliance === 'REVIEW' ? 'REVIEW':'NOT VIABLE'}</span></div>
      <div class="scenario-meta"><span>Recovery <b>${x.recovery_days}d</b></span><span>Cost <b>${money(x.cost_delta)}</b></span><span>Risk <b>${x.line_stop_risk}</b></span></div>
      <div class="scenario-reason">${x.reason}</div>
      ${x.feasible && !s.approved && !s.executed ? `<button onclick="approve('${x.id}')">Select & Request Approval</button>` : ''}
      ${s.selected_strategy?.id === x.id ? '<div class="selected-note">✓ Selected recovery plan</div>' : ''}
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
    const approval = rec.cost_delta > s.policies.approval_cost_threshold ? `Policy threshold: ${money(s.policies.approval_cost_threshold)}. Human authorization is required before this action can execute.` : 'Policy checks passed. COHERE still pauses before execution so a human owns the final decision.';
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

async function refresh() { try { render(await api('/api/state')); } catch (e) { console.error(e); } }
async function simulateDisruption() {
  if (busy) return;
  setBusy(true);
  try {
    render(await api('/api/disruptions/simulate', {method:'POST'}));
    render(await api('/api/recovery/generate', {method:'POST'}));
  } catch (e) { alert(e.message); } finally { setBusy(false); }
}
async function previewRecovery(id) { return api('/api/recovery/simulate', {method:'POST', body:JSON.stringify({strategy_id:id})}); }
async function approve(id) {
  try {
    const preview = await previewRecovery(id);
    if (!preview.ok) return alert(preview.error);
    render(await api('/api/recovery/approve', {method:'POST', body:JSON.stringify({strategy_id:id})}));
  } catch (e) { alert(e.message); }
}
async function executeRecovery() {
  try { render(await api('/api/recovery/execute', {method:'POST'})); } catch (e) { alert(e.message); }
}
async function resetDemo() {
  try { render(await api('/api/reset', {method:'POST'})); } catch (e) { alert(e.message); }
}
refresh();
