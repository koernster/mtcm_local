#!/usr/bin/env python3
"""Track all Hasura relationships automatically."""
import requests
import json

HASURA = 'http://localhost:8080'
SECRET = 'myadminsecretkey'
headers = {'x-hasura-admin-secret': SECRET, 'Content-Type': 'application/json'}

r = requests.post(f'{HASURA}/v1/metadata', headers=headers, json={
    'type': 'pg_suggest_relationships',
    'version': 1,
    'args': {'source': 'default', 'omit_tracked': True}
})

rels = r.json().get('relationships', [])
print(f'Processing {len(rels)} relationships...')

created = 0
failed = 0
errors = []

for rel in rels:
    rel_type = rel['type']
    from_table = rel['from']['table']
    to_table = rel['to']['table']
    from_cols = rel['from']['columns']
    to_cols = rel['to']['columns']

    if rel_type == 'object':
        col = from_cols[0]
        target = to_table['name']

        # Generate name based on FK column
        if col.endswith('id'):
            base = col[:-2] if len(col) > 2 else col
            name = base if base else target
        else:
            name = target

        payload = {
            'type': 'pg_create_object_relationship',
            'args': {
                'source': 'default',
                'table': from_table,
                'name': name,
                'using': {
                    'foreign_key_constraint_on': col
                }
            }
        }
    else:
        col = to_cols[0]
        target = to_table['name']
        name = target + 's' if not target.endswith('s') else target

        payload = {
            'type': 'pg_create_array_relationship',
            'args': {
                'source': 'default',
                'table': from_table,
                'name': name,
                'using': {
                    'foreign_key_constraint_on': {
                        'table': to_table,
                        'column': col
                    }
                }
            }
        }

    cr = requests.post(f'{HASURA}/v1/metadata', headers=headers, json=payload)
    if cr.status_code == 200:
        created += 1
    else:
        err = cr.json().get('error', '')
        if 'already exists' in err:
            # Try alternative name
            alt_name = name + 'By' + col[0].upper() + col[1:]
            payload['args']['name'] = alt_name
            cr2 = requests.post(f'{HASURA}/v1/metadata', headers=headers, json=payload)
            if cr2.status_code == 200:
                created += 1
            else:
                failed += 1
                errors.append(f"{from_table['name']}.{alt_name}: {cr2.json().get('error','')[:80]}")
        else:
            failed += 1
            errors.append(f"{from_table['name']}.{name}: {err[:80]}")

print(f'Created: {created}, Failed: {failed}')
for e in errors[:15]:
    print(f'  {e}')
