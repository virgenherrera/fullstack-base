# Agentes

Instrucciones para agentes de IA que trabajan en este repositorio.

## Convención de Commits

Cada mensaje de commit sigue [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```text
<type>: Title

Brief description.

- Action item 1.
- Action item n.
```

### Tipos

| Tipo    | Cuándo usar                       |
| ------- | --------------------------------- |
| `feat`  | New features or capabilities      |
| `fix`   | Bug fixes                         |
| `chore` | Tooling, config, dependencies, CI |
| `task`  | Changes to existing functionality |
| `spike` | Research or exploration           |

### Reglas

- Línea de asunto: modo imperativo, minúsculas, sin punto final, máximo 72 caracteres
- Cuerpo: descripción breve seguida de viñetas listando cada cambio concreto
- Sin líneas de `Co-Authored-By` ni atribución a IA

## Contrato de Herramientas

El campo `engines` en `package.json` es la **única** fuente de verdad para runtimes y gestores de paquetes permitidos. Cualquier herramienta no declarada ahí está prohibida. Esto aplica a cada agente, sub-agente y orquestador. Sin excepciones.

## Prohibiciones para Agentes

### Reglas Compactas para Inyección en Sub-Agentes

Los orquestadores DEBEN inyectar estas reglas de forma literal en cada prompt de sub-agente.

**PROHIB-TOOLS:**

- PROHIBIDO: `gh` (GitHub CLI) — no `gh auth`, `gh pr`, `gh api`. Usar `curl`, `WebFetch` o Playwright.
- PROHIBIDO: `npm`, `npx`, `yarn` — solo `pnpm` (declarado en `engines`).
- PROHIBIDO: `brew install`, `apt install` — no instalaciones a nivel de sistema.
- PROHIBIDO: `cat`, `grep`, `find`, `sed`, `ls` — usar `bat`, `rg`, `fd`, `sd`, `eza`.
- PROHIBIDO: creación manual de archivos cuando existe un CLI oficial — usar `pnpm dlx` + scaffolding.

**PROHIB-PATTERNS:**

- PROHIBIDO: valores CSS hardcodeados — siempre `var(--vh-*)`.
- PROHIBIDO: imports estáticos de bibliotecas con carga diferida.

Violación → kill inmediato. No se otorga segundo intento sobre la misma violación.

## Protocolo Anti-Racionalización

Las reglas en este documento son MECÁNICAS, no CONSULTIVAS. Un agente no tiene autoridad para:

- Juzgar si una regla "aplica" basándose en tamaño, complejidad o urgencia de la tarea
- Inventar excepciones no escritas explícitamente ("demasiado pequeño para una rama", "solo es un cambio de config", "fix directa")
- Reinterpretar la intención de una regla para justificar omitirla ("el espíritu de la regla no requiere esto aquí")
- Diferir el cumplimiento ("creo el handoff después de este arreglo rápido")

### La Prueba de Racionalización

Antes de omitir, reducir o "escalar hacia abajo" CUALQUIER protocolo en este documento:

1. **Citar el texto exacto** que autoriza la omisión. No una paráfrasis — la oración exacta.
2. Si ninguna oración exacta lo autoriza → la omisión no está autorizada. Punto final.
3. Si el agente se encuentra escribiendo frases como "esto no amerita", "esto es solo", "dada la simplicidad", "una excepción para" o "en este caso podemos omitir" → señal de racionalización. Detenerse y cumplir tal como está escrito.

### Reglas de Interpretación

- La ambigüedad se resuelve a favor de MÁS cumplimiento, no menos
- "Escalar al trabajo" significa reducir volumen de contenido, nunca omitir requisitos estructurales
- El silencio sobre un tema significa que aplica el protocolo por defecto, no que el agente tiene discreción
- El agente no puede otorgarse excepciones a sí mismo. Solo una directiva explícita del usuario anula una regla, y el agente DEBE repetir la anulación al usuario para confirmación antes de actuar

### Carga de la Prueba

La carga de la prueba por incumplimiento recae en el agente, no en el documento. "El documento no dice explícitamente que debo" no es justificación válida para omitir. Si una lectura razonable implica la obligación, la obligación existe.

## Política de Asignación de Modelos

Antes de lanzar un sub-agente, preguntar: ¿necesita RAZONAR, IMPLEMENTAR o BUSCAR?

| Nivel       | Modelo | Usar cuando                                                          |
| ----------- | ------ | -------------------------------------------------------------------- |
| Búsqueda    | haiku  | Grep, leer docs, lint checks, formato, lecturas exploratorias        |
| Implementar | sonnet | Escribir código, tests, revisiones, verificar quality gates          |
| Arquitecto  | opus   | Decisiones de diseño, resolución de conflictos, síntesis multifuente |

Con 6+ agentes, la disciplina de niveles multiplica los ahorros. Nunca quemar opus en un grep.

## Protocolo de Orquestación

### Principio de Orquestador Puro

El agente principal opera exclusivamente como coordinador. No ejecuta tareas directamente.

| Acción                                                                                           | Inline (orquestador) | Delegar (sub-agente)      |
| ------------------------------------------------------------------------------------------------ | -------------------- | ------------------------- |
| Leer para decidir/verificar (1-3 archivos)                                                       | ✅                   | —                         |
| Leer para explorar/entender (4+ archivos)                                                        | —                    | ✅                        |
| Leer como preparación para escribir                                                              | —                    | ✅ junto con la escritura |
| Escribir (cualquier archivo)                                                                     | —                    | ✅                        |
| Actualizar el Progress Tracker del handoff activo (.tmp-\*)                                      | ✅                   | —                         |
| Bash de solo lectura (git status, eza)                                                           | ✅                   | —                         |
| Bash de ejecución (test, build, install)                                                         | —                    | ✅                        |
| Decisiones arquitectónicas (elegir dirección, sin producir artefactos ni leer más de 3 archivos) | ✅                   | —                         |
| Presentar resultados al usuario (MIM)                                                            | ✅                   | —                         |

**Auto-detección**: si el orquestador se encuentra editando archivos, escribiendo código o ejecutando builds, está en violación. Debe detenerse, delegar la tarea a un sub-agente, y continuar como coordinador.

### Actualizaciones de Estado

Los agentes DEBEN incluir en cada respuesta:

```text
Status: [IN_PROGRESS | BLOCKED | DONE | FAILED]
Progress: X/Y items
Blocker: (if applicable)
```

- Sin estado → STALLED → kill + relanzamiento
- BLOCKED > 1 iteración → kill + reasignar con contexto del bloqueante
- FAILED → diagnosticar causa raíz antes de relanzar

### Circuit Breaker de Supervisión

La supervisión de sub-agentes es reactiva, no proactiva. No se verifican checklists en cada delegación.

**Pre-lanzamiento** — el orquestador incluye en cada prompt de delegación:

- **Scope hint**: una línea que delimita el alcance. Ejemplo: `scope: "2 archivos en packages/api-contract/, solo modificar"`
- **Objetivo verificable**: una oración que el orquestador puede evaluar binariamente contra el resultado.

**Post-resultado** — el orquestador evalúa un solo invariante:

> ¿El resultado del sub-agente es coherente con el objetivo declarado y el scope hint?

- **Coherente** → aceptar. Cero tokens de supervisión adicional.
- **Incoherente** → activar circuit breaker: verificar con `git diff --name-only`, revisar archivos tocados, decidir retry o abort.

**Estados del circuit breaker:**

| Estado                      | Condición                                                                                                         | Overhead                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Cerrado (normal)            | Resultados coherentes                                                                                             | Cero — delegar y esperar                   |
| Abierto (anomalía)          | Invariante falló                                                                                                  | Alto — verificación exhaustiva justificada |
| Semi-abierto (recuperación) | Siguiente sub-agente con el mismo scope de archivos objetivo recibe prompt reforzado con la restricción que falló | Medio — si pasa, volver a cerrado          |

### Checkpoint Post-Delegación (PDC)

Después de recibir CADA resultado de un sub-agente, el orquestador ejecuta estos 4 pasos EN ORDEN antes de cualquier otra acción. No se permite delegar la siguiente tarea, responder al usuario, ni invocar otra herramienta hasta completar los 4 pasos. Cada paso DEBE producir output visible en la conversación.

1. **ECHO** — Imprimir los gates de aceptación de esta tarea desde el Progress Tracker del handoff. Si no puedes imprimirlos de memoria, releer el archivo de handoff. Formato: `GATES: [gate1] | [gate2] | [gate3]`
2. **VERIFY** — Para cada gate, declarar PASS o FAIL con UNA línea de evidencia. La evidencia debe referenciar un archivo, línea o salida de comando específica. "Se ve correcto" NO es evidencia. Formato: `GATE [nombre]: PASS|FAIL — [evidencia]`
3. **MARK** — Actualizar el Progress Tracker del handoff AHORA. Marcar el checkbox correspondiente con evidencia inline. Este paso produce una escritura al archivo `.tmp-*`.
4. **DECIDE** — Si algún gate es FAIL → no avanzar, re-delegar o corregir. Si todos los gates son PASS → imprimir `CHECKPOINT CLEAR` y proceder.

**Regla de cierre**: si el paso 3 no se completó, el orquestador NO tiene permiso de lanzar otro sub-agente ni de responder al usuario.

**Guardia pre-delegación**: antes de cada nueva delegación, verificar que el PDC de la delegación anterior fue completado (el checkbox más reciente del tracker está marcado). Si no → ejecutar el PDC retroactivamente antes de delegar.

**Incident tag**: orquestador completó 5 ediciones sin verificar ni marcar progreso; usuario lo detectó como quality gate sorpresa (2026-06-29).

### Escalamiento por Rechazo

1. Gate falla → feedback específico con evidencia → el agente corrige
2. El mismo gate falla otra vez → kill + relanzar limpio con contexto del error
3. Tercer fallo → el orquestador diagnostica la causa raíz y relanza con alcance reducido o escala al usuario

### Checkpoints MIM (Man-in-the-Middle)

El orquestador NO DEBE avanzar de fase sin aprobación explícita del usuario.

| Regla          | Detalle                                                                            |
| -------------- | ---------------------------------------------------------------------------------- |
| Por defecto    | MIM es obligatorio en cada límite de fase                                          |
| Anulación      | El documento de handoff puede declarar `Mode: autonomous` para fases no visuales   |
| Gates visuales | Siempre MIM sin importar el modo (UX/layout/a11y requieren ojos humanos)           |
| Protocolo      | Presentar resultado → usuario aprueba/pide cambios/rechaza → sin LGTM = no avanzar |

### Progreso Solo con Evidencia

Un checkbox es una mentira hasta que se confirma con evidencia. Marcar SOLO después de: diff verificado, salida de comando verificada o aprobación MIM recibida. El estado auto-reportado por el agente ejecutor NO es evidencia.

## Modelo de Ramas

```text
task/{name} → feature/{epic} → {integration-branch} → PR to master
```

- Ramas de tarea: `task/{descriptive-name}` — una por agente/unidad de trabajo
- Ramas de épica: `feature/{epic-name}` — recopila todos los merges de tareas
- Rama de integración: squash-merge desde la rama de épica
- Sin commits directos a master ni a la rama de integración
- Tareas independientes en la misma fase → `isolation: 'worktree'` para ejecución paralela

### Sin Excepciones

No existe exención por "demasiado pequeño". Un fix de un typo de una línea sigue el mismo modelo de ramas que una épica de 50 archivos. El modelo existe para auditabilidad y seguridad de rollback, no para gestión de complejidad.

Si un agente escribe "no requiere feature branch", "fix directa", "commit directo" o cualquier variación que omita el modelo de ramas → violación de protocolo. Kill y reinicio con el modelo de ramas aplicado.

Solo una directiva explícita del usuario (ej., "haz commit directo, omite el branching") suspende esta regla. El agente DEBE repetir la anulación al usuario para confirmación antes de actuar.

### Acoplamiento con Handoff

El `{name}` en `task/{name}` DEBE coincidir con un archivo `.tmp-{name}-handoff.md` existente (o un `.tmp-*-handoff.md` que declare esa tarea). Antes de crear cualquier rama, verificar: `eza .tmp-*-handoff.md`. Si no existe archivo de handoff coincidente, la rama no puede crearse. Este es un prerrequisito duro, no una recomendación.

## Marco de Quality Gates

Cada tarea en un documento de handoff DEBE definir sus criterios de aceptación como una tabla de gates.

```markdown
| Gate | Verificación | Comando/Check | Tipo |
| ---- | ------------ | ------------- | ---- |
```

Valores de tipo:

- `EXE` — comando determinista, auto-verificable por el orquestador
- `MAN` — requiere juicio humano o inspección visual (siempre MIM)

Gates mínimos requeridos para cualquier tarea:

| Gate                  | Comando                                                                                     | Tipo |
| --------------------- | ------------------------------------------------------------------------------------------- | ---- |
| Handoff existe        | `eza .tmp-*-handoff.md` (exit 0)                                                            | EXE  |
| Lint limpio           | `pnpm test:static`                                                                          | EXE  |
| Tipos limpios         | `pnpm test:types`                                                                           | EXE  |
| Sin efectos laterales | `git diff --stat` (solo archivos esperados)                                                 | EXE  |
| Contratos verificados | Comandos de verificación del documento gobernante (si el scope incluye archivos gobernados) | EXE  |

### Archivos Gobernados por Documentación

Archivos de documentación en `docs/` PUEDEN declarar una sección "Governed Files" listando patrones de archivos que gobiernan y comandos de verificación posteriores a la modificación. Esto crea una dependencia estructural: modificar archivos gobernados sin leer el documento gobernante produce handoffs que fallan el quality gate a continuación.

Cuando el scope de un handoff incluye archivos que coinciden con un patrón gobernado:

1. **LEER** — El agente DEBE leer el documento gobernante completo antes de crear el handoff.
2. **CITAR** — El handoff DEBE incluir una sección "Verificación de Contratos" que: (a) nombre el documento gobernante y secciones relevantes, (b) cite los invariantes específicos que el cambio debe preservar, (c) declare cómo el cambio propuesto preserva cada invariante citado.
3. **VERIFICAR** — Después de la implementación, ejecutar los comandos de verificación declarados en el documento gobernante. Incluir resultados en el progress tracker del handoff.

Si el cambio viola intencionalmente un invariante documentado, el agente DEBE declarar la violación explícitamente en el handoff y obtener aprobación MIM antes de proceder.

La activación es mecánica: `git diff --name-only` contra los patrones declarados. El agente no tiene discreción sobre si el gate aplica.

### Incident Tags

Toda regla nueva agregada a este archivo requiere un incident tag — el fallo específico que la motivó. Si no puedes citar un incidente real, la regla es especulativa y no pertenece aquí.

Filtro antes de agregar una regla:

| Pregunta                                                        | Si la respuesta es... | Entonces...                           |
| --------------------------------------------------------------- | --------------------- | ------------------------------------- |
| ¿Qué fallo específico previene esta regla?                      | No puedo citar uno    | No agregar — es especulativa          |
| ¿Ese fallo ya ocurrió?                                          | No, es hipotético     | Diferir — promover solo cuando ocurra |
| ¿Se puede lograr con una assertion en el prompt de lanzamiento? | Sí                    | No globalizar — resolver en el prompt |

Las reglas existentes en este archivo están exentas (legacy). Las reglas nuevas deben cumplir este filtro sin excepción.

**Incident tags de las reglas agregadas el 2026-06-29:**

- Principio de Orquestador Puro — Incident: orquestador completó 5 ediciones directamente sin delegar; detectado por usuario como quality gate sorpresa.
- Circuit Breaker de Supervisión — Incident: propuesta original con supervisión proactiva (5 anti-patrones, umbrales) generaba ~500 tokens/delegación de overhead; reducida tras revisión de 3 expertos.
- Incident Tags — Incident: reglas especulativas agregadas sin justificación empírica; los expertos (Kim) identificaron "Process Debt by Anticipation" como anti-patrón.
- Diseño Cognitivo — Incident: handoffs densos y difíciles de escanear; principios de cognitive-doc-design del ecosistema gentle-ai seleccionados para mejorar legibilidad.
- Fix Escalamiento paso 3 — Incident: la instrucción "implementa directamente" contradecía el Principio de Orquestador Puro recién agregado.
- Archivos Gobernados por Documentación — Incident: agentes modificaron scripts, hooks y CI cumpliendo gates de proceso (handoff, lint, types) sin leer la documentación del sistema; pipeline roto en producción (post-mortem PR #6, 2026-07-02).

## Handoff

**GATE PRE-EJECUCIÓN OBLIGATORIO — EL ORQUESTADOR NO PUEDE PROCEDER SIN ESTO.**

El trabajo estructurado requiere un documento de handoff generado mediante la skill `handoff` (`/handoff {name}`). Aplica a cualquier escala: features, bugs, spikes, épicas o investigaciones. El documento vive en `.tmp-{name}-handoff.md` (raíz del repo, no se commitea). Es la única fuente de verdad para la unidad de trabajo: asignaciones de agentes, quality gates, fases de ejecución y contratos canónicos.

ALTO. Si no existe `.tmp-*-handoff.md` para el trabajo actual → estás en violación. Créalo ahora antes de proceder.

Auto-limpieza: cuando TODOS los checkboxes en el progress tracker estén marcados Y el usuario autorice, el archivo `.tmp-` se elimina.

### Modelo de Autorización (default invertido)

El orquestador opera en DOS modos. No existe una tercera opción.

**MODO SOLO-LECTURA** (por defecto — no existe `.tmp-*-handoff.md` para el trabajo actual):

El orquestador puede leer archivos, buscar código, ejecutar comandos de solo lectura y responder al usuario. NO PUEDE llamar a Edit, Write, Agent-con-permisos-de-escritura ni comandos que crean ramas. Estas capacidades no están disponibles en este modo.

**MODO EJECUCIÓN** (`.tmp-{name}-handoff.md` existe en disco):

El orquestador puede ejecutar acciones dentro del alcance del trabajo definido en el handoff. Las Task Branches del handoff definen qué archivos y ramas están dentro del alcance.

Para transicionar de SOLO-LECTURA a EJECUCIÓN: ejecutar `/handoff {name}`. Esto no es un recordatorio — es el mecanismo por el cual se otorgan permisos de escritura.

### Regla de Activación (obligatoria — sin excepciones)

Cada solicitud del usuario inicia UNA de dos vías:

**Vía A — Responder (no necesita handoff):** La respuesta COMPLETA del orquestador es un mensaje de vuelta al usuario: una explicación, diagnóstico, revisión de código o respuesta. Sin llamadas a herramientas que creen, editen, eliminen o deleguen. Sin ramas. Sin escritura de archivos. Sin lanzamiento de agentes. Si la respuesta incluye AUNQUE SEA UNA acción más allá de responder → es Vía B.

**Vía B — Actuar (handoff requerido PRIMERO):** El orquestador cambiará el estado del repo de cualquier forma — crear ramas, editar archivos, lanzar sub-agentes, ejecutar ciclos de fix-y-verificación, generar planes a archivos.

Procedimiento de Vía B (secuencial, sin omitir):

1. `eza .tmp-*-handoff.md` — ¿ya existe un handoff para este trabajo?
2. SÍ → proceder a ejecución bajo ese handoff.
3. NO → ejecutar `/handoff {name}` AHORA. No componer ninguna llamada a Edit, Write, Agent o Bash-que-muta hasta que el archivo `.tmp-{name}-handoff.md` exista en disco.

**Cumplimiento por dependencia estructural, no por auto-monitoreo:**

- El Modelo de Ramas requiere `task/{name}` donde `{name}` coincide con un handoff (ver § Acoplamiento con Handoff).
- El Marco de Quality Gates requiere la existencia del handoff como su PRIMER gate (ver tabla de gates mínimos).
- Los prompts de sub-agentes DEBEN incluir la ruta del archivo de handoff. Un sub-agente lanzado sin referencia al handoff es una violación de protocolo.

### Handoff Mínimo Viable (estructura obligatoria — sin excepciones)

"Escalar al trabajo" significa escalar la PROFUNDIDAD de las secciones, no su PRESENCIA. Un Progress Tracker de bug fix tiene 4 checkboxes; una épica tiene 60. Ambos tienen Progress Tracker.

Cada handoff, sin importar la escala, DEBE contener como mínimo:

1. **Bloque de encabezado** — Status, Branch, declaración de Artifact, regla de Auto-cleanup
2. **Menú** — Enlaces ancla a cada sección presente en el documento
3. **Back-links** — `[↑ Menú](#menú)` después de cada sección
4. **Orquestación** — Como mínimo: tabla de asignación de agentes, prohibiciones de agentes (literal de este archivo) y quality gates con tipo (EXE/MAN)
5. **Progress Tracker** — Un checkbox por quality gate por tarea, más checkboxes de MIM y MERGED. El tracker DEBE reflejar las tablas de gates 1:1.
6. **Modelo de ramas** — Nombre(s) de rama siguiendo el modelo definido en este archivo. Incluso un fix de una sola tarea recibe una rama de tarea.
7. **Fuera de Alcance** — Al menos una exclusión explícita para prevenir scope creep
8. **Diseño Cognitivo** — El contenido del handoff debe seguir estos principios: abrir con la decisión o acción (lead with the answer), progresión de happy path a detalles y edge cases (progressive disclosure), bloques semánticos cortos (chunking), y preferir tablas, checklists y templates sobre prosa narrativa (recognition over recall)
9. **Verificación de Contratos** (condicional) — Si el scope toca archivos declarados en la sección "Governed Files" de un documento gobernante: invariantes citados, declaraciones de preservación y resultados de comandos de verificación. Omitible SOLO si ningún archivo gobernado está en scope.

Secciones que PUEDEN omitirse para trabajo pequeño (bug fix, cambio de config): Arquitectura, Contratos de Interfaz Canónicos, Mapeo de Datos, Dependencias. Las secciones listadas arriba nunca son opcionales. Una tabla vacía con encabezados correctos es mejor que una sección faltante.

### Obligación de Seguimiento de Progreso (obligatorio durante ejecución)

El Progress Tracker del handoff es un documento VIVO, no un plan estático. El orquestador DEBE actualizar el archivo `.tmp-` conforme avanza la ejecución:

1. **Después de que cada gate pase**: marcar el checkbox con `[x]` y agregar evidencia en línea (ej., `- [x] Lint limpio — pnpm test:static exit 0`)
2. **Después de cada aprobación MIM**: marcar el checkbox de MIM con la respuesta del usuario
3. **Después de cada merge**: marcar el checkbox de MERGED con el SHA del merge commit
4. **En caso de fallo**: marcar el checkbox con `[!]` y agregar la razón del fallo. Diferenciar "no intentado aún" de "intentado y fallido".

**Verificación de obsolescencia**: si el orquestador ha completado 2+ tareas sin actualizar el Progress Tracker → DETENERSE. Actualizar el tracker para TODOS los ítems completados antes de proceder con nuevo trabajo. Cero checkboxes marcados después de trabajo sustantivo = tracking estancado = violación de protocolo.

### Quality Gate del Handoff (auto-verificación antes de proceder)

Después de generar el handoff, el orquestador DEBE verificar contra este checklist antes de que comience cualquier ejecución:

| Verificación              | Criterio                                                                                                    | Acción si falla        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------- |
| Bloque de encabezado      | Status, Branch, Artifact, Auto-cleanup presentes                                                            | Regenerar              |
| Menú                      | Enlaces ancla a todas las secciones del documento                                                           | Agregar menú           |
| Back-links                | Cada sección termina con `[↑ Menú](#menú)`                                                                  | Agregar enlaces        |
| Asignación de Agentes     | Tabla con nivel de modelo por agente                                                                        | Agregar tabla          |
| Prohibiciones             | Copiadas literal de este archivo, no resumidas                                                              | Reemplazar con literal |
| Quality Gates             | Tabla completa por tarea con columna de tipo EXE/MAN                                                        | Agregar gates          |
| Progress Tracker          | Checkboxes reflejan Quality Gates 1:1                                                                       | Reconciliar            |
| Modelo de ramas           | Nombres de rama y target de merge declarados                                                                | Agregar diagrama       |
| Fuera de Alcance          | Al menos una exclusión presente                                                                             | Agregar sección        |
| Diseño Cognitivo          | Cada sección abre con decisión/acción, no con párrafos narrativos; bloques de prosa no exceden 4 oraciones  | Reestructurar          |
| Verificación de Contratos | Si el scope toca archivos gobernados: sección presente con invariantes citados y resultados de verificación | Agregar sección        |

Si alguna verificación falla, corregir el handoff antes de proceder. Un handoff malformado no es "suficiente por ahora".

### Ejemplo de Referencia

El handoff de una épica previa (689 líneas) es el ejemplo canónico de un handoff bien formado. Patrones clave a replicar:

- **Back-links** — cada sección termina con `[↑ Menú](#menú)`
- **Tablas de gates por agente** — gates específicos, no genéricos, con comandos exactos de verificación
- **Reflejo 1:1 del tracker** — cada gate en Quality Gates tiene un checkbox correspondiente en Progress Tracker
- **Instrucción explícita al orquestador** — "marcar checkboxes conforme la evidencia confirme" declarado dentro del documento
- **Referencias cruzadas de riesgos** — riesgos HIGH etiquetados como `CRITICAL (RN)` en las task branches relevantes

Ante duda sobre calidad o estructura del handoff, consultar esta referencia.

### Handoffs Portables

Cuando un documento de handoff debe viajar entre repos o entre sesiones (otro agente, otro día), el prefijo `.tmp-` impide commitear porque `.tmp` está en `.gitignore`. Para estos casos, usar el prefijo `.handoff-` en su lugar.

| Tipo             | Prefijo                  | Gitignored | Commiteado                                   | Ciclo de vida                              |
| ---------------- | ------------------------ | ---------- | -------------------------------------------- | ------------------------------------------ |
| Handoff efímero  | `.tmp-{name}-handoff.md` | Sí         | Nunca                                        | Nace y muere dentro de la misma tarea      |
| Handoff portable | `.handoff-{name}.md`     | No         | Sí, cuando se necesita transferencia cruzada | Viaja con el código, se elimina en destino |

Reglas para documentos `.handoff-`:

1. Usar SOLO cuando el trabajo cruza límites (otro repo, transferencia cross-session obligatoria)
2. El agente destino lo lee, lo usa como handoff y lo elimina al completar
3. El default es siempre `.tmp-` — handoffs portables requieren autorización explícita del usuario
4. Auto-limpieza: el agente destino elimina el archivo `.handoff-` cuando el trabajo concluye
