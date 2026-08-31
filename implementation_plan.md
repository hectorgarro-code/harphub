# Sistema de Learning Paths y Motor de Continuidad de Estudio

Este plan de implementación aborda la creación de un sistema de aprendizaje estructurado (Learning Paths) y un motor inteligente de continuidad de estudio (Smart Reminders) para HarpHub, con el objetivo de organizar el aprendizaje y evitar el abandono.

## Arquitectura de Base de Datos (Nuevas Tablas)

Se crearán las siguientes tablas en la base de datos (y se actualizará `api_harphub.php` para su autoinstalación):

1. **`learning_paths`**: `id`, `creator_id`, `original_creator_id`, `parent_path_id`, `title`, `description`, `cover_image`, `instrument`, `genres`, `difficulty`, `estimated_duration`, `visibility`, `remix_permission`, `created_at`, `updated_at`.
2. **`learning_path_nodes`**: `id`, `path_id`, `entity_type` (lesson, collection, practice, review, milestone, checkpoint), `entity_id` (ID referenciado), `order_index`, `is_required`.
3. **`learning_path_progress`**: `id`, `user_id`, `path_id`, `current_node_id`, `completed_nodes_json`, `mastery`, `started_at`, `completed_at`, `last_activity_at`.
4. **`user_learning_reminders`**: `id`, `user_id`, `entity_type` (lesson, path, practice, review), `entity_id`, `reminder_type`, `status` (active, snoozed, dismissed, archived), `snoozed_until`, `created_at`, `updated_at`.
5. ***(Extensiones de Feedback)***: Utilizaremos tablas existentes o feed unificado para reportar eventos como `path_started`, `path_completed`, etc.

## User Review Required

> [!WARNING]
> **Gestión del Cron/Background Job para Reminders**
> Dado que estamos utilizando PHP/MySQL estándar (sin demonios de Node.js en background), la "Detección Inteligente" se ejecutará *on the fly* (al vuelo) cuando el usuario inicie sesión o cargue su dashboard. Esto significa que calcularemos los "abandonos" comparando fechas de la base de datos de manera dinámica. ¿Estás de acuerdo con este enfoque pasivo (pull) en lugar de un enfoque activo (push/cron jobs)?

> [!IMPORTANT]
> **Learning Path Visualization**
> Para lograr el estilo "roadmap.sh" o "Linear progress", implementaremos un componente de lienzo/grafo vertical en `PathDetailsPage`. ¿Deseas que los nodos se puedan saltar (free-flow) o que tengan un bloqueo estricto (strict progression) hasta completar el nodo anterior?

## Open Questions

1. **Continue Panel Placement**: ¿El panel de "Continuar Aprendiendo" debe ser la primera sección en la página de inicio (Library/Feed) o prefieres una vista (tab) dedicada exclusivamente a esto?
2. **Reminders UI**: ¿Los recordatorios deben aparecer como notificaciones flotantes (toasts) no intrusivas en la parte inferior, o como "Tarjetas" dentro del panel "Continuar Aprendiendo"?
3. **Fork System**: Cuando un usuario hace fork de un path, ¿hace fork de *todas* las lessons internas, o solo crea un nuevo roadmap que enlaza a las lessons originales?

## Proposed Changes

### Database Layer
- **[NEW]** `migrations/learning_paths.sql`: Script de esquema.
- **[MODIFY]** `backend/api_harphub.php`: Agregar endpoints CRUD para paths (`get_paths`, `get_path_details`, `start_path`, `update_path_progress`) y el motor de reminders (`get_smart_reminders`, `update_reminder_status`). También incluir la autogeneración de estas tablas.

### State & Hooks
- **[NEW]** `src/hooks/useLearningPath.js`: Hook para manejar la navegación entre nodos, guardar progreso y saltar al siguiente checkpoint.
- **[NEW]** `src/hooks/useReminders.js`: Polling o carga inicial del motor de detección inteligente.

### Components Layer
- **[NEW]** `src/components/learning/ContinueLearningPanel.jsx`: El panel principal (dashboard) que muestra la última lesson/path y tiempo estimado.
- **[NEW]** `src/components/learning/PathNodeGraph.jsx`: Renderizador visual del roadmap estilo Duolingo/Linear.
- **[NEW]** `src/components/social/SmartReminderMenu.jsx`: El menú minimalista para posponer/archivar/continuar (acciones de reminder).

### Views / Pages
- **[NEW]** `src/pages/LearningPathsPage.jsx`: Descubrimiento de paths (Featured, Beginner, Trending).
- **[NEW]** `src/pages/PathDetailsPage.jsx`: La vista profunda del roadmap donde se visualizan los nodos y progreso.

## Verification Plan

### Manual Verification
1. Crear un **Learning Path** con nodos mixtos (1 lección, 1 práctica, 1 checkpoint).
2. Comenzar el path y verificar que el progreso se guarde en `learning_path_progress`.
3. Abandonar la lección, avanzar el reloj de desarrollo y verificar que el sistema genere un `user_learning_reminder` de tipo "abandono/retomar".
4. Hacer click en "Continuar Ahora" en el reminder y verificar que el workspace se rehidrate con la información correcta.
5. Usar el "Snooze" y verificar que el reminder desaparezca hasta la fecha indicada.
