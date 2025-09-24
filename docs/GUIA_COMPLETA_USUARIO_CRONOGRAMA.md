# 📋 **GUÍA COMPLETA: FLUJO DE GESTIÓN DE CRONOGRAMAS EN PROYECTOS**

## 🎯 **Resumen Ejecutivo**
El sistema de cronogramas funciona con **3 tipos de cronograma** en una jerarquía de **4 niveles**:
- **Proyecto** → **Cronogramas** → **Fases** → **EDTs** → **Tareas**

---

## 📊 **TIPOS DE CRONOGRAMA DISPONIBLES**

### 1. **🟦 Cronograma Comercial** (Automático)
- **¿Cuándo se crea?** Automáticamente al convertir una cotización aprobada a proyecto
- **¿Qué contiene?** EDTs basados en la estimación comercial
- **¿Para qué sirve?** Baseline de referencia, comparación con lo real
- **¿Se puede modificar?** No (es inmutable, baseline)

### 2. **🟪 Cronograma de Planificación** (Manual)
- **¿Cuándo se crea?** Manualmente por el gestor de proyecto
- **¿Qué contiene?** EDTs detallados de planificación y preparación
- **¿Para qué sirve?** Planificación detallada del proyecto
- **¿Se puede modificar?** Sí, completamente editable

### 3. **🟩 Cronograma de Ejecución** (Seguimiento)
- **¿Cuándo se crea?** Manualmente durante la ejecución
- **¿Qué contiene?** EDTs reales con seguimiento de progreso
- **¿Para qué sirve?** Seguimiento real del avance del proyecto
- **¿Se puede modificar?** Sí, se actualiza con el progreso real

---

## 🚀 **FLUJO COMPLETO DE USO**

### **PASO 1: Ver el Cronograma Comercial (Automático)**

1. **Ir al proyecto**: `http://localhost:3000/proyectos/[ID]/cronograma`
2. **Hacer clic en el TAB "Tipos"** (icono de configuración)
3. **Ver el cronograma comercial**:
   - Aparece automáticamente como "Cronograma comercial Activo" (solo informativo)
   - Muestra "Comercial" con badge azul
   - Contiene EDTs copiados de la cotización
   - **Nota**: Esta tarjeta es solo informativa, no se puede hacer clic en ella

### **PASO 2: Crear Cronograma de Planificación**

#### **Opción A: Usando "Nuevo Cronograma" (recomendado)**
1. **En el TAB "Tipos"**, hacer clic en **"Nuevo Cronograma"**
2. **Configurar**:
   - **Tipo**: "Planificación"
   - **Nombre**: "Cronograma de Planificación v1"
   - **Copiar desde**: Seleccionar "Cronograma Comercial" o "Crear desde cero"
3. **Hacer clic en "Crear Cronograma"**

#### **Opción B: Usando botones de cada tipo**
1. **En la tarjeta "Planificación"**, hacer clic en **"+ Crear"**
2. **Configurar nombre** (se preselecciona el tipo "Planificación")
3. **Opcional**: Hacer clic en **"Copiar"** para copiar del comercial existente

#### **Opción C: Seleccionar cronograma existente**
1. **En cualquier tarjeta de tipo**, hacer clic en el **nombre del cronograma**
2. **El cronograma se resalta con borde azul** (visual feedback)
3. **Los otros tabs** (Fases, Lista EDTs, etc.) **se actualizan automáticamente**
4. **Nota**: El cambio no es visible en el TAB "Tipos" mismo, pero afecta los otros tabs

### **PASO 3: Gestionar Fases del Cronograma**

1. **Ir al TAB "Fases"** (icono de carpeta)
2. **Crear fases por defecto** (recomendado):
   - Hacer clic en **"Crear Fases por Defecto"**
   - Se crean: Planificación, Ejecución, Cierre
3. **O crear fases manualmente**:
   - Hacer clic en **"Nuevo EDT"** → Se crean fases automáticamente

### **PASO 4: Crear EDTs (Estructura de Desglose de Trabajo)**

1. **Ir al TAB "Lista EDTs"** (icono de calendario)
2. **Hacer clic en "Nuevo EDT"**
3. **Configurar EDT**:
   - **Nombre**: Descripción del EDT
   - **Categoría de Servicio**: Área de trabajo
   - **Zona**: Ubicación específica
   - **Fase**: Asignar a una fase existente
   - **Fechas**: Planificadas
   - **Horas**: Estimadas
   - **Responsable**: Persona asignada

