from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    assert response.json()['version'] == '0.3.0'


def test_impact_graph_traces_dependencies():
    client.post('/api/reset')
    state = client.post('/api/disruptions/simulate').json()
    graph = state['impact_graph']
    assert len(graph['nodes']) == 9
    assert len(graph['edges']) == 8
    assert graph['nodes'][0]['type'] == 'supplier'
    assert any(n['id'] == 'PL-01' for n in graph['nodes'])
    assert any(n['id'] == 'ORD-318' for n in graph['nodes'])


def test_disruption_flow():
    client.post('/api/reset')
    state = client.post('/api/disruptions/simulate').json()
    assert state['impact']['severity'] == 'CRITICAL'
    assert state['impact']['affected_orders'] == 4
    assert state['impact']['line_stop_days'] == 3.4
    assert state['twin']['chennai_inventory_days'] == 3.4
    assert state['twin']['continuity'] == 'AT RISK'

    state = client.post('/api/recovery/generate').json()
    assert state['recommendation']['id'] == 'TRANSFER'

    preview = client.post('/api/recovery/simulate', json={'strategy_id': 'TRANSFER'})
    assert preview.status_code == 200
    assert preview.json()['recovery_buffer_days'] == 1.4
    assert preview.json()['decision'] == 'CONTINUITY MAINTAINED'

    response = client.post('/api/recovery/approve', json={'strategy_id': 'TRANSFER'})
    assert response.status_code == 200
    assert response.json()['approved'] is True
    assert response.json()['selected_strategy']['id'] == 'TRANSFER'

    response = client.post('/api/recovery/execute')
    assert response.status_code == 200
    result = response.json()
    assert result['executed'] is True
    assert result['twin']['chennai_inventory_days'] == 5.4
    assert result['twin']['hyderabad_inventory_days'] == 6.2
    assert result['twin']['inventory_transfer_days'] == 2.0
    assert result['twin']['orders_protected'] == 4
    assert result['twin']['continuity'] == 'PROTECTED'
    assert result['impact']['severity'] == 'RECOVERED'
    assert '+1.4-day recovery buffer' in result['audit'][0]['detail']
    assert any('Chennai runway increased to 5.4 days' in a['detail'] for a in result['audit'])


def test_recovery_preview_rejects_unknown_strategy():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    response = client.post('/api/recovery/simulate', json={'strategy_id': 'UNKNOWN'})
    assert response.status_code == 200
    assert response.json()['ok'] is False


def test_cannot_execute_without_approval():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    response = client.post('/api/recovery/execute')
    assert response.status_code == 200
    assert response.json()['ok'] is False


def test_reset_restores_digital_twin():
    client.post('/api/disruptions/simulate')
    client.post('/api/recovery/approve', json={'strategy_id': 'TRANSFER'})
    client.post('/api/recovery/execute')
    state = client.post('/api/reset').json()
    assert state['executed'] is False
    assert state['twin']['chennai_inventory_days'] == 3.4
    assert state['twin']['hyderabad_inventory_days'] == 8.2
    assert state['twin']['inventory_transfer_days'] == 0
    assert state['twin']['orders_protected'] == 0
    assert state['twin']['continuity'] == 'NORMAL'


def test_alt_supplier_feasibility_and_consistency():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    state = client.post('/api/recovery/generate').json()
    alt = next(s for s in state['scenarios'] if s['id'] == 'ALT_SUPPLIER')
    assert alt['feasible'] is True
    assert alt['recovery_days'] == 3
    assert alt['line_stop_risk'] == 'LOW'

    preview = client.post('/api/recovery/simulate', json={'strategy_id': 'ALT_SUPPLIER'}).json()
    assert preview['ok'] is True
    assert preview['recovery_buffer_days'] == 0.4
    assert preview['line_stop_avoided'] is True
    assert preview['decision'] == 'CONTINUITY MAINTAINED'


def test_execute_endpoint_idempotency():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    client.post('/api/recovery/generate')
    client.post('/api/recovery/approve', json={'strategy_id': 'TRANSFER'})
    
    first_exec = client.post('/api/recovery/execute').json()
    assert first_exec['ok'] is True
    audit_count_before = len(first_exec['audit'])

    second_exec = client.post('/api/recovery/execute').json()
    assert second_exec['ok'] is True
    audit_count_after = len(second_exec['audit'])
    assert audit_count_after == audit_count_before
    assert second_exec['twin'] == first_exec['twin']


def test_non_transfer_strategy_digital_twin_accuracy():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    client.post('/api/recovery/generate')
    client.post('/api/recovery/approve', json={'strategy_id': 'ALT_SUPPLIER'})
    res = client.post('/api/recovery/execute').json()
    assert res['ok'] is True
    assert res['twin']['inventory_transfer_days'] == 0.0
    assert res['twin']['hyderabad_inventory_days'] == 8.2
    assert res['twin']['chennai_inventory_days'] == 6.4
    assert res['twin']['orders_protected'] == 4
