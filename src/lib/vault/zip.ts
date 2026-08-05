import { crc32 } from "node:zlib";

/**
 * Escritor de ZIP, sin dependencias y sin compresión.
 *
 * POR QUÉ NO SE AÑADE UNA LIBRERÍA. Este es el paquete que un cliente entrega a
 * un auditor: es la pieza más sensible del producto. Meter una dependencia de
 * terceros aquí añade superficie de suministro justo donde menos conviene, y a
 * cambio de poco — el formato ZIP en modo "almacenado" son tres estructuras y un
 * CRC32, y el CRC32 lo trae Node de serie desde la v20.
 *
 * POR QUÉ SIN COMPRIMIR (método 0, «store»), que parece un desperdicio y no lo es:
 *
 *  · Los archivos de evidencia reales son PDF, imágenes y ofimática, todos ya
 *    comprimidos. Comprimir otra vez ahorra poco y cuesta CPU en cada descarga.
 *  · Y sobre todo: los bytes dentro del ZIP son EXACTAMENTE los del archivo. Un
 *    auditor puede abrirlo con cualquier herramienta, sacar un fichero y
 *    comprobar su SHA-256 contra el manifiesto sin depender de que la
 *    descompresión sea fiel. En un paquete de evidencia, que la comprobación sea
 *    trivial vale más que unos megas.
 *
 * LÍMITE CONOCIDO: no implementa Zip64, así que ni el paquete ni ningún archivo
 * pueden pasar de 4 GB. En vez de generar un ZIP corrupto al superarlo —que es lo
 * que hace un escritor descuidado— se lanza. Un paquete de auditoría roto que
 * *parece* válido es el peor resultado posible aquí.
 */

const MAX_ZIP_BYTES = 0xffffffff; // 4 GiB - 1: el tope del formato sin Zip64.

export type ZipEntry = {
  /** Ruta dentro del ZIP. Se usa `/` como separador, en UTF-8. */
  path: string;
  data: Uint8Array;
};

function dosDateTime(date: Date): { time: number; date: number } {
  // El formato ZIP guarda la fecha en el formato de MS-DOS: segundos en pasos de
  // dos y años desde 1980. No admite fechas anteriores.
  const year = Math.max(1980, date.getUTCFullYear());
  return {
    time:
      (date.getUTCHours() << 11) |
      (date.getUTCMinutes() << 5) |
      (Math.floor(date.getUTCSeconds() / 2) & 0x1f),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

/**
 * Construye el ZIP completo en memoria.
 *
 * `modifiedAt` es un parámetro y no `new Date()` a propósito: con la fecha fija,
 * empaquetar dos veces el mismo contenido da BYTES IDÉNTICOS. Eso permite
 * comparar dos paquetes y demostrar que son el mismo, que es justo lo que se le
 * pide a un archivo de evidencia.
 */
export function buildZip(entries: readonly ZipEntry[], modifiedAt: Date): Uint8Array {
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(modifiedAt);

  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.path)) {
      // Dos entradas con la misma ruta producen un ZIP donde una tapa a la otra
      // según el descompresor. En un paquete de evidencia, "según el
      // descompresor" no es aceptable.
      throw new Error(`buildZip: ruta duplicada (${e.path})`);
    }
    seen.add(e.path);
  }

  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.path);
    const crc = crc32(entry.data) >>> 0;
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // firma de cabecera local
    lv.setUint16(4, 20, true); // versión necesaria
    lv.setUint16(6, 0x0800, true); // bit 11: el nombre va en UTF-8
    lv.setUint16(8, 0, true); // método 0 = almacenado
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // comprimido
    lv.setUint32(22, size, true); // sin comprimir (iguales: no hay compresión)
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // sin campo extra
    local.set(nameBytes, 30);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); // firma de cabecera central
    cv.setUint16(4, 20, true); // versión del creador
    cv.setUint16(6, 20, true); // versión necesaria
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // comentario
    cv.setUint16(34, 0, true); // disco
    cv.setUint16(36, 0, true); // atributos internos
    cv.setUint32(38, 0, true); // atributos externos
    cv.setUint32(42, offset, true); // desplazamiento de la cabecera local
    central.set(nameBytes, 46);

    locals.push(local, entry.data);
    centrals.push(central);
    offset += local.length + size;

    if (offset > MAX_ZIP_BYTES) {
      throw new Error("buildZip: el paquete supera los 4 GB (haría falta Zip64)");
    }
  }

  const centralSize = centrals.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // fin del directorio central
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true); // sin comentario

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of [...locals, ...centrals, end]) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}
