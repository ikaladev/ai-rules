/**
 * General Templates - Reglas generales para cualquier proyecto
 */

import { RuleTemplate } from './types';

export const generalTemplates: RuleTemplate[] = [
    {
        id: 'general-basic',
        es: {
            name: 'Reglas Básicas',
            description: 'Reglas fundamentales de estilo y arquitectura',
            content: `## 📋 Reglas Generales

### Estilo de Código
- Usar nombres descriptivos y significativos
- Escribir funciones pequeñas y enfocadas (max 50 líneas)
- Un solo propósito por función/clase
- Evitar duplicación de código (DRY - Don't Repeat Yourself)
- Comentar código complejo, no código obvio

### Arquitectura
- Separación de responsabilidades
- Principios SOLID cuando sea apropiado
- Preferir composición sobre herencia
- Mantener dependencias bajo control

### Nombrado
- Variables y funciones: camelCase
- Clases: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Archivos: kebab-case o camelCase según convención del proyecto
`
        },
        en: {
            name: 'Basic Rules',
            description: 'Fundamental style and architecture rules',
            content: `## 📋 General Rules

### Code Style
- Use descriptive and meaningful names
- Write small and focused functions (max 50 lines)
- Single responsibility per function/class
- Avoid code duplication (DRY - Don't Repeat Yourself)
- Comment complex code, not obvious code

### Architecture
- Separation of concerns
- SOLID principles when appropriate
- Prefer composition over inheritance
- Keep dependencies under control

### Naming
- Variables and functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case or camelCase depending on project convention
`
        }
    },
    {
        id: 'general-clean-code',
        es: {
            name: 'Clean Code',
            description: 'Principios de código limpio',
            content: `## ✨ Clean Code

### Legibilidad
- El código se lee más veces de las que se escribe
- Código auto-explicativo > Comentarios extensos
- Nombres que revelen intención
- Evitar abreviaciones confusas

### Funciones
- Una función = Una responsabilidad
- Máximo 3-4 parámetros
- Evitar efectos secundarios ocultos
- Retornar early para reducir anidamiento

### Manejo de Errores
- Usar excepciones, no códigos de error
- Proporcionar contexto en los errores
- No ignorar errores silenciosamente
- Fail fast cuando sea apropiado
`
        },
        en: {
            name: 'Clean Code',
            description: 'Clean Code principles',
            content: `## ✨ Clean Code

### Readability
- Code is read much more often than it is written
- Self-explanatory code > Extensive comments
- Names that reveal intention
- Avoid confusing abbreviations

### Functions
- One function = One responsibility
- Max 3-4 parameters
- Avoid hidden side-effects
- Return early to reduce nesting

### Error Handling
- Use exceptions, not error codes
- Provide context in errors
- Do not ignore errors silently
- Fail fast when appropriate
`
        }
    },
    {
        id: 'general-performance',
        es: {
            name: 'Performance',
            description: 'Reglas de optimización y rendimiento',
            content: `## ⚡ Performance

### Optimización
- No optimizar prematuramente
- Medir antes de optimizar
- Optimizar cuellos de botella identificados
- Considerar trade-offs entre legibilidad y performance

### Mejores Prácticas
- Evitar operaciones costosas en loops
- Cachear resultados cuando sea apropiado
- Lazy loading de recursos pesados
- Debounce/throttle para eventos frecuentes
- Pagination para datasets grandes
`
        },
        en: {
            name: 'Performance',
            description: 'Optimization and performance rules',
            content: `## ⚡ Performance

### Optimization
- Do not optimize prematurely
- Measure before optimizing
- Optimize identified bottlenecks
- Consider trade-offs between readability and performance

### Best Practices
- Avoid expensive operations in loops
- Cache results when appropriate
- Lazy loading for heavy resources
- Debounce/throttle for frequent events
- Pagination for large datasets
`
        }
    }
];
