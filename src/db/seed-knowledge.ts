import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { knowledgeArticles } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const MANUAL_ARTICLES = [
  // GENERAL
  {
    category: "Conectividad Wi-Fi",
    deviceModel: "N910 / N950 / N750",
    processor: "General",
    title: "Solución de problemas de comunicación Wi-Fi (Hotspot y bloqueo IP)",
    symptoms:
      "wifi no comunica, bloqueo de direcciones ip, proveedor privado, no realiza transacciones por wifi, test de comunicación",
    steps: `Con algunos proveedores privados, los equipos pueden no realizar transacciones debido a un posible bloqueo de las direcciones IP.

Pasos para el descarte y prueba de conectividad:
1. Solicitar el nombre del proveedor de Wi-Fi del comercio.
2. Conexión por Hotspot Móvil:
   - Comparta datos móviles (hotspot) desde un teléfono celular al terminal POS.
   - El teléfono móvil debe estar conectado a datos celulares y NO a la red Wi-Fi.
3. Realice un test de comunicación:
   - Si el equipo SÍ COMUNICA con hotspot: contactar con el proveedor de internet del cliente para resolver el bloqueo de IP.
   - Si el equipo NO COMUNICA con hotspot: verificar las direcciones IP de Wi-Fi configuradas en el terminal.`,
  },
  {
    category: "Hardware / Seguridad",
    deviceModel: "General",
    processor: "General",
    title: "Posibles causas de activación de Tamper",
    symptoms:
      "tamper, equipo bloqueado tamper, alerta de seguridad, ataque, tamper detected",
    steps: `Causas frecuentes de activación de Tamper en terminales POS:
1. Caída del equipo.
2. Golpe brusco.
3. Contacto con agua u otro líquido.
4. Desgaste de pilas internas.
5. Sulfato interno.
6. Haber sido DESTAPADO por el cliente.

Nota: Un equipo en estado Tamper requiere revisión/reemplazo técnico en taller.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "General",
    processor: "General",
    title: "No reconoce SIM Card",
    symptoms:
      "no reconoce sim, sin sim, sim card, tarjeta sim, no detecta chip",
    steps: `1. Apague el equipo.
2. Limpie la tarjeta SIM utilizando un borrador o una tela suave.
3. Inserte la tarjeta SIM y realice una nueva prueba de comunicación.
4. Si el problema persiste, pruebe colocando la tarjeta SIM en el otro slot (ranura) disponible del equipo.
5. Si la falla continúa, se debe reemplazar la SIM Card.`,
  },

  // N950 CCR
  {
    category: "Parámetros / Diagnóstico",
    deviceModel: "N950",
    processor: "Credicard (CCR)",
    title: "Imprimir parámetros en N950 CCR",
    symptoms: "imprimir parametros n950 ccr, informacion del comercio n950",
    steps: `1. Ingrese a FUNCIONES.
2. Seleccione Configuración de sistema (clave: 123456).
3. Seleccione Imprimir parámetros.
4. Seleccione Información del comercio.`,
  },

  // N910 CCR
  {
    category: "TMS / Parámetros",
    deviceModel: "N910",
    processor: "Credicard (CCR)",
    title: "Descargar parámetros TMS en N910 Credicard",
    symptoms: "descargar parametros tms n910 credicard ccr, toms",
    steps: `1. Ingrese a FUNCIONES.
2. Acceda a Configuración de sistema.
3. Ingrese la clave: 123456.
4. Ejecute Descargar parámetros TMS.

Nota: Si no tiene nada para descargar, realizar un cambio en el TOMS y descargar de nuevo.`,
  },
  {
    category: "Mantenimiento / Limpieza",
    deviceModel: "N910",
    processor: "Credicard (CCR)",
    title: "Limpiar Advice, Etiquetas y/o Reversos en N910 Credicard",
    symptoms:
      "limpiar advice n910 credicard, limpiar etiqueta de cierres, limpiar reversos n910 ccr",
    steps: `1. Acceda a FUNCIONES.
2. Vaya a Configuración de sistema.
3. Ingrese clave: 123456.
4. Seleccione Otras funciones de configuración.
5. Seleccione la opción a ejecutar:
   - Limpiar Advice
   - Limpiar etiqueta de cierres
   - Limpiar reversos
6. Ingrese clave: 8 veces 8 (88888888).`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "N910",
    processor: "Credicard (CCR)",
    title: "Verificar APN en N910 CCR",
    symptoms: "apn n910 ccr credicard, movistar digitel n910, redes moviles",
    steps: `1. En la pantalla principal, seleccione CONFIGURACIONES.
2. Ingrese la clave: 211117.
3. Seleccione Configuraciones redes móviles.
4. Seleccione SIM1 o SIM2, según sea el caso.
5. Verifique que el APN corresponda a la operadora:
   - Movistar: m2mcredi.movistar.ve
   - Digitel: tdd1.vatc`,
  },
  {
    category: "Parámetros / Diagnóstico",
    deviceModel: "N910",
    processor: "Credicard (CCR)",
    title: "Imprimir parámetros en N910 CCR",
    symptoms: "imprimir parametros n910 ccr, informacion del comercio n910",
    steps: `1. Ingrese a FUNCIONES.
2. Seleccione Configuración de sistema (clave: 123456).
3. Seleccione Imprimir parámetros.
4. Seleccione Información del comercio.`,
  },

  // N910 PLATCO
  {
    category: "TMS / Parámetros",
    deviceModel: "N910",
    processor: "Platco",
    title: "Descargar parámetros TMS en N910 Platco",
    symptoms: "descargar parametros tms n910 platco",
    steps: `1. Ingrese a FUNCIONES.
2. Acceda a Configuración de sistema.
3. Ingrese la clave: 211117.
4. Ejecute Descargar parámetros TMS.`,
  },
  {
    category: "Mantenimiento / Limpieza",
    deviceModel: "N910",
    processor: "Platco",
    title: "Limpiar Advice, Etiquetas y/o Reversos en N910 Platco",
    symptoms:
      "limpiar advice n910 platco, limpiar etiqueta de cierres, limpiar reversos n910 platco",
    steps: `1. Acceda a FUNCIONES.
2. Vaya a Configuración de sistema.
3. Ingrese clave: 211117.
4. Seleccione Otras funciones de configuración.
5. Seleccione la opción a ejecutar:
   - Limpiar Advice
   - Limpiar etiqueta de cierres
   - Limpiar reversos
6. Ingrese clave: 1234.`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "N910",
    processor: "Platco",
    title: "Verificar APN en N910 Platco",
    symptoms: "apn n910 platco, movistar digitel platco n910",
    steps: `1. En la pantalla principal, seleccione CONFIGURACIONES.
2. Ingrese la clave: 211117.
3. Seleccione Configuraciones redes móviles.
4. Seleccione SIM1 o SIM2, según sea el caso.
5. Verifique que el APN corresponda a la operadora:
   - Movistar: m2mplatco.movistar.ve
   - Digitel: tdd1.platco2`,
  },
  {
    category: "Restablecimiento / Sistema",
    deviceModel: "N910",
    processor: "Platco",
    title: "Restablecer preferencias de fábrica en N910 Platco",
    symptoms: "restablecer fabrica n910 platco, resetear, borrar configuraciones",
    steps: `1. En la pantalla principal, ingrese a Settings (clave: 211117).
2. Ingrese a Configuraciones.
3. Ingrese a Sistema.
4. Ingrese a Opciones de restablecimiento.
5. Seleccione Borrar.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "N910",
    processor: "Platco",
    title: "Cambiar comunicación de 4G a 3G en N910 Platco",
    symptoms: "cambiar 4g a 3g n910 platco, tipo de red preferido, datos moviles",
    steps: `1. Deslice el menú superior y mantenga presionado el icono de Datos móviles.
2. Seleccione Tipo de red preferido y elija 3G/2G automático.`,
  },

  // N750 PLATCO
  {
    category: "TMS / Parámetros",
    deviceModel: "N750",
    processor: "Platco",
    title: "Descargar parámetros TMS en N750 Platco",
    symptoms: "descargar parametros tms n750 platco",
    steps: `1. Ingrese a FUNCIONES.
2. Acceda a Configuración de sistema.
3. Ingrese la clave: 211117.
4. Ejecute Descargar parámetros TMS.`,
  },
  {
    category: "Mantenimiento / Limpieza",
    deviceModel: "N750",
    processor: "Platco",
    title: "Limpiar Advice, Etiquetas y/o Reversos en N750 Platco",
    symptoms:
      "limpiar advice n750 platco, limpiar etiqueta de cierres, limpiar reversos n750",
    steps: `1. Acceda a FUNCIONES.
2. Vaya a Configuración de sistema.
3. Ingrese clave: 211117.
4. Seleccione Otras funciones de configuración.
5. Seleccione la opción a ejecutar:
   - Limpiar Advice
   - Limpiar etiqueta de cierres
   - Limpiar reversos
6. Ingrese clave: 1234.`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "N750",
    processor: "Platco",
    title: "Verificar APN en N750 Platco",
    symptoms: "apn n750 platco, movistar digitel n750",
    steps: `1. En la pantalla principal, seleccione CONFIGURACIONES.
2. Ingrese la clave: 211117.
3. Seleccione Configuraciones redes móviles.
4. Seleccione SIM1 o SIM2, según sea el caso.
5. Verifique que el APN corresponda a la operadora:
   - Movistar: m2mplatco.movistar.ve
   - Digitel: tdd1.platco2`,
  },
  {
    category: "Restablecimiento / Sistema",
    deviceModel: "N750",
    processor: "Platco",
    title: "Restablecer preferencias de fábrica en N750 Platco",
    symptoms: "restablecer fabrica n750 platco, resetear n750",
    steps: `1. En la pantalla principal, ingrese a Settings (clave: 211117).
2. Ingrese a Configuraciones.
3. Ingrese a Sistema.
4. Ingrese a Opciones de restablecimiento.
5. Seleccione Borrar.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "N750",
    processor: "Platco",
    title: "Cambiar comunicación de 4G a 3G en N750 Platco",
    symptoms: "cambiar 4g a 3g n750 platco, tipo de red preferido n750",
    steps: `1. Deslice el menú superior y mantenga presionado el icono de Datos móviles.
2. Seleccione Tipo de red preferido y elija 3G/2G automático.`,
  },
  {
    category: "Llaves / Seguridad",
    deviceModel: "N750",
    processor: "Platco",
    title: "Verificar llaves en N750 Platco",
    symptoms: "verificar llaves n750 platco, ver llaves",
    steps: `1. Ingrese al aplicativo.
2. Ingrese a Funciones.
3. Ingrese a Configuración del sistema (clave: 211117).
4. Seleccione Llaves.`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "N750",
    processor: "Platco",
    title: "Configurar APN en N750 Platco",
    symptoms: "configurar apn n750 platco, nombres de punto de acceso",
    steps: `1. Deslice el menú superior y mantenga presionado el icono de Datos móviles.
2. Seleccione Nombres de punto de acceso (APN) y configure el APN de su operadora:
   - Movistar: m2mplatco.movistar.ve
   - Digitel: tdd1.platco2`,
  },
  {
    category: "Conectividad / IP",
    deviceModel: "N750",
    processor: "Platco",
    title: "Configurar direcciones IP en N750 Platco",
    symptoms: "configurar ip n750 platco, configuracion de la comunicacion",
    steps: `1. Ingrese al aplicativo financiero.
2. Ingrese a Funciones.
3. Ingrese a Configuración de sistema (contraseña: 211117).
4. Ingrese a Configuración de la comunicación.`,
  },

  // ME60
  {
    category: "Conectividad SIM / Red",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Cambio de Red a 3G en ME60 Movistar",
    symptoms: "cambio de red 3g me60 movistar, sim 2 me60",
    steps: `1. Presione la tecla Menú (X).
2. Seleccione Opción 7: Comunicaciones.
3. Seleccione Opción 4: Tipo de red.
4. Elija SIM 2.
5. Seleccione 3G.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Cambio de Red a 3G en ME60 Digitel",
    symptoms: "cambio de red 3g me60 digitel, sim 1 me60",
    steps: `1. Presione la tecla Menú (X).
2. Seleccione Opción 7: Comunicaciones.
3. Seleccione Opción 4: Tipo de red.
4. Elija SIM 1.
5. Seleccione 3G.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Cambio de Red a GPRS en ME60 Digitel",
    symptoms: "cambio de red gprs me60 digitel, modo sim 1",
    steps: `1. Presione la tecla Menú (X).
2. Seleccione Opción 7: Comunicaciones.
3. Configure Tipo com 2: ninguno.
4. Configure Tipo com 1: GPRS.
5. Seleccione Opción 3: Modo SIM -> Modo SIM 1.`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Cambio de Red a GPRS en ME60 Movistar",
    symptoms: "cambio de red gprs me60 movistar, modo sim 2",
    steps: `1. Presione la tecla Menú (X).
2. Seleccione Opción 7: Comunicaciones.
3. Configure Tipo com 2 = ninguno.
4. Configure Tipo com 1 = GPRS.
5. Seleccione Opción 3: Modo SIM = Modo SIM 2.`,
  },
  {
    category: "Llaves / Seguridad",
    deviceModel: "ME60",
    processor: "General",
    title: "Ver llaves en ME60",
    symptoms: "ver llaves me60, menu tecnico me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico.
2. Presione las teclas 0 y 2 de manera consecutiva y rápida.`,
  },
  {
    category: "Inicialización / Sistema",
    deviceModel: "ME60",
    processor: "General",
    title: "Inicializar ME60",
    symptoms: "inicializar me60, bin invalido me60",
    steps: `1. Presione la tecla roja (X).
2. Seleccione Opción 8: Sistema.
3. Seleccione Opción 1: Inicializar.`,
  },
  {
    category: "Conectividad Wi-Fi",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Ver y configurar parámetros Wi-Fi en ME60",
    symptoms: "parametros wifi me60, host wifi me60, ssl dhcp me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (Contraseña: 1234).
2. Seleccione Opción 2: Comunicaciones.
3. Seleccione Opción 5: WIFI.
4. Configure Utiliza SSL como 0.NO.
5. En SSID, seleccione Opción 0: BUSCAR para elegir su red Wi-Fi e ingrese la clave (si ya está guardada, presione Enter).
6. Configure OPEN DHCP como 1.SI.
7. Verifique o configure los parámetros de Host:
   - IP 1 DE HOST: 201.222.13.4
   - PUERTO 1 DE HOST: 4541
   - IP 2 DE HOST: 201.222.14.22
   - PUERTO 2 DE HOST: 4541`,
  },
  {
    category: "Parámetros / Comunicación",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Refrescar configuración de NII/TPDU en ME60",
    symptoms: "refrescar nii tpdu me60, tpdu me60 platco 6000030000",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Vaya a Comunicaciones.
3. Vaya a 3.NII/TPDU (Referencia TPDU ME60 Platco: 6000030000).
4. Presione Enter hasta regresar a la pantalla de configuración.
5. Apague y encienda el equipo.`,
  },
  {
    category: "Mantenimiento / Limpieza",
    deviceModel: "ME60",
    processor: "General",
    title: "Limpiar lote en ME60",
    symptoms: "limpiar lote me60, borrar lote me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Presione Opción 3: Limpiar.
3. Presione Opción 2: Borrar Lote.`,
  },
  {
    category: "Conectividad / Seguridad",
    deviceModel: "ME60",
    processor: "General",
    title: "Desactivar SSL en ME60",
    symptoms: "desactivar ssl me60, config ssl me60",
    steps: `1. Presione la tecla roja (X).
2. Presione Opción 7: COMUNICACIONES.
3. Presione Opción 5: CONFIG SSL.
4. Ingrese clave: 8 veces 8 (88888888).
5. Presione Opción 0.NO.`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Configurar APN Movistar Platco en ME60",
    symptoms: "configurar apn movistar platco me60, gprs sim 2 me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Opción 2: COMUNICACIONES.
3. Opción 4: GPRS.
4. Opción 2: SIM 2.

Configuración requerida:
- NUM DE DIAL INALÁMBRICO: (NO TOCAR)
- APN 1: m2mplatco.movistar.ve
- IP 1 DE HOST: 172.20.100.174
- PUERTO 1 DE HOST: 4541
- IP 2 DE HOST: 172.20.100.174
- PUERTO 2 DE HOST: 4541
- NOMBRE DE USUARIO: vacío
- PASSWORD: vacío
- MODO PPP: 1.ACTIVO`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "ME60",
    processor: "Platco",
    title: "Configurar APN Digitel Platco en ME60",
    symptoms: "configurar apn digitel platco me60, gprs digitel me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Opción 2: COMUNICACIONES.
3. Opción 4: GPRS.
4. Opción 1/2: SIM correspondiente.

Configuración requerida:
- NUM DE DIAL INALÁMBRICO: (NO TOCAR)
- APN 1: tdd1.platco2
- IP 1 DE HOST: 10.0.16.174
- PUERTO 1 DE HOST: 4541
- IP 2 DE HOST: 10.0.16.174
- PUERTO 2 DE HOST: 4541
- NOMBRE DE USUARIO: vacío
- PASSWORD: vacío
- MODO PPP: 1.ACTIVO`,
  },
  {
    category: "Diagnóstico / Hardware",
    deviceModel: "ME60",
    processor: "General",
    title: "Realizar Test de SIM Card desde Selftest en ME60",
    symptoms: "test sim card selftest me60, wireless modem me60",
    steps: `1. Si está dentro del aplicativo, presione la tecla roja (X) y seleccione la última opción 9.SALIR.
2. Presione ASTERISCO (*) y seguidamente NUMERAL (#) hasta ver los iconos.
3. Diríjase a SELFTEST.
4. Seleccione Opción 3: COMMUNICATION.
5. Seleccione Opción 1: WIRELESS MODEM.
6. Seleccione Opción 1: WIRELESS INFO.`,
  },
  {
    category: "Conectividad Wi-Fi",
    deviceModel: "ME60",
    processor: "General",
    title: "Conectar a Wi-Fi en ME60",
    symptoms: "conectar wifi me60, ssid me60",
    steps: `1. Presione la tecla Menú (X).
2. Seleccione Opción 7: Comunicaciones.
3. Configure Tipo com 2: ninguno.
4. Configure Tipo com 1: 1.WIFI.
5. En "¿Configurar SSID?" seleccione ACEPTAR.
6. Seleccione Opción 0: BUSCAR.
7. Seleccione su red Wi-Fi e introduzca la contraseña.`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "ME60",
    processor: "General",
    title: "Error: [3] Field Err en ME60",
    symptoms: "error 3 field err, field err, tipo de cuenta ahorro corriente",
    steps: `Causa: Al momento de realizar una transacción, en la etapa de seleccionar tipo de cuenta, el cliente presiona Enter sin seleccionar un tipo de cuenta (Ahorro o Corriente).

Solución: Repetir la transacción asegurándose de seleccionar explícitamente el tipo de cuenta (Ahorro o Corriente) antes de presionar Enter.`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "ME60",
    processor: "General",
    title: "Error: Bin Inválido en ME60",
    symptoms: "bin invalido, inicializar me60",
    steps: `Inicializar el equipo mediante los siguientes pasos:
1. Presione la tecla roja (X) para acceder al Menú.
2. Seleccione Opción 8: Sistema.
3. Seleccione Opción 1: Inicializar.`,
  },
  {
    category: "Mantenimiento / Limpieza",
    deviceModel: "ME60",
    processor: "General",
    title: "Limpiar reverso en ME60",
    symptoms: "limpiar reverso me60, borrar reverso me60",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Presione Opción 3: Limpiar.
3. Presione Opción 1: Borrar Reverso.`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "ME60",
    processor: "General",
    title: "Error: No SIM en ME60",
    symptoms: "no sim me60, puerto 1 digitel, puerto 2 movistar, gestion de sim card",
    steps: `1. Verificar que la SIM Card esté colocada correctamente:
   - Puerto 1: Digitel
   - Puerto 2: Movistar
2. Verificar que esté seleccionado el slot correcto:
   - Presione la tecla roja (X) para acceder al Menú.
   - Seleccione Opción 7: Comunicaciones.
   - Seleccione Opción 3: Gestión de SIM CARD.
   - Para Digitel elija MODO SIM 1.
   - Para Movistar elija MODO SIM 2.`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "ME60",
    processor: "General",
    title: "Error TCP en ME60",
    symptoms: "error tcp me60, dscp me60, tiempo de agotado",
    steps: `1. Presione la tecla asterisco (*) para acceder al Menú Técnico (clave: 1234).
2. Seleccione Opción 2: Comunicaciones.
3. Seleccione Opción 6: Other.
4. Verificar que Tiempo de agotado sea: 60.
5. Verificar Open DSCP: 1.SI.
6. Verificar que DSCP sea: 12.
7. Presionar Enter hasta salir del menú.
8. Reiniciar el equipo.`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "ME60",
    processor: "General",
    title: "Errores DNS resolution failure / Time out en ME60",
    symptoms: "dns resolution failure, time out, timeout me60",
    steps: `Verificar conectividad de red (Wi-Fi/GPRS), parámetros de Host/IP y probar conectividad mediante Hotspot móvil o reinicio del terminal. (Puedes ampliar este procedimiento desde el Backoffice cuando definas pasos adicionales).`,
  },

  // SP600
  {
    category: "Llaves / Seguridad",
    deviceModel: "SP600",
    processor: "Credicard (CCR)",
    title: "Ver llaves en SP600",
    symptoms: "ver llaves sp600, llaves sp600",
    steps: `1. Presione de forma consecutiva las teclas: asterisco (*) + tecla verde + número 8.
2. Ingrese la clave: 8 veces 8 (88888888).`,
  },
  {
    category: "Conectividad SIM / APN",
    deviceModel: "SP600",
    processor: "Credicard (CCR)",
    title: "Configurar APN en SP600 (Digitel y Movistar)",
    symptoms: "configurar apn sp600, digitel movistar sp600, flecha arriba 1234",
    steps: `DIGITEL:
1. Flecha arriba (^), clave: 1234 + ENTER.
2. Opción 2: COMUNICACIONES -> Opción 1: SIM 1.
- NUM DE DIAL INALÁMBRICO: vacío + ENTER
- APN 1: tdd1.vatc + ENTER
- IP 1 DE HOST: 200.109.231.231 + ENTER | PUERTO 1: 4455 + ENTER
- IP 2 DE HOST: 200.109.231.231 + ENTER | PUERTO 2: 4455 + ENTER
- NOMBRE DE USUARIO: vacío + ENTER | PASSWORD: vacío + ENTER
- MODO PPP: 1.ACTIVO + ENTER

MOVISTAR:
1. Flecha arriba (^), clave: 1234 + ENTER.
2. Opción 2: COMUNICACIONES -> Opción 2: SIM 2.
- NUM DE DIAL INALÁMBRICO: vacío + ENTER
- APN 1: m2mcredi.movistar.ve + ENTER
- IP 1 DE HOST: 200.109.231.231 + ENTER | PUERTO 1: 4455 + ENTER
- IP 2 DE HOST: 137.1.1.11 + ENTER | PUERTO 2: 5020 + ENTER
- NOMBRE DE USUARIO: vacío + ENTER | PASSWORD: vacío + ENTER
- MODO PPP: 1.ACTIVO + ENTER`,
  },
  {
    category: "Conectividad SIM / Red",
    deviceModel: "SP600",
    processor: "Credicard (CCR)",
    title: "Cambiar Modo SIM 1 o 2 en SP600",
    symptoms: "cambiar modo sim sp600, gestion de sim sp600",
    steps: `1. Menú.
2. Opción 10: COMUNICACIONES.
3. Opción 3: GESTIÓN DE SIM.
4. Seleccionar Modo SIM:
   - SIM 1: Digitel
   - SIM 2: Movistar`,
  },
  {
    category: "Conectividad / Red",
    deviceModel: "SP600",
    processor: "Credicard (CCR)",
    title: "Seleccionar tipo de comunicación (Wi-Fi o GPRS) en SP600",
    symptoms: "cambiar wifi gprs sp600, tipo com sp600",
    steps: `1. Menú.
2. Opción 10: COMUNICACIONES.
3. Opción 2: TIPO COM 2 = 1.NINGUNO.
4. Opción 1: TIPO COM 1 = 1.GPRS o 3.WIFI.`,
  },

  // M51
  {
    category: "Llaves / Seguridad",
    deviceModel: "M51",
    processor: "General",
    title: "Ver llaves en M51",
    symptoms: "ver llaves m51, llaves m51",
    steps: `1. Presione de forma consecutiva las teclas: asterisco (*) + tecla verde + número 8.
2. Ingrese la clave: 8 veces 8 (88888888).`,
  },

  // TABLAS DE REFERENCIA Y CÓDIGOS
  {
    category: "Tablas APN / IP",
    deviceModel: "General",
    processor: "Credicard / Platco",
    title: "Tabla de Configuración APN GPRS SIM Card (Credicard y Platco)",
    symptoms:
      "tabla apn gprs, ip host puerto, credicard digitel movistar, platco digitel movistar",
    steps: `Referencia oficial de APN e IPs GPRS:

- Credicard | Digitel: APN tdd1.vatc | IP1 200.109.231.231:4455 | IP2 200.109.231.231:4455
- Credicard | Movistar: APN m2mcredi.movistar.ve | IP1 200.109.231.231:4455 | IP2 137.1.1.11:5020
- Platco | Digitel: APN tdd1.platco2 | IP1 10.0.16.174:4541 | IP2 10.0.16.174:4541
- Platco | Movistar: APN m2mplatco.movistar.ve | IP1 172.20.100.174:4541 | IP2 172.20.100.174:4541`,
  },
  {
    category: "Tablas APN / IP",
    deviceModel: "General",
    processor: "Credicard / Platco",
    title: "Tabla de Configuración IP Wi-Fi (Platco y CCR)",
    symptoms: "tabla ip wifi, ip wifi platco, ip wifi ccr credicard",
    steps: `Referencia oficial de IPs y Puertos Wi-Fi:

- WI-FI PLATCO: IP1 201.222.13.4:4541 | IP2 201.222.14.22:4541
- WI-FI CCR (Credicard): IP1 200.109.231.231:4455 | IP2 200.109.231.231:4455`,
  },
  {
    category: "Códigos de Error",
    deviceModel: "General",
    processor: "Platco",
    title: "Código 39 (Monto muy bajo) y TPDU ME60 Platco",
    symptoms: "codigo 39, monto de transaccion muy bajo, tpdu me60 platco, 6000030000",
    steps: `- CÓDIGO 39: Monto de transacción muy bajo. Indicar al comercio verificar el monto mínimo permitido para la operación.
- TPDU ME60 PLATCO: 6000030000`,
  },
];

async function main() {
  const existing = await db.select().from(knowledgeArticles);
  if (existing.length > 0 && !process.argv.includes("--force")) {
    console.log(
      `Knowledge base already has ${existing.length} articles. Pass --force to re-seed.`
    );
    return;
  }

  if (existing.length > 0 && process.argv.includes("--force")) {
    await db.delete(knowledgeArticles);
  }

  await db.insert(knowledgeArticles).values(MANUAL_ARTICLES);
  console.log(
    `Inserted ${MANUAL_ARTICLES.length} knowledge articles into Neon DB.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
