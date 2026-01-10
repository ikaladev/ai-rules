/**
 * Backend Templates - Reglas para desarrollo backend
 */

import { RuleTemplate } from './types';

export const backendTemplates: RuleTemplate[] = [
    {
        id: 'backend-api',
        es: {
            name: 'API REST',
            description: 'Reglas para diseño de APIs RESTful',
            content: `## 🔌 API REST

### Diseño
- Usar sustantivos en plural para recursos (/users, /posts)
- Métodos HTTP semánticos (GET, POST, PUT, DELETE, PATCH)
- Versionado de API (/v1/, /v2/)
- Códigos de estado HTTP apropiados
- HATEOAS cuando sea apropiado

### Estructura de Respuestas
- JSON como formato predeterminado
- Estructura consistente de respuestas
- Mensajes de error descriptivos
- Paginación para listas grandes
- Incluir metadata (total, page, limit)

### Seguridad
- Validar TODOS los inputs
- Sanitizar datos de entrada
- Rate limiting
- CORS configurado apropiadamente
- Headers de seguridad (HELMET)
`
        },
        en: {
            name: 'REST API',
            description: 'Rules for RESTful API design',
            content: `## 🔌 REST API

### Design
- Use plural nouns for resources (/users, /posts)
- Semantic HTTP methods (GET, POST, PUT, DELETE, PATCH)
- API Versioning (/v1/, /v2/)
- Appropriate HTTP status codes
- HATEOAS when appropriate

### Response Structure
- JSON as default format
- Consistent response structure
- Descriptive error messages
- Pagination for large lists
- Include metadata (total, page, limit)

### Security
- Validate ALL inputs
- Sanitize input data
- Rate limiting
- CORS configured appropriately
- Security Headers (HELMET)
`
        }
    },
    {
        id: 'backend-database',
        es: {
            name: 'Base de Datos',
            description: 'Reglas para manejo de bases de datos',
            content: `## 🗄️ Base de Datos

### Queries
- Usar prepared statements (evitar SQL injection)
- Índices en columnas frecuentemente consultadas
- LIMIT en queries que pueden retornar muchos resultados
- Evitar N+1 queries
- Transacciones para operaciones multi-paso

### Migraciones
- Migraciones versionadas y reversibles
- Nunca editar migraciones aplicadas
- Probar migraciones en entorno de desarrollo
- Backup antes de migraciones en producción

### Optimización
- Desnormalizar cuando sea necesario (trade-off)
- Cachear queries costosas
- Connection pooling
- Lazy loading de relaciones
`
        },
        en: {
            name: 'Database',
            description: 'Rules for database management',
            content: `## 🗄️ Database

### Queries
- Use prepared statements (avoid SQL injection)
- Indexes on frequently queried columns
- LIMIT on queries that can return many results
- Avoid N+1 queries
- Transactions for multi-step operations

### Migrations
- Versioned and reversible migrations
- Never edit applied migrations
- Test migrations in development environment
- Backup before production migrations

### Optimization
- Denormalize when necessary (trade-off)
- Cache expensive queries
- Connection pooling
- Lazy loading of relationships
`
        }
    },
    {
        id: 'backend-auth',
        es: {
            name: 'Autenticación/Autorización',
            description: 'Reglas de seguridad y autenticación',
            content: `## 🔐 Autenticación / Autorización

### Autenticación
- JWT para APIs stateless
- Sessions para aplicaciones tradicionales
- Refresh tokens para renovación
- Hash passwords con bcrypt/argon2
- 2FA para operaciones críticas

### Autorización
- Principe de mínimo privilegio
- Role-Based Access Control (RBAC) o
- Attribute-Based Access Control (ABAC)
- Validar permisos en cada endpoint
- No confiar en datos del cliente

### Buenas Prácticas
- HTTPS en producción (siempre)
- Expiración de tokens
- Logout que invalide tokens
- Protección contra brute force
- Logs de intentos de acceso
`
        },
        en: {
            name: 'Auth / Authorization',
            description: 'Security and authentication rules',
            content: `## 🔐 Auth / Authorization

### Authentication
- JWT for stateless APIs
- Sessions for traditional applications
- Refresh tokens for renewal
- Hash passwords with bcrypt/argon2
- 2FA for critical operations

### Authorization
- Principle of least privilege
- Role-Based Access Control (RBAC) or
- Attribute-Based Access Control (ABAC)
- Validate permissions at each endpoint
- Do not trust client data

### Best Practices
- HTTPS in production (always)
- Token expiration
- Logout that invalidates tokens
- Brute force protection
- Access attempt logs
`
        }
    }
];
