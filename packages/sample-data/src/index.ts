export const packageName = '@ledra/sample-data';

export const SAMPLE_REGISTRY_ROOT = 'packages/sample-data/registry';

export const SAMPLE_ENTITY_IDS = [
  'site-tokyo-prod',
  'site-osaka-staging',
  'segment-tokyo-core',
  'segment-tokyo-edge',
  'segment-osaka-core',
  'vlan-tokyo-app',
  'vlan-tokyo-db',
  'vlan-tokyo-edge',
  'vlan-osaka-app',
  'prefix-tokyo-app',
  'prefix-tokyo-db',
  'prefix-tokyo-edge',
  'prefix-osaka-app',
  'allocation-web-01',
  'allocation-api-01',
  'allocation-db-01',
  'allocation-bastion-01',
  'allocation-web-staging-01',
  'host-web-01',
  'host-api-01',
  'host-db-01',
  'host-bastion-01',
  'host-web-staging-01',
  'service-web-public',
  'service-web-health',
  'service-api-internal',
  'service-postgres',
  'service-admin-ssh',
  'service-web-staging',
  'dns-web-public',
  'dns-api-internal',
  'dns-db-internal',
  'dns-bastion-public',
  'dns-web-staging'
] as const;

export const SAMPLE_VIEW_IDS = [
  'view-sites',
  'view-production-inventory',
  'view-staging-overview',
  'view-public-exposure',
  'view-ipam-capacity',
  'view-dns-map',
  'view-application-stack'
] as const;

export const SAMPLE_POLICY_IDS = ['policy-core-registry'] as const;