### **PASO 5: Crear Tareas Ejecutables**

1. **En cada EDT**, hacer clic en **"Agregar Tarea"**
2. **Configurar tarea**:
   - **Nombre**: Actividad específica
   - **Descripción**: Detalles de la tarea
   - **Fechas**: Inicio y fin planificadas
   - **Horas estimadas**: Tiempo requerido
   - **Prioridad**: Baja, Media, Alta, Crítica
   - **Responsable**: Persona asignada

### **PASO 6: Llenar Horas Reales (Ejecución)**

#### **Opción A: Registro Manual de Horas**
1. **Ir al módulo "Registro de Horas"** (fuera del cronograma)
2. **Crear registro**:
   - **Proyecto**: Seleccionar proyecto
   - **Servicio**: Seleccionar servicio del proyecto
   - **Categoría**: Área de trabajo
   - **Recurso**: Persona que trabajó
   - **Fecha**: Día del trabajo
   - **Horas**: Tiempo real trabajado
   - **Descripción**: Detalles del trabajo

#### **Opción B: Desde el Cronograma de Ejecución**
1. **Crear "Cronograma de Ejecución"** (tipo "ejecucion")
2. **Copiar desde "Cronograma de Planificación"**
3. **Actualizar progreso**:
   - Cambiar fechas reales
   - Actualizar porcentaje de avance
   - Agregar horas reales desde registros

---

## 📈 **FLUJO RECOMENDADO POR FASES DEL PROYECTO**

### **FASE 1: Planificación (Semanas 1-2)**
```
Cotización → Proyecto (Cronograma Comercial automático)
    ↓
Crear Cronograma de Planificación
    ↓
Crear Fases (Planificación, Ejecución, Cierre)
    ↓
Crear EDTs detallados
    ↓
Crear tareas ejecutables
```

### **FASE 2: Ejecución (Durante el proyecto)**
```
Registro diario de horas trabajadas
    ↓
Actualizar progreso de EDTs
    ↓
Crear Cronograma de Ejecución
    ↓
Comparar Plan vs Real
```

### **FASE 3: Seguimiento y Control**
```
Revisar desviaciones (Plan vs Real)
    ↓
Ajustar cronograma según necesidad
    ↓
Reportar progreso a stakeholders
```

---

## 🎛️ **INTERFACES Y FUNCIONALIDADES**

### **TAB "Tipos" (Gestión de Cronogramas)**
- ✅ Ver cronograma activo
- ✅ Crear nuevos cronogramas
- ✅ Copiar entre cronogramas
- ✅ Cambiar cronograma activo

### **TAB "Fases" (Estructura del Proyecto)**
- ✅ Ver fases del proyecto
- ✅ Crear fases por defecto
- ✅ Gestionar fases manualmente

### **TAB "Lista EDTs" (Trabajo Detallado)**
- ✅ Ver EDTs agrupados por fases
- ✅ Crear nuevos EDTs
- ✅ Editar EDTs existentes
- ✅ Ver progreso y métricas

### **TAB "Vista Gantt" (Visualización)**
- 📋 **Pendiente**: Vista gráfica del cronograma
- 📋 **Próximamente**: Diagrama de Gantt interactivo

### **TAB "Métricas" (Análisis)**
- ✅ Ver KPIs del proyecto
- ✅ Análisis de progreso
- ✅ Comparativas entre cronogramas

### **TAB "Filtros" (Búsqueda Avanzada)**
- 📋 **Pendiente**: Filtros por responsable, fase, estado
- 📋 **Próximamente**: Búsqueda y filtrado avanzado

---

## 🔄 **CONVERSIONES AUTOMÁTICAS**

### **Cotización → Proyecto**
```
Cotización con EDTs → Proyecto con Cronograma Comercial
    - Fases comerciales → Fases de proyecto
    - EDTs comerciales → EDTs de proyecto
    - Tareas comerciales → Tareas ejecutables
    - Horas estimadas → Horas planificadas
```

