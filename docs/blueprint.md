# **App Name**: Cotiza3D

## Core Features:

- Gestión de Insumos y Máquinas: Administra los materiales (filamentos) y las máquinas con sus respectivos costos y propiedades, guardando la información localmente en el navegador.
- Cálculo de Costos: Calcula el costo por trabajo, teniendo en cuenta el uso de materiales, el tiempo de la máquina, el consumo de energía, la mano de obra y los gastos generales.
- Conversión de Moneda: Convierte automáticamente de USD a UYU según el tipo de cambio configurado, permitiendo al usuario ingresar el tipo de cambio manualmente.
- Guardar Presupuestos Localmente: Guarda los presupuestos y las configuraciones de forma segura en el navegador utilizando localStorage o IndexedDB.  Permite persistencia de datos sin registro de usuario.
- Generación de PDF: Genera archivos PDF descargables de los presupuestos con una plantilla estática (logo y datos de contacto).
- Interfaz de Usuario Responsiva: Diseño de UI responsivo que se adapta tanto a dispositivos móviles como de escritorio, con modo claro/oscuro, tablas simples, y visualización de costos parciales.
- Parámetros Adicionales: Configuración de margen de ganancia global, impuestos (IVA), descuentos por volumen, gastos adicionales (empaque, envío, etc.), y notas del presupuesto.
- Usabilidad Mejorada: Editor de presupuestos en pasos, botón duplicar presupuesto, estado 'borrador' / 'finalizado', y opción de copiar el total al portapapeles.

## Style Guidelines:

- Color de fondo: Gris muy claro (#F9FAFB) para proporcionar un telón de fondo limpio y moderno, lo que garantiza la legibilidad y un aspecto profesional.
- Color primario: Un cian vibrante (#0EA5E9) como color primario para los elementos interactivos, que ofrece una sensación viva y de confianza.
- Color de acento: Un tono vivo de verde (#4ADE80) para los CTA, lo que indica claridad y facilidad de uso en las interacciones.
- Fuente del cuerpo y del título: 'Inter' o 'Roboto', una fuente sans-serif, se utilizará para mantener una apariencia limpia y moderna. Nota: actualmente solo se admiten las fuentes de Google.
- El diseño incorporará un amplio espaciado y bordes sutiles para distinguir claramente los diferentes componentes y secciones.
- Utilice un conjunto de iconos simples y esquemáticos para representar diferentes funcionalidades y categorías.
- Incorpore transiciones suaves y estados de carga para mejorar la experiencia del usuario durante la carga de datos y las interacciones con los formularios.