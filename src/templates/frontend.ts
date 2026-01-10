/**
 * Frontend Templates - Reglas para desarrollo frontend
 */

import { RuleTemplate } from './types';

export const frontendTemplates: RuleTemplate[] = [
    {
        id: 'frontend-react',
        es: {
            name: 'React/Next.js',
            description: 'Reglas para proyectos React y Next.js',
            content: `## ⚛️ React / Next.js

### Componentes
- Usar componentes funcionales con hooks
- Un componente por archivo
- Props con TypeScript interfaces
- Destructuring de props al inicio
- Separar lógica compleja en custom hooks

### Estado
- useState para estado local simple
- useReducer para estado complejo
- Context API para estado global simple
- Zustand/Redux para estado global complejo
- Evitar prop drilling excesivo

### Performance
- React.memo para componentes pesados
- useMemo para cálculos costosos
- useCallback para funciones que se pasan como props
- Lazy loading de componentes pesados
- Code splitting por rutas

### Estructura
- components/ - Componentes reutilizables
- pages/ o app/ - Páginas/rutas
- hooks/ - Custom hooks
- utils/ - Funciones utilitarias
- types/ - TypeScript types/interfaces
`
        },
        en: {
            name: 'React/Next.js',
            description: 'Rules for React and Next.js projects',
            content: `## ⚛️ React / Next.js

### Components
- Use functional components with hooks
- One component per file
- Props with TypeScript interfaces
- Destructure props at the beginning
- Separate complex logic into custom hooks

### State
- useState for simple local state
- useReducer for complex state
- Context API for simple global state
- Zustand/Redux for complex global state
- Avoid excessive prop drilling

### Performance
- React.memo for heavy components
- useMemo for expensive calculations
- useCallback for functions passed as props
- Lazy loading for heavy components
- Code splitting by routes

### Structure
- components/ - Reusable components
- pages/ or app/ - Pages/routes
- hooks/ - Custom hooks
- utils/ - Utility functions
- types/ - TypeScript types/interfaces
`
        }
    },
    {
        id: 'frontend-styling',
        es: {
            name: 'CSS/Styling',
            description: 'Reglas de estilos y diseño',
            content: `## 🎨 CSS / Styling

### Metodología
- Usar CSS-in-JS (styled-components, emotion) o
- TailwindCSS para utility-first o
- CSS Modules para scoped styles
- Evitar CSS global cuando sea posible

### Principios
- Mobile-first approach
- Usar variables CSS para temas
- Consistencia en spacing (4px, 8px, 16px...)
- Accesibilidad: contraste color, tamaños touch
- Responsive design en todas las vistas

### Organización
- Separar estilos globales de componentes
- Theme en archivo centralizado
- Reutilizar mixins/utilities
- Evitar magic numbers en CSS
`
        },
        en: {
            name: 'CSS/Styling',
            description: 'Styling and design rules',
            content: `## 🎨 CSS / Styling

### Methodology
- Use CSS-in-JS (styled-components, emotion) or
- TailwindCSS for utility-first or
- CSS Modules for scoped styles
- Avoid global CSS when possible

### Principles
- Mobile-first approach
- Use CSS variables for themes
- Consistency in spacing (4px, 8px, 16px...)
- Accessibility: color contrast, touch sizes
- Responsive design in all views

### Organization
- Separate global styles from components
- Theme in centralized file
- Reuse mixins/utilities
- Avoid magic numbers in CSS
`
        }
    },
    {
        id: 'frontend-accessibility',
        es: {
            name: 'Accesibilidad (a11y)',
            description: 'Reglas de accesibilidad web',
            content: `## ♿ Accesibilidad

### Semántica HTML
- Usar tags semánticos (<nav>, <main>, <article>)
- Labels para todos los inputs
- Alt text descriptivo en imágenes
- Headings en orden jerárquico (h1 → h2 → h3)

### Interactividad
- Navegación completa por teclado
- Focus visible y lógico
- ARIA labels cuando sea necesario
- Skip links para navegación rápida

### Compatibilidad
- Contrastecontraste mínimo WCAG AA (4.5:1)
- Zoom hasta 200% sin romper layout
- No depender solo de color para información
- Probar con screen readers
`
        },
        en: {
            name: 'Accessibility (a11y)',
            description: 'Web accessibility rules',
            content: `## ♿ Accessibility

### HTML Semantics
- Use semantic tags (<nav>, <main>, <article>)
- Labels for all inputs
- Descriptive Alt text on images
- Headings in hierarchical order (h1 → h2 → h3)

### Interactivity
- Full keyboard navigation
- Visible and logical focus
- ARIA labels when necessary
- Skip links for quick navigation

### Compatibility
- Minimum contrast WCAG AA (4.5:1)
- Zoom up to 200% without breaking layout
- Do not rely only on color for information
- Test with screen readers
`
        }
    }
];
