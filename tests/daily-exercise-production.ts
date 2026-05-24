import "dotenv/config";

async function runProductionTest() {
  // Read Vercel production URL from command line arguments or environment
  const productionUrl = process.argv[2] || process.env.VERCEL_URL;
  const cronSecret = process.env.CRON_SECRET || "cron-secret-super-key-987654321-zyxwvuts";

  if (!productionUrl) {
    console.error("❌ ERROR: Debes proporcionar la URL de tu despliegue en Vercel.");
    console.log("\nUso del script:");
    console.log("  npx tsx tests/daily-exercise-production.ts https://tu-proyecto.vercel.app");
    process.exit(1);
  }

  // Format URL
  const sanitizedUrl = productionUrl.endsWith("/") ? productionUrl.slice(0, -1) : productionUrl;
  const targetUrl = `${sanitizedUrl}/api/cron/daily-exercise`;

  console.log(`Lanzando petición de prueba a producción: ${targetUrl}...`);
  console.log("Esto conectará la API de tu Vercel desplegado con Gemini y tu base de datos de Neon.");

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json"
      }
    });

    const status = response.status;
    const text = await response.text();

    console.log(`\nStatus HTTP de respuesta: ${status}`);
    
    try {
      const json = JSON.parse(text);
      if (response.ok && json.success) {
        console.log("\n🎉 ¡PRUEBA EN PRODUCCIÓN EXITOSA!");
        console.log("-----------------------------------------------------------------");
        console.log(`Mensaje:        ${json.message}`);
        console.log(`Tareas creadas: ${json.tasks ? json.tasks.length : 0}`);
        if (json.tasks && json.tasks.length > 0) {
          json.tasks.forEach((t: any, index: number) => {
            console.log(`\n[Usuario ${index + 1}]`);
            console.log(`- ID Usuario: ${t.userId}`);
            console.log(`- ID Tarea:   ${t.taskId}`);
            console.log(`- Título:     ${t.title}`);
          });
        }
        console.log("-----------------------------------------------------------------");
        console.log(`Abre tu tablero en producción (${sanitizedUrl}/kanban) para ver los cambios.`);
      } else {
        console.log("\n❌ LA API DE PRODUCCIÓN RETORNÓ UN ERROR:");
        console.log(json.error || json);
        if (json.details) {
          console.log(`Detalles: ${json.details}`);
        }
      }
    } catch {
      console.log("\n❌ RESPUESTA NO ESPERADA (TEXTO PLANO):");
      console.log(text);
    }
  } catch (error: any) {
    console.error("\n❌ ERROR DE CONEXIÓN A PRODUCCIÓN:");
    console.error(`Detalle: ${error.message || error}`);
  }
}

runProductionTest();
