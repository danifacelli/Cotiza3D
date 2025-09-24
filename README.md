# Cotiza3D - Calculadora de Costos para Impresión 3D

## ¿Cuál es el motivo del proyecto?

Cotiza3D es una aplicación web diseñada para ayudar a entusiastas y profesionales de la impresión 3D a calcular de manera precisa y sencilla los costos de sus trabajos. El objetivo principal es desglosar todos los factores que influyen en el precio final de una pieza impresa, permitiendo generar presupuestos justos, rentables y profesionales.

La aplicación resuelve la complejidad de tener que calcular manually costos variables como el desgaste de la máquina, el consumo de energía según la tarifa eléctrica, y la mano de obra, centralizando todo en una interfaz intuitiva y fácil de usar.

## Funcionalidades Principales

Esta herramienta ha sido construida para ser un completo centro de operaciones para la gestión de costos de impresión 3D. A continuación se detallan sus características:

### 1. Dashboard Interactivo
- **Visión General:** Ofrece un panel de control con métricas clave para entender rápidamente el estado de tu negocio.
- **Métricas Relevantes:** Muestra ingresos totales, ganancia neta (basada en presupuestos aceptados), número de presupuestos aceptados y pendientes.
- **Guía de Inicio Rápido:** Incluye una lista de pasos recomendados para que los nuevos usuarios configuren la aplicación correctamente.

### 2. Gestión de Presupuestos
- **Creación y Edición:** Permite crear presupuestos detallados, especificando el cliente, los materiales, tiempos de impresión, costos de diseño y más.
- **Estados de Presupuesto:** Cada presupuesto puede ser marcado como `Borrador`, `Aceptado` o `Cancelado`, permitiendo un seguimiento claro del flujo de trabajo.
- **Filtros y Paginación:** La lista de presupuestos se puede filtrar por estado y está paginada para manejar un gran volumen de datos de forma ordenada.
- **Cálculos Detallados:** Muestra el costo de producción y el precio final (con ganancia) tanto en USD como en la moneda local seleccionada.

### 3. Gestión de Insumos (Materiales)
- **Catálogo de Filamentos:** Administra una lista de todos tus filamentos (PLA, PETG, ABS, etc.).
- **Costo por Kilogramo:** Define el costo por kg de cada material, que se usará como base para los cálculos de los presupuestos.
- **Interfaz de Grilla:** Visualiza tus materiales en una moderna vista de tarjetas para una fácil identificación.

### 4. Gestión de Máquinas
- **Inventario de Impresoras:** Mantén un registro de todas tus impresoras 3D.
- **Costos Asociados:** Para cada máquina, puedes definir:
  - **Costo de Depreciación por Hora:** Para contabilizar el desgaste y mantenimiento.
  - **Consumo de Energía (Watts):** Para calcular el costo eléctrico de cada impresión.

### 5. Configuración General
- **Parámetros de Costos:** Ajusta valores globales como el costo de mano de obra por hora y el margen de ganancia deseado.
- **Tarifas Eléctricas:** Configura el costo de la energía (kWh) según tu proveedor, incluyendo tarifas para horarios "Punta" y "Fuera de Punta".
- **Moneda Local:** Selecciona tu moneda local para que la aplicación muestre los totales convertidos automáticamente usando una tasa de cambio actualizada.

### 6. Copia de Seguridad y Restauración
- **Exportación Total:** Exporta todos tus datos (presupuestos, máquinas, insumos y configuración) a un único archivo `JSON` con un solo clic.
- **Importación Segura:** Restaura tus datos desde un archivo de respaldo. La aplicación te advertirá que esta acción sobrescribirá todos los datos actuales para evitar pérdidas accidentales.

## ¿Cómo funciona?

Toda la información que manejas en **Cotiza3D se almacena localmente en tu navegador** usando `localStorage`. Esto significa que tus datos son privados y no se envían a ningún servidor externo. La ventaja es que la aplicación es rápida y funciona sin necesidad de una conexión a internet constante, pero es importante que realices copias de seguridad periódicas usando la función de exportación, especialmente si planeas limpiar el caché de tu navegador o cambiar de computadora.

## Autor

Este proyecto fue creado por **Daniel Facelli**. Si tienes alguna consulta o quieres conectar, puedes encontrarme en LinkedIn:

[https://www.linkedin.com/in/danielfacelli/](https://www.linkedin.com/in/danielfacelli/)
