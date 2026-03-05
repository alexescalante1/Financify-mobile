Documento de Idea y Requerimientos
Aplicación de Gestión Financiera Personal (PFM)

Versión: 1.0 (Completa)
Estado: Definición lista para diseño/desarrollo
Propietario del producto: Usuario (uso personal)
Propósito del documento: Describir de forma profesional, detallada y verificable la idea, alcance, módulos, reglas y criterios de aceptación del sistema.

1) Resumen ejecutivo

Se desarrollará una aplicación de gestión financiera personal orientada al uso individual, cuyo objetivo es permitir al usuario:

registrar ingresos y gastos con clasificación por categorías,

regularizar periodos pasados con movimientos no registrados,

administrar múltiples billeteras/cuentas para conocer dónde está su dinero,

planificar gastos futuros mediante presupuestos y gastos planificados,

analizar el comportamiento financiero con métricas y visualizaciones,

proyectar su saldo y liquidez a futuro,

detectar patrones y generar insights/alertas para mejorar hábitos.

La aplicación no será una contabilidad compleja; será una herramienta práctica de control, visualización y proyección financiera, enfocada en decisiones.

2) Objetivos del producto
2.1 Objetivo general

Brindar una herramienta personal para visualizar, controlar, planificar y proyectar las finanzas del usuario, ayudándolo a regular su situación económica e identificar patrones de comportamiento que expliquen en qué y cuándo se le va el dinero.

2.2 Objetivos específicos

Registrar y consultar ingresos, gastos, regularizaciones y transferencias con trazabilidad.

Organizar movimientos por categorías y subcategorías (predefinidas + personalizadas).

Mantener visión real del dinero mediante billeteras/cuentas y sus saldos.

Permitir planificación mediante presupuestos por periodo o por fecha objetivo con lista de gastos planificados.

Estimar liquidez futura a una fecha (fin de mes / fecha objetivo) con supuestos visibles.

Proveer dashboards y reportes para:

gasto por categoría,

evolución por día/mes,

top gastos,

comparativos y tendencias.

Detectar anomalías y hábitos, y generar alertas e insights accionables.

3) Alcance del sistema
3.1 Incluye (In Scope)

Movimientos: gasto, ingreso, regularización de gasto por periodo, transferencia entre billeteras.

Gestión de billeteras/cuentas y saldos.

Categorías: predefinidas + personalizadas (con subcategorías), activación/desactivación.

Presupuestos:

por periodo (semanal/mensual/personalizado)

por fecha objetivo (evento)

lista de gastos planificados (items) y su ejecución

impacto en liquidez futura

Proyecciones:

por fecha

horizontes 1/3/6/12 meses

escenarios “qué pasa si…”

Analítica y visualización: gráficos, métricas, filtros, rankings.

Metas de ahorro y fondo de emergencia recomendado.

Alertas e insights basados en comportamiento.

3.2 No incluye (Out of Scope por ahora)

Sincronización automática bancaria (Open Banking).

Multiusuario / finanzas familiares.

Contabilidad empresarial o tributación.

Inversiones avanzadas integradas con mercado en tiempo real.

Gestión completa de deuda con tablas de amortización multi-crédito (posible v2).

4) Glosario y definiciones

Movimiento (Transaction): Registro de entrada/salida/traslado de dinero.

Gasto: salida de dinero desde una billetera hacia una categoría.

Ingreso: entrada de dinero hacia una billetera desde una fuente.

Regularización: gasto agregado de un periodo pasado (inicio-fin) con nota explicativa.

Transferencia: traslado de dinero entre billeteras sin ser ingreso ni gasto.

Billetera: lugar donde está el dinero (efectivo, banco, Yape, tarjeta, ahorro).

Categoría: clasificación del movimiento (alimentación, transporte, etc.).

Presupuesto: plan financiero con vigencia (periodo o fecha) + límites + lista de items previstos.

Gasto planificado (Planned Item): gasto futuro probable con monto, fecha estimada, categoría y estado.

Liquidez futura estimada: saldo proyectado a una fecha considerando compromisos planificados/recurrentes.

Insight: hallazgo automático sobre patrones o desviaciones.

