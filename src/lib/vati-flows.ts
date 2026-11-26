export type GestionId =
  | "servicio_tecnico"
  | "desinstalacion"
  | "reconexion"
  | "cambio_razon_social"
  | "traslado"
  | "insumos_consultas";

export interface FlowButton {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  nextStepId: string;
  priority?: "low" | "medium" | "high" | "urgent";
  gestionType?: GestionId;
  subCategory?: string;
  deviceModel?: string;
  processor?: string;
  kbQuery?: string;
}

export interface FlowFormField {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "textarea";
}

export interface FlowStep {
  id: string;
  message: string;
  checklist?: string[];
  buttons?: FlowButton[];
  form?: {
    title: string;
    submitLabel: string;
    fields: FlowFormField[];
    defaultStatus: "waiting_agent" | "resolved";
  };
  ticketLookup?: boolean;
  allowSelfResolve?: boolean;
}

export const GESTION_OPTIONS: FlowButton[] = [
  {
    id: "g_servicio_tecnico",
    label: "Servicio Técnico",
    nextStepId: "st_model_menu",
    gestionType: "servicio_tecnico",
    priority: "high",
  },
  {
    id: "g_otras_gestiones",
    label: "Otras Gestiones",
    nextStepId: "otras_gestiones_menu",
    priority: "medium",
  },
];

export const DEVICE_MODEL_OPTIONS: FlowButton[] = [
  {
    id: "mod_n910",
    label: "N910",
    nextStepId: "st_processor_menu",
    deviceModel: "N910",
  },
  {
    id: "mod_n950",
    label: "N950",
    nextStepId: "st_processor_menu",
    deviceModel: "N950",
  },
  {
    id: "mod_n750",
    label: "N750",
    nextStepId: "st_processor_menu",
    deviceModel: "N750",
  },
  {
    id: "mod_me60",
    label: "ME60",
    nextStepId: "st_faults_menu",
    deviceModel: "ME60",
    processor: "Platco",
  },
  {
    id: "mod_sp600",
    label: "SP600",
    nextStepId: "st_faults_menu",
    deviceModel: "SP600",
    processor: "Credicard",
  },
  {
    id: "mod_m51",
    label: "M51",
    nextStepId: "st_processor_menu",
    deviceModel: "M51",
  },
  {
    id: "mod_otro",
    label: "Otro modelo",
    nextStepId: "st_processor_menu",
    deviceModel: "General",
  },
];

export const PROCESSOR_OPTIONS: FlowButton[] = [
  {
    id: "proc_credicard",
    label: "Credicard",
    nextStepId: "st_faults_menu",
    processor: "Credicard",
  },
  {
    id: "proc_platco",
    label: "Platco",
    nextStepId: "st_faults_menu",
    processor: "Platco",
  },
];

export const OTRAS_GESTIONES_OPTIONS: FlowButton[] = [
  {
    id: "og_desinstalacion",
    label: "Desinstalación",
    description: "Retiro de terminal o baja de servicio",
    nextStepId: "desinst_menu",
    gestionType: "desinstalacion",
    priority: "medium",
  },
  {
    id: "og_reconexion",
    label: "Reconexión",
    description: "Reactivación de equipo o servicio suspendido",
    nextStepId: "reconexion_menu",
    gestionType: "reconexion",
    priority: "high",
  },
  {
    id: "og_cambio_razon",
    label: "Cambio de Razón Social",
    description: "Actualización legal, RNC/RUC o titularidad",
    nextStepId: "razon_menu",
    gestionType: "cambio_razon_social",
    priority: "medium",
  },
  {
    id: "og_traslado",
    label: "Traslado de Equipo",
    description: "Cambio de dirección o nueva sucursal",
    nextStepId: "traslado_form",
    gestionType: "traslado",
    subCategory: "Cambio de dirección / sucursal",
    priority: "medium",
  },
  {
    id: "og_rollos",
    label: "Solicitar rollos / insumos",
    description: "Papel térmico, cargadores o accesorios",
    nextStepId: "insumos_form",
    gestionType: "insumos_consultas",
    subCategory: "Solicitud de insumos",
    priority: "low",
  },
  {
    id: "og_estado",
    label: "Consultar estado de mi ticket",
    description: "Revisa tu solicitud ingresando tu código (por ejemplo, VTC-0001)",
    nextStepId: "ticket_lookup",
    gestionType: "insumos_consultas",
    subCategory: "Consulta de estado",
    priority: "low",
  },
  {
    id: "og_agente",
    label: "Hablar con un agente",
    description: "Derivación directa al equipo de soporte",
    nextStepId: "agente_form",
    gestionType: "insumos_consultas",
    subCategory: "Contacto con agente",
    priority: "medium",
  },
];

