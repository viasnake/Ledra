import type { EntityRecord } from '@ledra/types';

export const packageName = '@ledra/sample-data';

export const SAMPLE_ENTITIES: readonly EntityRecord[] = [
  {
    id: 'site-tokyo',
    type: 'site',
    title: 'Tokyo DC',
    summary: 'Primary site',
    tags: ['production'],
    relations: [{ type: 'contains', targetId: 'segment-core' }],
    sourceFilePath: 'packages/sample-data/data/site.yaml'
  },
  {
    id: 'segment-core',
    type: 'segment',
    title: 'Core Segment',
    tags: ['core'],
    relations: [{ type: 'uses', targetId: 'vlan-100' }],
    sourceFilePath: 'packages/sample-data/data/segment.json'
  },
  {
    id: 'vlan-100',
    type: 'vlan',
    title: 'VLAN 100',
    tags: ['l2'],
    relations: [{ type: 'provides', targetId: 'prefix-10-0-0-0-24' }],
    sourceFilePath: 'packages/sample-data/data/vlan.yaml'
  },
  {
    id: 'prefix-10-0-0-0-24',
    type: 'prefix',
    title: '10.0.0.0/24',
    tags: ['ipv4'],
    relations: [{ type: 'allocates', targetId: 'allocation-app-01' }],
    sourceFilePath: 'packages/sample-data/data/prefix.json'
  },
  {
    id: 'allocation-app-01',
    type: 'allocation',
    title: 'app-01 allocation',
    tags: ['ipam'],
    relations: [{ type: 'assigned_to', targetId: 'host-app-01' }],
    sourceFilePath: 'packages/sample-data/data/allocation.yaml'
  },
  {
    id: 'host-app-01',
    type: 'host',
    title: 'app-01',
    tags: ['linux'],
    relations: [{ type: 'runs', targetId: 'service-web' }],
    sourceFilePath: 'packages/sample-data/data/host.json'
  },
  {
    id: 'service-web',
    type: 'service',
    title: 'Web Service',
    tags: ['http'],
    relations: [{ type: 'resolves_to', targetId: 'dns-record-app' }],
    sourceFilePath: 'packages/sample-data/data/service.yaml'
  },
  {
    id: 'dns-record-app',
    type: 'dns_record',
    title: 'app.example.test',
    tags: ['dns'],
    relations: [{ type: 'located_at', targetId: 'site-tokyo' }],
    sourceFilePath: 'packages/sample-data/data/dns_record.json'
  }
];