### **Planificación → Ejecución**
```
Cronograma de Planificación → Cronograma de Ejecución
    - Copia completa de estructura
    - Fechas plan → Fechas reales
    - Horas estimadas → Horas reales (desde registros)
    - Progreso 0% → Progreso actual
```

---

## 📊 **REPORTES Y ANÁLISIS**

### **Métricas Disponibles**
- **Progreso general**: % completado del proyecto
- **Horas plan vs real**: Comparativa de tiempo
- **Eficiencia**: Horas reales vs estimadas
- **Productividad**: Horas por responsable
- **Desviaciones**: Diferencias entre cronogramas

### **Estados de EDTs**
- `planificado`: EDT creado, sin iniciar
- `en_progreso`: EDT en ejecución
- `detenido`: EDT pausado temporalmente
- `completado`: EDT terminado
- `cancelado`: EDT cancelado

### **Estados de Tareas**
- `pendiente`: Tarea por iniciar
- `en_progreso`: Tarea en ejecución
- `completada`: Tarea terminada
- `pausada`: Tarea temporalmente detenida
- `cancelada`: Tarea cancelada

---

## 🚨 **NOTAS IMPORTANTES**

### **Cronograma Comercial (Baseline)**
- **No se puede modificar** una vez creado
- Sirve como **referencia histórica**
- Se usa para **comparar con lo real**

### **Múltiples Cronogramas**
- Un proyecto puede tener **varios cronogramas** de cada tipo
- Solo **uno activo** por tipo
- Se pueden **copiar** entre sí

### **Jerarquía Obligatoria**
- **Proyecto** → **Cronograma** → **Fase** → **EDT** → **Tarea**
- No se pueden crear EDTs sin fase asignada
- No se pueden crear tareas sin EDT asignado

### **Integración con Registros de Horas**
- Las horas reales vienen de **registros de horas** externos
- Se pueden **asociar** a EDTs y tareas específicas
- Se calculan **automáticamente** para métricas

---

## 🎯 **SIGUIENTE PASOS RECOMENDADOS**

1. **Verificar cronograma comercial** creado automáticamente
2. **Crear cronograma de planificación** copiando del comercial
3. **Crear fases por defecto** para estructura
4. **Agregar EDTs detallados** según alcance real
5. **Crear tareas ejecutables** para cada EDT
6. **Comenzar registro de horas** durante ejecución
7. **Crear cronograma de ejecución** para seguimiento real

---

## 📞 **SOPORTE Y PREGUNTAS FRECUENTES**

### **¿Por qué no veo el cronograma comercial?**
- Verifica que el proyecto fue creado desde una cotización aprobada
- Revisa que la cotización tenía EDTs definidos
- Consulta los logs del servidor para errores de conversión

### **¿Cómo copiar un cronograma?**
1. Ir al TAB "Tipos"
2. Hacer clic en "Nuevo Cronograma"
3. Seleccionar "Copiar desde" y elegir el origen
4. Dar un nombre descriptivo

### **¿Las horas se actualizan automáticamente?**
- No, las horas reales deben registrarse manualmente
- El sistema calcula automáticamente métricas basadas en registros
- Los porcentajes de avance se actualizan manualmente

### **¿Por qué el "Cronograma Activo" no se puede hacer clic?**
- La tarjeta "Cronograma Activo" es **solo informativa**
- Muestra cuál cronograma está actualmente seleccionado
- Para cambiar de cronograma, haz clic en los nombres individuales en las tarjetas de cada tipo
- Para crear nuevos cronogramas, usa los botones "+ Crear" o "Copiar" en cada tipo

### **¿Qué pasa cuando selecciono un cronograma?**
- **Visual**: El cronograma seleccionado se resalta con **borde azul**
- **Funcional**: Los otros tabs (Fases, Lista EDTs, Métricas) muestran datos de ese cronograma
- **Estado**: Se guarda cuál cronograma está activo para toda la sesión
- **Nota**: El cambio es más visible en los otros tabs, no en "Tipos"

### **¿Puedo tener múltiples versiones de un cronograma?**
- Sí, puedes crear múltiples cronogramas de cada tipo
- Cada uno tiene su propio nombre y versión
- Solo uno puede estar "activo" por tipo

---

**📅 Última actualización:** 23 de septiembre de 2025
**👨‍💻 Autor:** Sistema de IA Mejorado
**📋 Versión:** 1.0.0