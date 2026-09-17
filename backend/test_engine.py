from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


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

    response = client.post('/api/recovery/approve', json={'strategy_id': 'TRANSFER'})
    assert response.status_code == 200
    assert response.json()['approved'] is True

    response = client.post('/api/recovery/execute')
    assert response.status_code == 200
    assert response.json()['executed'] is True


def test_cannot_execute_without_approval():
    client.post('/api/reset')
    client.post('/api/disruptions/simulate')
    response = client.post('/api/recovery/execute')
    assert response.status_code == 200
    assert response.json()['ok'] is False
