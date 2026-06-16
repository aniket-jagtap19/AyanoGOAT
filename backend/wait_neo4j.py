import time, sys, os
from neo4j import GraphDatabase

uri      = os.environ.get("NEO4J_URI",      "bolt://neo4j:7687")
user     = os.environ.get("NEO4J_USER",     "neo4j")
password = os.environ.get("NEO4J_PASSWORD", "ayanokoji_protocol")

for attempt in range(40):
    try:
        d = GraphDatabase.driver(uri, auth=(user, password))
        d.verify_connectivity()
        d.close()
        print(f"[PROTOCOL] Neo4j ready after {attempt + 1} attempt(s).")
        sys.exit(0)
    except Exception as e:
        print(f"[PROTOCOL] Attempt {attempt + 1}/40: {e}")
        time.sleep(3)

print("[PROTOCOL] ERROR: Neo4j unavailable.")
sys.exit(1)
