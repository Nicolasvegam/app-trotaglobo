Crear o actualizar entrada en el changelog para startups
Usage: /changelog [$ARGUMENTS]

Description:
Crea o actualiza el archivo CHANGELOG.md optimizado para desarrollo ágil de startups.
Usa fechas en lugar de versiones complejas y se enfoca en comunicar valor al usuario.

Parameters:

Descripción del cambio del CHANGELOG. Este parámetro sólo indica el rango de nuevos cambios.

Examples:

/changelog "Agrega las últimas actualizaciones"
/changelog "Agrega las últimas actualizaciones de los últimos 3 meses"
/changelog "Agrega las últimas actualizaciones de los últimos 3 meses"

Instructions:

Lee el archivo CHANGELOG.md existente si existe
Si no existe, crea estructura optimizada para startups
Determina el período actual
Lee todos los cambios desde git con el periodo deseado
Identifica los commits que pertenecen al mismo grupo y empieza a armar el changelog.
Crear o actualiza el archivo CHANGELOG.md, no debes borrar la historia, sólo siempre actualizar.
Pon siempre la información ordenada de manera temporal.

Interpretación de Commits:

🐛 Correcciones: "fix", "bug", "error", "issue", "patch", "hotfix"
✨ Nuevas Funciones: "add", "new", "feature", "implement", "create"
🔧 Mejoras: "improve", "optimize", "enhance", "update", "refactor", "performance"
⚠️ Cambios Importantes: "breaking", "remove", "delete", "deprecate"
📝 Documentación: "docs", "readme", "documentation"
🔧 Desarrollo: "test", "ci", "build", "deps", "chore"

Agrupa cambios por período (meses)
Usa lenguaje orientado al usuario, no técnico, por ende interpreta el código en funcionalides. Y explicalo de manera práctica, que se entienda lo que se hizo.
Incluye impacto/beneficio cuando sea posible
Mantén un tono casual pero profesional apropiado para startup

Template Structure (Español):

# 🚀 Registro de Cambios

Todos los cambios importantes de nuestro producto se documentan aquí y la persona que los hizo

## Junio, 2025

### ✨ Lo Nuevo

- Funciones que agregamos

### 🔧 Mejoras

- Cosas que funcionan mejor

### 🐛 Solucionamos

- Problemas que arreglamos

### ⚠️ Importante

- Cambios que pueden afectar tu flujo de trabajo

## Previous Month, Year

...
...
...