5) Principios del producto

Registro rápido: el usuario debe poder registrar un gasto en ≤ 3 pasos.

Flexibilidad realista: permitir regularizar periodos sin registro.

Visión completa: billeteras muestran “dónde está el dinero”.

Planificación: presupuestos e items futuros reflejan compromisos y liquidez futura.

Visualización clara: dashboards explican sin “contabilidad pesada”.

Insights accionables: no solo números; hallazgos y alertas que ayuden a corregir.

6) Personas y casos de uso
6.1 Persona principal (uso personal)

Usuario individual que busca orden económico, control de gastos, planificación y proyección de saldos.

6.2 Casos de uso principales

Registrar gasto inmediato.

Registrar ingreso.

Regularizar gastos de varios días con una nota.

Transferir dinero entre billeteras.

Crear presupuesto mensual por categorías.

Crear presupuesto por fecha objetivo (evento) con lista de items.

Marcar items como ejecutados y vincularlos a gastos reales.

Ver dashboards mensuales: categorías, evolución, top gastos.

Proyectar saldo a 1/3/6/12 meses.

Simular reducción de una categoría y ver impacto anual.

Configurar metas de ahorro y fondo de emergencia.

Recibir alertas por exceso de presupuesto o déficit proyectado.

7) Requerimientos funcionales (FR) + Criterios de aceptación

Notación: FR-XX.
Cada requerimiento es verificable por QA.

7.1 Módulo: Billeteras / Cuentas
FR-01 Crear billetera

Descripción: El usuario podrá crear billeteras con saldo inicial.
Campos: nombre (obligatorio), tipo (obligatorio), moneda (obligatorio), saldo inicial (>=0), nota opcional.

Criterios de aceptación

No permite guardar con nombre vacío.

Muestra la billetera en selector de registro.

Saldo inicial se refleja en dashboard y cálculos.

FR-02 Editar/archivar billetera

Descripción: Se permite editar nombre y tipo; archivar sin borrar historial.

Criterios de aceptación

No se elimina billetera con movimientos; solo se archiva.

Billeteras archivadas no aparecen por defecto en registro, pero sí en reportes (si se activa “incluir archivadas”).

FR-03 Vista de saldos consolidada

Descripción: Mostrar saldos por billetera y total consolidado.

Criterios de aceptación

Muestra total consolidado.

Permite filtro por moneda (si aplica).

El saldo coincide con movimientos activos (excluye anulados).

7.2 Módulo: Categorías y subcategorías
FR-04 Categorías predefinidas (primer uso)

Descripción: El sistema incluirá categorías base para operar sin configuración inicial.

Criterios de aceptación

Al iniciar, existen categorías de gastos e ingresos.

Categorías se separan por tipo (gasto/ingreso).

FR-05 Crear/editar categorías personalizadas

Descripción: El usuario podrá crear categorías y subcategorías.

Criterios de aceptación

Permite crear con nombre y tipo.

Permite definir parentId para subcategoría.

Evita duplicados exactos dentro del mismo tipo (configurable; por defecto: advertir).

FR-06 Activar/desactivar categorías

Descripción: Desactivar categorías sin perder historial.

Criterios de aceptación

Categorías desactivadas no aparecen por defecto al registrar.

Movimientos históricos mantienen categoría asignada.

7.3 Módulo: Movimientos (ingresos, gastos, regularización, transferencias)
FR-07 Registrar gasto

Campos mínimos: monto (>0), fecha (default hoy), billetera origen, categoría, nota opcional, etiquetas opcionales.

Criterios de aceptación

Al guardar, reduce saldo de billetera.

Aparece en historial y dashboards.

Validación: monto > 0.

FR-08 Registrar ingreso

Campos mínimos: monto (>0), fecha, billetera destino, categoría ingreso, nota opcional.

Criterios de aceptación

Incrementa saldo de billetera.

Aparece en historial y dashboards.

FR-09 Regularización de gasto por periodo

Descripción: Registrar gasto agregado entre fecha_inicio y fecha_fin.

Campos: fecha_inicio, fecha_fin, monto_total (>0), billetera, categoría, nota (recomendada/obligatoria configurable), modo:

