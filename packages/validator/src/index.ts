import type { EntityRecord, ValidationIssue, ValidationResult } from '@ledra/types';

export const packageName = '@ledra/validator';

const withSourcePath = (
  issue: Omit<ValidationIssue, 'sourceFilePath'>,
  sourceFilePath: string | undefined
): ValidationIssue =>
  sourceFilePath === undefined
    ? issue
    : {
        ...issue,
        sourceFilePath
      };

export const validateEntities = (entities: readonly EntityRecord[]): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const ids = new Set(entities.map((entity) => entity.id));

  for (const entity of entities) {
    if (!entity.id.trim()) {
      issues.push(withSourcePath({ code: 'missing-id', message: 'Entity id is required.' }, entity.sourceFilePath));
    }

    if (!entity.type.trim()) {
      issues.push(
        withSourcePath(
          {
            code: 'missing-type',
            message: `Entity ${entity.id || '<unknown>'} requires a type.`,
            entityId: entity.id
          },
          entity.sourceFilePath
        )
      );
    }

    for (const relation of entity.relations) {
      if (!ids.has(relation.targetId)) {
        issues.push(
          withSourcePath(
            {
              code: 'invalid-relation-target',
              message: `Relation target '${relation.targetId}' does not exist.`,
              entityId: entity.id
            },
            entity.sourceFilePath
          )
        );
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues
  };
};
