# YaadBody Agent Rules

## Boundary

YaadBody owns food-business domain logic and application/UI behavior. Shared authentication, tenant authority, billing, event orchestration, communications infrastructure, and cross-domain automation belong to Avuhz.

Do not create a YaadBody-specific replacement for an Avuhz shared primitive.

## Verify before apply

Before any external or provider change, explicitly confirm the repository, environment, provider namespace/project, responsibility boundary, and exact resource. Production is never assumed safe to touch.

Repository-local development may proceed without provider access. Keep changes scoped and apply one resource boundary at a time.

## Security

- Never hardcode secrets, tokens, passwords, private keys, or authenticated URLs.
- Do not log full customer PII when an opaque ID or minimized value is enough.
- Do not add a database table without a documented tenant/isolation plan for its eventual hosted persistence.
- Do not add service-role or elevated-provider credentials to frontend code.

## Domain law

Keep YaadBody meaning here: recipes, portions, meal plans, menu rotation, substitutions, catering packages, food-production rules, labeling data, waste reasons, and customer-facing experiences.

When a requirement is reusable across unrelated businesses, model the YaadBody need behind a local interface and propose the reusable capability for Avuhz rather than embedding shared infrastructure here.

## Task completion

End work with what changed, what was verified, remaining gaps, and one explicit next action.