“un solo movimiento” (por defecto en fecha_fin)

“distribuir por día” (divide entre días del rango)

Criterios de aceptación

No permite fecha_fin < fecha_inicio.

Descuenta monto_total de billetera (una sola vez).

En modo distribuir:

genera desglose visible por día (interno o múltiples movimientos asociados).

Se identifica como “regularización” en historial.

FR-10 Editar movimiento

Descripción: Editar monto/fecha/categoría/billetera con consistencia.

Criterios de aceptación

Ajusta saldos correctamente (reversa + aplica nuevo).

Se mantiene trazabilidad de actualización (updatedAt).

FR-11 Anular movimiento

Descripción: Anular sin borrar, para conservar auditoría.

Criterios de aceptación

Movimiento anulado no afecta saldos ni dashboards.

Permite ver/anotar motivo de anulación (opcional).

FR-12 Transferencia entre billeteras

Campos: billetera origen, billetera destino, monto (>0), fecha, nota.

Criterios de aceptación

Reduce origen e incrementa destino.

No se contabiliza como ingreso/gasto en analítica.

Se ve en historial como “transferencia”.

7.4 Módulo: Presupuestos y Gastos Planificados (CLAVE)
FR-13 Crear presupuesto

Tipos:

Presupuesto periódico: semanal/mensual/personalizado (startDate/endDate).

Presupuesto por fecha objetivo: targetDate.

Campos obligatorios: nombre, tipo, moneda, alcance (todas las billeteras o billetera específica), vigencia (periodo o fecha objetivo).

Opcionales: monto total cap, límites por categoría, nota.

Criterios de aceptación

No permite guardar sin nombre y sin vigencia.

Aparece en lista de presupuestos activos.

Permite definir si afecta “todas las billeteras” o una.

FR-14 Agregar gastos planificados (items) al presupuesto

Cada item planificado incluye:

título (obligatorio)

monto estimado (>0)

categoría (obligatorio)

fecha estimada (obligatoria si presupuesto es por fecha objetivo)

opcional: detalle, prioridad, etiquetas, billetera prevista, subcategoría

Estados: planificado / pagado / cancelado.

Criterios de aceptación

Permite editar/eliminar items.

Cancelado no cuenta para totals ni proyección.

Pagado cuenta como ejecutado.

FR-15 Vincular item planificado con gasto real

Descripción: Convertir planificación en ejecución real.

Criterios de aceptación

Permite asociar un gasto real existente (TransactionID).

Registra diferencia entre estimado vs real (desviación).

Permite “crear gasto real desde item” (opcional v1, recomendado).

FR-16 Seguimiento del presupuesto

Debe mostrar:

total planificado (suma de items activos)

total pagado/ejecutado

restante

porcentaje avance

desviación (real vs estimado)

estado del presupuesto (activo/finalizado/archivado)

Criterios de aceptación

Totales se actualizan al modificar items o vincular gastos.

Los gastos reales vinculados se reflejan correctamente.

FR-17 Presupuesto por categoría (límites)

Descripción: Definir cap por categoría dentro del presupuesto.

Criterios de aceptación

Muestra gastado vs límite por categoría.

Permite elegir cálculo:

basado en gastos reales,

basado en planificado,

combinado (por defecto: combinado para planificación).

FR-18 Impacto en liquidez futura (función principal)

Descripción: Calcular “liquidez estimada” a la fecha objetivo/fin de periodo.

Liquidez estimada (conceptual):
Saldo actual + ingresos esperados − gastos planificados − gastos recurrentes esperados

Configuraciones del usuario (switches):

incluir ingresos esperados (sí/no)

incluir gastos recurrentes (sí/no)

usar promedios históricos para estimaciones (sí/no)

Criterios de aceptación

Muestra tarjeta: “Liquidez estimada al DD/MM/YYYY”.

Expone supuestos usados (ej. promedios).

Si liquidez proyectada < 0, muestra déficit y lo resalta.

FR-19 Alertas del presupuesto

Alertas:

80% y 100% de cap total o por categoría

déficit proyectado para la fecha objetivo

ítem importante próximo a vencer (alta prioridad)

Criterios de aceptación

