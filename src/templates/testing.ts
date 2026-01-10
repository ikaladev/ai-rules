/**
 * Testing Templates - Reglas para testing
 */

import { RuleTemplate } from './types';

export const testingTemplates: RuleTemplate[] = [
    {
        id: 'testing-unit',
        es: {
            name: 'Unit Testing',
            description: 'Reglas para pruebas unitarias',
            content: `## 🧪 Unit Testing

### Principios
- Un test = Una cosa a probar
- Tests independientes (no dependen entre sí)
- Tests determinísticos (siempre mismo resultado)
- Nombres descriptivos (lo que se prueba)
- AAA pattern: Arrange, Act, Assert

### Cobertura
- Objetivo: >80% cobertura
- Priorizar lógica de negocio
- Casos edge y errores
- Happy path + Sad paths
- No obsesionarse con 100%

### Mejores Prácticas
- Mock dependencias externas
- Tests rápidos (<100ms)
- No probar implementación, probar comportamiento
- Usar fixtures/factories para datos de prueba
- Tests legibles como documentación
`
        },
        en: {
            name: 'Unit Testing',
            description: 'Rules for unit testing',
            content: `## 🧪 Unit Testing

### Principles
- One test = One thing to test
- Independent tests (do not rely on each other)
- Deterministic tests (always same result)
- Descriptive names (what is being tested)
- AAA pattern: Arrange, Act, Assert

### Coverage
- Goal: >80% coverage
- Prioritize business logic
- Edge cases and errors
- Happy path + Sad paths
- Do not obsess over 100%

### Best Practices
- Mock external dependencies
- Fast tests (<100ms)
- Do not test implementation, test behavior
- Use fixtures/factories for test data
- Readable tests as documentation
`
        }
    },
    {
        id: 'testing-integration',
        es: {
            name: 'Integration/E2E',
            description: 'Reglas para pruebas de integración',
            content: `## 🔗 Integration / E2E Testing

### Integration Tests
- Probar interacción entre módulos
- Usar base de datos de prueba
- Limpiar estado entre tests
- Probar flujos complejos
- Menos tests, más valor

### E2E Tests
- Probar flujos críticos del usuario
- Desde la perspectiva del usuario
- Selectores estables (data-testid)
- Esperas explícitas, no sleeps
- Paralelización cuando sea posible

### Herramientas
- Jest/Vitest para unit
- Testing Library para componentes
- Cypress/Playwright para E2E
- MSW para mocking de APIs
`
        },
        en: {
            name: 'Integration/E2E',
            description: 'Rules for integration testing',
            content: `## 🔗 Integration / E2E Testing

### Integration Tests
- Test interaction between modules
- Use test database
- Clean state between tests
- Test complex flows
- Fewer tests, more value

### E2E Tests
- Test critical user flows
- From user perspective
- Stable selectors (data-testid)
- Explicit waits, no sleeps
- Parallelization when possible

### Tools
- Jest/Vitest for unit
- Testing Library for components
- Cypress/Playwright for E2E
- MSW for API mocking
`
        }
    }
];
