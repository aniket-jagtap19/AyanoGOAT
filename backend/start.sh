#!/bin/bash
set -e
echo "[PROTOCOL] Waiting for Neo4j..."
python /app/wait_neo4j.py
echo "[PROTOCOL] Seeding database..."
cd /app && python -m seed.seeder
echo "[PROTOCOL] Starting API server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
