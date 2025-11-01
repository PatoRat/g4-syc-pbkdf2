# 🔐 g4-syc-pbkdf2

Trabajo práctico de Seguridad Informática – Grupo 4  
Implementación de derivación de claves mediante **PBKDF2** en **Node.js**, con API REST, medición de tiempos y almacenamiento en **SQLite**.

---

## 🧩 Descripción

PBKDF2 (*Password-Based Key Derivation Function 2*) es una función de derivación de clave diseñada para fortalecer contraseñas mediante la aplicación repetida de una función hash criptográfica.

Este proyecto permite:
- Registrar usuarios derivando una clave PBKDF2.
- Verificar logins comparando hashes en tiempo constante.
- Medir el rendimiento de PBKDF2 con distintos parámetros.
- Exportar los parámetros de derivación y resultados a CSV.

---


## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/PatoRat/g4-syc-pbkdf2
cd g4-syc-pbkdf2

# Instalar dependencias
npm install

# (opcional) Instalar nodemon para desarrollo
npm install --save-dev nodemon

```

## EJECUCION

Para ejecutarlo se debe correr
npm run dev

El programa sera visible en:
http://localhost:3000/