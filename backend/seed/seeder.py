import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')

from neo4j import GraphDatabase
from seed.data import CHARACTERS, RELATIONSHIPS, EVENTS


def seed() -> None:
    uri      = os.environ.get('NEO4J_URI',      'bolt://localhost:7687')
    user     = os.environ.get('NEO4J_USER',     'neo4j')
    password = os.environ.get('NEO4J_PASSWORD', 'ayanokoji_protocol')
    driver   = GraphDatabase.driver(uri, auth=(user, password))

    with driver.session() as session:
        session.run('MATCH (n) DETACH DELETE n')
        print('[SEEDER] Database cleared.')

        for char in CHARACTERS:
            props = {k: v for k, v in char.items() if k != 'id'}
            session.run('MERGE (c:Character {id: $id}) SET c += $props',
                        {'id': char['id'], 'props': props})
        print(f'[SEEDER] {len(CHARACTERS)} characters created.')

        ok = 0
        for rel in RELATIONSHIPS:
            rt = rel['type']
            q = (
                f'MATCH (a:Character {{id: $src}}), (b:Character {{id: $tgt}}) '
                f'MERGE (a)-[r:{rt}]->(b) '
                f'SET r.weight=$w, r.trust=$t, r.confidence=$c, '
                f'r.timestamp=$ts, r.season_threshold=1'
            )
            session.run(q, {
                'src': rel['source'], 'tgt': rel['target'],
                'w': rel['weight'],   't': rel['trust'],
                'c': rel['confidence'], 'ts': rel['timestamp'],
            })
            ok += 1
        print(f'[SEEDER] {ok} relationships created.')

        for ev in EVENTS:
            ev_props = {k: v for k, v in ev.items() if k != 'id'}
            session.run('MERGE (e:Event {id: $id}) SET e += $props',
                        {'id': ev['id'], 'props': ev_props})
        print(f'[SEEDER] {len(EVENTS)} events created.')

    driver.close()
    print('[SEEDER] Complete.')


if __name__ == '__main__':
    seed()