Configurable por el usuario (activar/desactivar).

Umbrales configurables.

7.5 Módulo: Proyecciones y escenarios
FR-20 Proyección a una fecha

Descripción: Seleccionar fecha futura y estimar saldo.

Criterios de aceptación

Permite elegir:

billetera específica o total,

incluir presupuestos sí/no,

incluir recurrentes sí/no.

Muestra supuestos (promedios).

FR-21 Proyección por horizonte (1/3/6/12 meses)

Descripción: Mostrar saldos estimados a horizontes predefinidos.

Criterios de aceptación

Muestra tabla de horizontes.

Indica promedio mensual de ingresos y gastos.

FR-22 Escenarios “qué pasa si…”

Descripción: Simular:

reducir categoría en X,

eliminar gasto recurrente,

agregar ingreso adicional.

Criterios de aceptación

No modifica datos reales.

Muestra diferencia mensual/anual y saldo final.

7.6 Módulo: Analítica, reportes y visualización
FR-23 Historial con filtros avanzados

Filtros: rango fechas, billetera, categoría/subcategoría, tipo movimiento, etiquetas, búsqueda por nota.

Criterios de aceptación

Filtros combinables.

Respuesta ágil en rango típico (12 meses).

FR-24 Dashboard: gasto por categoría

Descripción: Gráfico con distribución por categoría.

Criterios de aceptación

Permite seleccionar periodo (mes/rango).

Muestra % y monto total por categoría.

FR-25 Dashboard: evolución temporal

Descripción: Gráfico:

gastos diarios (vista mensual),

gastos mensuales (vista anual),

ingresos vs gastos.

Criterios de aceptación

Permite elegir granularidad (día/mes).

Permite comparar periodos (mes actual vs anterior).

FR-26 Dashboard: “dónde se va el dinero”

Descripción: Ranking de top categorías/subcategorías y/o top comercios (si se registra) por monto.

Criterios de aceptación

Ordena por monto y muestra %.

Permite drill-down al detalle de movimientos.

7.7 Módulo: Metas, fondo de emergencia e indicadores
FR-27 Metas de ahorro

Campos: nombre, monto objetivo, fecha objetivo, billetera destino (opcional), aporte sugerido.

Criterios de aceptación

Calcula aporte mensual/semanal necesario.

Muestra progreso y proyección de cumplimiento.

FR-28 Fondo de emergencia recomendado

Descripción: Recomendar 3/6/12 meses del gasto promedio mensual.

Criterios de aceptación

Usuario elige multiplicador (3/6/12).

Muestra recomendación y avance (si billetera ahorro asociada).

FR-29 Indicadores financieros personales

Mínimos:

tasa de ahorro = (ingresos − gastos) / ingresos

ratio de liquidez = (ahorros disponibles) / (gasto mensual promedio)

health score interno (reglas simples y ajustables)

Criterios de aceptación

Se recalculan con nuevos movimientos.

Muestran explicación clara y accionable.

7.8 Módulo: Insights y alertas de comportamiento
FR-30 Insights automáticos

Ejemplos:

incremento significativo en categoría vs promedio,

gasto concentrado en fines de semana,

tendencia creciente por 3 periodos,

“fuga” recurrente pequeña (muchos gastos pequeños suman alto).

Criterios de aceptación

Cada insight debe mostrar comparación numérica (antes vs ahora).

Umbral configurable para evitar ruido.

FR-31 Alertas generales

Ejemplos:

saldo bajo,

déficit proyectado,

presupuesto excedido,

gasto atípico.

Criterios de aceptación

Configurable por tipo.

No intrusivo: resumen + detalle.

8) Reglas de negocio (BR)

BR-01: Un gasto reduce saldo de billetera origen.
BR-02: Un ingreso incrementa saldo de billetera destino.
BR-03: Transferencias no cuentan como ingreso/gasto en analítica.
BR-04: Regularización descuenta monto total una vez y se etiqueta como regularización (con desglose opcional).
BR-05: Movimientos anulados no afectan saldo ni reportes.
BR-06: Presupuestos pueden calcularse por real/planificado/combinado.
BR-07: Liquidez futura estimada considera compromisos planificados/recurrentes según switches del usuario.
BR-08: Categorías desactivadas no se usan para registrar, pero se mantienen en historial.
BR-09: Si un item planificado se vincula a gasto real con monto distinto, se registra desviación.
BR-10: Si el presupuesto es por billetera específica, toda proyección y liquidez se calcula sobre esa billetera.

