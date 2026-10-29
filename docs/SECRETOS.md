# zaelyn-portal — inventario de secretos y variables (sin valores)

**Este archivo no contiene valores. Nunca.** Solo qué existe, para qué sirve y
dónde vive.

| Variable | Para qué sirve | ¿Secreto? | Dónde vive |
|---|---|---|---|
| `ZAELYN_API` | URL de la API de Zaelyn a la que el portal le pregunta todo (`lib/api.ts`). Sin ella el portal dice «todavía no está conectado» y ofrece el ejemplo | No (la API exige token de sesión en cada petición) | Vercel, proyecto `zaelyn-portal` (Production y Preview) |

El portal no guarda credenciales: no tiene base de datos ni usuarios propios.
Si algún día aparece aquí una llave, primero se anota la decisión en
`docs/DECISIONS.md`.
