# YaadBody

YaadBody is the domain and application layer for YaadBody Meal Prep, Catering, and Party Trays.

This repository owns YaadBody-specific business meaning: meals, recipes, portions, menus, catering packages, food operations, customer experience, and kitchen UI.

It does **not** own shared authentication, tenant authority, billing infrastructure, or automation/orchestration infrastructure. Those capabilities belong to Avuhz and will be integrated through stable public contracts when available.

## Current build boundary

The initial build is repository-local and uses no production resources. It focuses on:

- domain logic for meal prep and catering;
- recipe/component and nutrition/cost modeling;
- weekly menu rotation and controlled substitutions;
- customer ordering UI;
- kitchen/admin operating UI; and
- deterministic local fixtures/tests.

No provider credentials or secrets belong in this repository.
