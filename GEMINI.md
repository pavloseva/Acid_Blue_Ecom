# Directivas de Desarrollo y Flujo Git

## 1. Política Estricta de Ramas y Despliegues

- **Todo cambio se desarrolla y testea primero en `develop`:**
  - Cualquier corrección de bug, nueva funcionalidad o ajuste se implementa y prueba exclusivamente en la rama `develop`.
  - Se debe verificar la compilación local (`npx tsc --noEmit` y `npm run build`) en `develop`.
  
- **Prohibido mergear o pushear a `main` sin aprobación explícita del usuario:**
  - **NUNCA** realizar `git merge` ni `git push` a `main` de manera automática.
  - La rama `main` corresponde al entorno de producción en vivo ([acid-blue-ecom.vercel.app](https://acid-blue-ecom.vercel.app)).
  - El usuario debe probar y validar primero en la preview de `develop` y dar su confirmación explícita previa antes de cualquier paso a `main`.