9) Requerimientos no funcionales (NFR)

NFR-01 Usabilidad: registrar gasto en ≤ 3 pasos; vista clara.
NFR-02 Rendimiento: historial/reportes < 1s en rangos típicos (12 meses).
NFR-03 Consistencia: saldos consistentes ante edición/anulación; recalculo disponible.
NFR-04 Privacidad: datos personales; preferible cifrado local y control de backup.
NFR-05 Trazabilidad mínima: cambios importantes preservan updatedAt y estado.
NFR-06 Disponibilidad offline (recomendado): funcionamiento sin internet.

10) Criterios de éxito (Product Success)

La app se considera valiosa si permite al usuario:

Saber “en qué se va el dinero” en < 30 segundos.

Mantener un presupuesto mensual y detectar desviaciones (alertas).

Planificar un evento y saber liquidez estimada en la fecha objetivo.

Proyectar saldo a 1/3/6 meses con supuestos claros.

Identificar al menos 1–3 patrones relevantes por mes (insights).

11) Modelo conceptual de datos (entidades)
Wallet

id, name, type, currency, balance, isArchived, createdAt, updatedAt

Category

id, name, type (income|expense), parentId?, isActive, createdAt, updatedAt

Transaction

id

type (income|expense|transfer|regularization)

amount, currency

date

walletOriginId? / walletDestId?

categoryId?

note?

tags[]

status (active|voided)

createdAt, updatedAt

Budget

id

name

type (periodic|target_date)

currency

scope (all_wallets|wallet_id)

startDate? endDate?

targetDate?

totalCap?

categoryCaps[] (categoryId + capAmount)?

note?

status (active|archived|closed)

createdAt, updatedAt

PlannedExpenseItem

id

budgetId

title

description?

amountEstimated

amountActual?

categoryId

plannedDate

walletId?

priority (low|medium|high)

status (planned|paid|canceled)

linkedTransactionId?

createdAt, updatedAt

Goal

id, name, targetAmount, currentAmount, targetDate, walletId?, status, createdAt, updatedAt

12) Pantallas (alcance UI sugerido)

Dashboard: saldos, resumen, gastos del mes, insights, alertas.

Registrar: gasto / ingreso / transferencia / regularización (modo rápido).

Historial: lista + filtros + edición/anulación.

Billeteras: lista, saldos, crear/editar/archivar.

Categorías: predefinidas + custom, activar/desactivar.

Presupuestos: crear, lista, detalle (items, caps, liquidez estimada).

Proyecciones: fecha, horizontes 1/3/6/12, escenarios.

Metas: metas y fondo de emergencia.

Reportes: gráficos por categoría/tiempo/top gastos.

Configuración: moneda, umbrales de alertas, supuestos, backups.

13) Recomendaciones de valor añadido (para tu objetivo personal)

Estas funciones no son “lujo”; son las que te ayudan a cambiar comportamiento:

Recurrentes (v1 o v1.1): suscripciones/alquiler/servicios para proyección real.

Microgastos: detector de “muchos gastos pequeños” que suman alto.

Modo “semana crítica”: vista de saldo diario proyectado (flujo de caja).

Notas inteligentes: obligar nota en regularización para contexto real.

Insights explicables: cada insight debe decir “por qué” y “qué hacer”.

14) Definition of Done (DoD) del producto v1

El v1 está completo cuando el usuario puede:

Registrar ingresos/gastos/transferencias/regularizaciones.

Administrar billeteras y categorías.

Crear presupuestos por periodo y por fecha objetivo con lista de items.

Vincular items planificados con gastos reales y ver desviación.

Ver liquidez futura estimada a fin de periodo o fecha objetivo.

Ver dashboards básicos (categoría, evolución, top gastos).

Ver proyecciones (1/3/6/12 meses y por fecha).

Configurar y recibir alertas e insights.