from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    assert response.json()['version'] == '0.2.0'


def test_impact_graph_traces_dependencies():
    client.post('/api/reset')
    state = client.post('/api/disruptions/simulate').json()
    graph = state['impact_graph']
    assert len(graph['nodes']) == 7
    assert len(graph['edges']) == 6
    assert graph['nodes'][0]['type'] == 'supplier'
    assert any(n['id'] == 'PL-01' for n in graph['nodes'])
    assert any(n['id'] == 'ORD-318' for n in graph['nodes'])


def test_disruption_flow():
    client.post('/api/reset')
    response = client.post('/api/disruptions/simulate')
    assert response.status_code == 200
    state = response.json()
    assert state['impact']['severity'] == 'CRITICAL'
    assert state['impact']['affected_orders'] == 4
    assert state['impact']['line_stop_days'] == 3.4

    response = client.post('/api/recovery/generate')
    state = response.json()
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
    assert response.json()['executed'] is True
    assert '+1.4-day recovery buffer' in response.json()['audit'][0]['detail']


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