export const COMMON_CUSTOMER_FIELDS: FlowFormField[] = [
  {
    name: "customerName",
    label: "Nombre de contacto",
    placeholder: "Por ejemplo, María Rodríguez",
    required: true,
  },
  {
    name: "companyName",
    label: "Nombre del comercio",
    placeholder: "Por ejemplo, Farmacia Central SRL",
    required: true,
  },
  {
    name: "documentId",
    label: "RNC / RUC / Cédula",
    placeholder: "Por ejemplo, 131-45678-9",
    required: true,
  },
  {
    name: "phone",
    label: "Teléfono / WhatsApp",
    placeholder: "Por ejemplo, +1 809-555-0142",
    required: true,
    type: "tel",
  },
  {
    name: "email",
    label: "Correo electrónico",
    placeholder: "correo@comercio.com",
    type: "email",
  },
];

export const VATI_FLOWS: Record<string, FlowStep> = {
  welcome: {
    id: "welcome",
    message:
      "¡Hola! Soy Vati, tu asistente virtual de autogestión. Selecciona el tipo de gestión que deseas realizar o escríbeme directamente abajo:",
    buttons: GESTION_OPTIONS,
  },

  otras_gestiones_menu: {
    id: "otras_gestiones_menu",
    message:
      "Perfecto, estas son todas las gestiones administrativas y comerciales disponibles. ¿Cuál necesitas realizar?",
    buttons: OTRAS_GESTIONES_OPTIONS,
  },

  // 1. SERVICIO TÉCNICO — PRIMERO MODELO, LUEGO PROCESADORA (si aplica), LUEGO FALLAS
  st_model_menu: {
    id: "st_model_menu",
    message:
      "Perfecto, vamos con Servicio Técnico. Primero selecciona el modelo de tu equipo POS:",
    buttons: DEVICE_MODEL_OPTIONS,
  },

  st_processor_menu: {
    id: "st_processor_menu",
    message: "¿Con qué procesadora trabaja tu equipo?",
    buttons: PROCESSOR_OPTIONS,
  },

  st_faults_menu: {
    id: "st_faults_menu",
    message: "¿Qué falla o procedimiento necesitas atender en este equipo?",
    buttons: [
      {
        id: "st_wifi",
        label: "Wi-Fi / Comunicación",
        nextStepId: "st_red_guide",
        subCategory: "Wi-Fi / Comunicación",
        kbQuery: "wifi",
        priority: "high",
      },
      {
        id: "st_sim_apn",
        label: "SIM Card / APN / Red 3G-GPRS",
        nextStepId: "st_red_guide",
        subCategory: "SIM Card / APN / Red",
        kbQuery: "apn",
        priority: "high",
      },
      {
        id: "st_tms",
        label: "Parámetros TMS / Inicializar",
        nextStepId: "st_software_guide",
        subCategory: "Parámetros TMS / Inicializar",
        kbQuery: "tms",
        priority: "medium",
      },
      {
        id: "st_limpieza",
        label: "Limpiar Advice / Reverso / Lote",
        nextStepId: "st_software_guide",
        subCategory: "Limpiar Advice / Reverso / Lote",
        kbQuery: "limpiar",
        priority: "medium",
      },
      {
        id: "st_llaves_tamper",
        label: "Llaves / Tamper",
        nextStepId: "st_software_guide",
        subCategory: "Llaves / Tamper",
        kbQuery: "llaves",
        priority: "high",
      },
      {
        id: "st_errores",
        label: "Códigos de error (TCP, Field Err, Bin, 39)",
        nextStepId: "st_software_guide",
        subCategory: "Códigos de error",
        kbQuery: "error",
        priority: "high",
      },
      {
        id: "st_impresora",
        label: "No imprime / Papel",
        nextStepId: "st_impresora_guide",
        subCategory: "Impresión / Papel",
        priority: "medium",
      },
      {
        id: "st_bateria",
        label: "No enciende / Batería",
        nextStepId: "st_bateria_guide",
        subCategory: "Energía / Batería",
        priority: "high",
      },
      {
        id: "st_otro",
        label: "Otro daño físico / Abrir ticket",
        nextStepId: "st_ticket_form",
        subCategory: "Daño físico / Otro",
        priority: "urgent",
      },
    ],
  },

  st_kb_resolution: {
    id: "st_kb_resolution",
    message: "¿Estos pasos resolvieron la falla en tu equipo?",
    buttons: [
      {
        id: "st_kb_ok",
        label: "Sí, se resolvió",
        nextStepId: "self_resolved_form",
      },
      {
        id: "st_kb_fail",
        label: "No, crear ticket técnico",
        nextStepId: "st_ticket_form",
      },
      {
        id: "st_kb_other_fault",
        label: "Ver otras fallas de este modelo",
        nextStepId: "st_faults_menu",
      },
    ],
  },

  st_red_guide: {
    id: "st_red_guide",
    message:
      "Antes de generar un ticket técnico, probemos estos 3 pasos rápidos para restablecer la conexión:",
    checklist: [
      "Verifica que el ícono de Wi-Fi o señal 4G esté activo en la parte superior del equipo.",
      "Reinicia el equipo manteniendo presionado el botón de encendido por 5 segundos.",
      "Si usas Wi-Fi, apaga y enciende el router o prueba cambiando a datos móviles (SIM).",
    ],
    allowSelfResolve: true,
    buttons: [
      {
        id: "st_resolved",
        label: "Sí, ya volvió la conexión",
        description: "Cerrar gestión como resuelta por autogestión",
        nextStepId: "self_resolved_form",
      },
      {
        id: "st_escalate",
        label: "Sigue sin conectar — Necesito soporte",
        description: "Crear ticket prioritario para un técnico",
        nextStepId: "st_ticket_form",
      },
    ],
  },

  st_impresora_guide: {
    id: "st_impresora_guide",
    message:
      "Probemos esta verificación rápida para solucionar el problema de impresión:",
    checklist: [
      "Abre la compuerta superior y verifica que el rollo térmico esté colocado con el borde saliendo desde abajo hacia arriba.",
      "Comprueba que sea papel térmico (raspa suavemente con la uña: debe marcar una línea gris).",
      "Cierra la tapa firmemente hasta escuchar un clic y realiza una prueba de impresión.",
    ],
    allowSelfResolve: true,
    buttons: [
      {
        id: "st_imp_ok",
        label: "Sí, ya imprime correctamente",
        nextStepId: "self_resolved_form",
      },
      {
        id: "st_imp_fail",
        label: "Continúa fallando — Escalar a técnico",
        nextStepId: "st_ticket_form",
      },
    ],
  },

  st_bateria_guide: {
    id: "st_bateria_guide",
    message: "Realicemos un diagnóstico rápido de energía:",
    checklist: [
      "Conecta el cargador original a otro tomacorriente verificado durante al menos 10 minutos.",
      "Revisa que el LED indicador de carga se encienda junto al puerto USB-C / carga.",
      "Mantén presionado el botón de encendido por 10 segundos continuos para forzar el arranque.",
    ],
    allowSelfResolve: true,
    buttons: [
      {
        id: "st_bat_ok",
        label: "Sí, el equipo encendió",
        nextStepId: "self_resolved_form",
      },
      {
        id: "st_bat_fail",
        label: "No enciende — Solicitar revisión técnica",
        nextStepId: "st_ticket_form",
      },
    ],
  },

  st_software_guide: {
    id: "st_software_guide",
    message: "Intentemos recuperar la aplicación con estos pasos:",
    checklist: [
      "Presiona el botón de encendido por 8 segundos para reiniciar el terminal.",
      "Al iniciar, verifica que la fecha y hora del sistema sean correctas.",
      "Ingresa nuevamente a la app de cobros y realiza un cierre o sincronización de parámetros.",
    ],
    allowSelfResolve: true,
    buttons: [
      {
        id: "st_sw_ok",
        label: "Listo, ya funciona bien",
        nextStepId: "self_resolved_form",
      },
      {
        id: "st_sw_fail",
        label: "Persiste el error — Reportar a soporte",
        nextStepId: "st_ticket_form",
      },
    ],
  },

  st_ticket_form: {
    id: "st_ticket_form",
    message:
      "Entendido. Completa estos datos para generar tu ticket de Servicio Técnico y asignarlo a un especialista:",
    form: {
      title: "Datos para Ticket de Servicio Técnico",
      submitLabel: "Crear ticket técnico",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "deviceModel",
          label: "Modelo / Serial del equipo",
          placeholder: "Por ejemplo, PAX A920 — SN 182049302",
          required: true,
        },
        {
          name: "details",
          label: "Detalle breve del error o código en pantalla",
          placeholder: "Describe qué mensaje aparece o desde cuándo ocurre...",
          type: "textarea",
          required: true,
        },
      ],
    },
  },

  self_resolved_form: {
    id: "self_resolved_form",
    message:
      "¡Excelente noticia! Si deseas dejar registro de esta autogestión (opcional) o simplemente finalizar, completa tu nombre y comercio:",
    form: {
      title: "Registrar cierre por Autogestión",
      submitLabel: "Finalizar gestión resuelta",
      defaultStatus: "resolved",
      fields: [
        {
          name: "customerName",
          label: "Tu nombre",
          placeholder: "Por ejemplo, Carlos Méndez",
          required: true,
        },
        {
          name: "companyName",
          label: "Nombre del comercio",
          placeholder: "Por ejemplo, Cafetería Sol",
          required: true,
        },
      ],
    },
  },

  // 2. DESINSTALACIÓN
  desinst_menu: {
    id: "desinst_menu",
    message:
      "Te ayudo con la solicitud de Desinstalación de equipo. ¿Cuál es el motivo principal?",
    buttons: [
      {
        id: "des_cierre",
        label: "Cierre de local / sucursal",
        nextStepId: "desinst_form",
        subCategory: "Cierre de local",
      },
      {
        id: "des_reduccion",
        label: "Reducción de equipos",
        nextStepId: "desinst_form",
        subCategory: "Reducción de equipos",
      },
      {
        id: "des_temporal",
        label: "Suspensión temporal",
        nextStepId: "desinst_form",
        subCategory: "Suspensión temporal",
      },
      {
        id: "des_otro",
        label: "Otro motivo",
        nextStepId: "desinst_form",
        subCategory: "Otro motivo",
      },
    ],
  },

  desinst_form: {
    id: "desinst_form",
    message:
      "Completa los datos del comercio y la dirección donde debemos coordinar el retiro del equipo:",
    form: {
      title: "Solicitud de Desinstalación",
      submitLabel: "Enviar solicitud de retiro",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "deviceModel",
          label: "Serial(es) del equipo a retirar",
          placeholder: "Por ejemplo, Verifone V240m — SN 44210",
          required: true,
        },
        {
          name: "pickupAddress",
          label: "Dirección y horario para el retiro",
          placeholder: "Calle, número, referencia y horario disponible",
          type: "textarea",
          required: true,
        },
      ],
    },
  },

  // 3. RECONEXIÓN
  reconexion_menu: {
    id: "reconexion_menu",
    message:
      "Vamos a gestionar tu Reconexión de servicio. Selecciona tu caso:",
    buttons: [
      {
        id: "rec_pago",
        label: "Ya realicé el pago pendiente",
        description: "Reactivación inmediata tras validación",
        nextStepId: "reconexion_form",
        subCategory: "Reconexión por pago",
        priority: "high",
      },
      {
        id: "rec_reactivar",
        label: "Reactivar equipo inactivo",
        description: "Equipo suspendido temporalmente",
        nextStepId: "reconexion_form",
        subCategory: "Reactivación de equipo",
        priority: "medium",
      },
      {
        id: "rec_sim",
        label: "Reactivación de línea SIM / Datos",
        nextStepId: "reconexion_form",
        subCategory: "Reactivación SIM / Datos",
        priority: "high",
      },
    ],
  },

  reconexion_form: {
    id: "reconexion_form",
    message:
      "Ingresa los datos del comercio y, si aplica, la referencia de tu comprobante de pago:",
    form: {
      title: "Solicitud de Reconexión",
      submitLabel: "Solicitar reconexión",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "deviceModel",
          label: "Serial del equipo (si lo tienes a mano)",
          placeholder: "Por ejemplo, SN 9038123",
        },
        {
          name: "paymentReference",
          label: "Referencia de pago / Comentarios",
          placeholder: "Número de transferencia o fecha de pago",
          type: "textarea",
          required: true,
        },
      ],
    },
  },

  // 4. CAMBIO DE RAZÓN SOCIAL
  razon_menu: {
    id: "razon_menu",
    message:
      "Te guío con el Cambio de Razón Social. ¿Qué tipo de actualización necesitas?",
    buttons: [
      {
        id: "rs_persona_empresa",
        label: "Persona física a jurídica (Empresa)",
        nextStepId: "razon_form",
        subCategory: "Persona física a jurídica",
      },
      {
        id: "rs_nueva_razon",
        label: "Cambio de razón social / RNC",
        nextStepId: "razon_form",
        subCategory: "Cambio de razón social / RNC",
      },
      {
        id: "rs_nombre_comercial",
        label: "Solo actualización de nombre comercial",
        nextStepId: "razon_form",
        subCategory: "Nombre comercial",
      },
    ],
  },

  razon_form: {
    id: "razon_form",
    message:
      "Completa los datos actuales y la nueva razón social. Un agente te enviará el enlace seguro para adjuntar el registro mercantil:",
    form: {
      title: "Cambio de Razón Social",
      submitLabel: "Registrar solicitud",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "newLegalName",
          label: "Nueva Razón Social",
          placeholder: "Por ejemplo, Inversiones Nova SRL",
          required: true,
        },
        {
          name: "newDocumentId",
          label: "Nuevo RNC / RUC",
          placeholder: "Por ejemplo, 132-99887-1",
          required: true,
        },
      ],
    },
  },

  // 5. TRASLADO
  traslado_form: {
    id: "traslado_form",
    message:
      "Para coordinar el Traslado de Equipo a una nueva dirección o sucursal, indícanos los siguientes datos:",
    form: {
      title: "Solicitud de Traslado de Equipo",
      submitLabel: "Solicitar traslado",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "deviceModel",
          label: "Serial del equipo a trasladar",
          placeholder: "Por ejemplo, PAX A920 — SN 182049302",
          required: true,
        },
        {
          name: "newAddress",
          label: "Nueva dirección completa",
          placeholder: "Avenida, sector, local y ciudad",
          type: "textarea",
          required: true,
        },
      ],
    },
  },

  // 6. OTRAS GESTIONES Y CONSULTA DE TICKET
  otras_menu: {
    id: "otras_menu",
    message: "¿Qué otra gestión te gustaría realizar?",
    buttons: [
      {
        id: "ot_estado",
        label: "Consultar estado de mi ticket",
        description: "Ingresa tu número de ticket (por ejemplo, VTC-0001)",
        nextStepId: "ticket_lookup",
        subCategory: "Consulta de estado",
      },
      {
        id: "ot_rollos",
        label: "Solicitar rollos / insumos",
        description: "Papel térmico, cargadores o accesorios",
        nextStepId: "insumos_form",
        subCategory: "Solicitud de insumos",
      },
      {
        id: "ot_agente",
        label: "Hablar con un agente",
        description: "Derivación directa al equipo de soporte",
        nextStepId: "agente_form",
        subCategory: "Contacto con agente",
        priority: "medium",
      },
    ],
  },

  ticket_lookup: {
    id: "ticket_lookup",
    message:
      "Escribe tu número de ticket (por ejemplo `1` o `VTC-0001`) para consultar su estado en tiempo real:",
    ticketLookup: true,
  },

  insumos_form: {
    id: "insumos_form",
    message:
      "Indícanos qué insumos necesitas y la dirección de entrega:",
    form: {
      title: "Solicitud de Insumos",
      submitLabel: "Solicitar insumos",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "suppliesDetail",
          label: "Insumos y cantidad solicitada",
          placeholder: "Por ejemplo, 10 rollos térmicos 57mm + 1 cargador USB-C",
          type: "textarea",
          required: true,
        },
      ],
    },
  },

  agente_form: {
    id: "agente_form",
    message:
      "Con gusto te conecto con un agente de nuestro equipo. Déjanos tus datos y tu consulta:",
    form: {
      title: "Contactar con un Agente",
      submitLabel: "Solicitar atención",
      defaultStatus: "waiting_agent",
      fields: [
        ...COMMON_CUSTOMER_FIELDS,
        {
          name: "details",
          label: "¿En qué podemos ayudarte?",
          placeholder: "Cuéntanos brevemente tu solicitud...",
          type: "textarea",
          required: true,
        },
      ],
    },
  },
};
