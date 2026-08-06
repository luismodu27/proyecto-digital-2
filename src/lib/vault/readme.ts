/**
 * El texto que va DENTRO del paquete explicando cómo verificarlo.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN LA WEB. Porque el paquete se reenvía por correo,
 * se guarda en una carpeta compartida y se abre meses después, muy posiblemente
 * por alguien que no ha entrado nunca en Attesta y que no va a buscar
 * documentación. Si las instrucciones no viajan dentro del ZIP, la verificación
 * no la hace nadie — y una verificación que nadie hace no defiende nada.
 *
 * Las órdenes son de copiar y pegar, con herramientas que ya están en cualquier
 * portátil (`sha256sum`, `python3`). Pedir que se instale algo es pedir que no se
 * verifique.
 */
export function VERIFY_README(firmado: boolean): string {
  const cabecera = `PAQUETE DE EVIDENCIA · ATTESTA
==============================

Qué es esto
-----------
Un archivo con los documentos de evidencia que una organización tenía guardados
en Attesta, más un manifiesto que lista cada archivo con su huella SHA-256.

QUÉ AFIRMA ESTE PAQUETE
  Que los archivos listados, con los hashes indicados, estaban almacenados en la
  cuenta de esa organización en la fecha de generación.

QUÉ NO AFIRMA
  No es una certificación, ni una auditoría, ni una determinación de
  cumplimiento. Attesta no ha revisado el contenido de los archivos ni valora si
  la evidencia es suficiente o adecuada. El contenido lo aporta y lo declara la
  propia organización.

Contenido
---------
  manifest.json             el manifiesto, legible (indentado)
  manifest.canonical.json   el mismo manifiesto en su forma canónica
  evidencia/                los archivos
${firmado ? "  signature.json            la firma Ed25519 del manifiesto canónico\n" : ""}
`;

  const paso1 = `
1) Comprobar que los archivos son los que dice el manifiesto
------------------------------------------------------------
Descomprime el paquete y ejecuta, en su carpeta:

    python3 - <<'EOF'
    import json, hashlib, os, sys
    m = json.load(open("manifest.canonical.json"))
    malos = []
    for f in m["files"]:
        ruta = f["path"]
        if not os.path.exists(ruta):
            malos.append((ruta, "FALTA")); continue
        h = hashlib.sha256(open(ruta,"rb").read()).hexdigest()
        if h != f["sha256"]:
            malos.append((ruta, "HASH DISTINTO"))
    print("Archivos en el manifiesto:", len(m["files"]))
    print("Problemas:", malos if malos else "ninguno")
    if m.get("truncated"):
        print("AVISO — el paquete NO está completo:", m["truncated"])
    EOF

Si sale "Problemas: ninguno", el contenido coincide con el manifiesto.

Sobre los nombres de archivo
  Las rutas dentro de "evidencia/" van sin acentos y sin caracteres especiales, a
  propósito: así son idénticas en Windows, macOS y Linux, y la comprobación de
  arriba funciona en cualquier máquina sin depender de la configuración regional.
  El nombre original con el que la organización subió cada documento se conserva
  íntegro en el campo "filename" del manifiesto.
`;

  const paso2 = firmado
    ? `
2) Comprobar que el manifiesto lo emitió Attesta y no se ha tocado
------------------------------------------------------------------
La firma es Ed25519 sobre el fichero manifest.canonical.json, byte a byte.

    python3 - <<'EOF'
    import json, base64
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    s = json.load(open("signature.json"))
    pub = Ed25519PublicKey.from_public_bytes(base64.b64decode(s["publicKey"]))
    datos = open("manifest.canonical.json","rb").read()
    try:
        pub.verify(base64.b64decode(s["signature"]), datos)
        print("FIRMA VÁLIDA · keyId:", s["keyId"])
    except Exception as e:
        print("FIRMA NO VÁLIDA:", e)
    EOF

(Necesita el paquete de Python "cryptography": pip install cryptography)

Comprueba además que el keyId que aparece coincide con la clave pública que
Attesta publica en /api/vault/key. Si no coincide, el paquete lo firmó otro.
`
    : `
2) Firma: ESTE PAQUETE NO ESTÁ FIRMADO
---------------------------------------
Se generó sin clave de firma configurada, así que el manifiesto NO lleva firma.
Puedes comprobar que los archivos coinciden con el manifiesto (paso 1), pero NO
que el manifiesto lo emitiera Attesta ni que nadie lo haya modificado después.

Para un uso ante terceros, pide un paquete firmado.
`;

  return cabecera + paso1 + paso2;
}
