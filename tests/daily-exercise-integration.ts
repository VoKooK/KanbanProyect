import "dotenv/config";

async function runIntegrationTest() {
  const cronSecret = process.env.CRON_SECRET || "cron-secret-super-key-987654321-zyxwvuts";
  const url = "http://localhost:3000/api/cron/daily-exercise";

  console.log(`Lanzando petición de integración real a: ${url}...`);
  console.log("Esta prueba conectará con la API real de Google Gemini y guardará el resultado en tu base de datos de Neon.");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json"
      }
    });

    const status = response.status;
    const text = await response.text();

    console.log(`\nStatus HTTP: ${status}`);
    
    try {
      const json = JSON.parse(text);
      if (response.ok && json.success) {
        console.log("\n🎉 ¡PRUEBA EXITOSA!");
        console.log("-----------------------------------------------------------------");
        console.log(`ID Tarea:     ${json.task.id}`);
        console.log(`Título Tarea: ${json.task.title}`);
        console.log(`Columna ID:   ${json.task.columnId}`);
        console.log("-----------------------------------------------------------------");
        console.log("Ve a tu tablero en el navegador (http://localhost:3000/kanban).");
        console.log("Verás el nuevo ejercicio de programación creado por Gemini al principio de la columna.");
      } else {
        console.log("\n❌ LA API RETORNÓ UN ERROR:");
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
    console.error("\n❌ ERROR DE CONEXIÓN:");
    console.error("No se pudo conectar con el servidor local.");
    console.error("Asegúrate de que el servidor esté en ejecución corriendo: npm run dev");
    console.error(`Detalle: ${error.message || error}`);
  }
}

runIntegrationTest();
