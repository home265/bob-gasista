export default function AyudaPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Guía de Uso de Bob Gasista</h1>
        <p className="text-sm text-foreground/70">
          Aprende a usar la calculadora para planificar tus instalaciones de gas de forma rápida y profesional.
        </p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="text-lg font-medium border-b border-border pb-2">¿Cómo Funciona?</h2>
        <p className="text-sm">
          La aplicación está diseñada en base a **Proyectos**. Cada proyecto representa una obra o cliente, y dentro de cada uno tendrás una calculadora para definir la instalación de gas. La app guarda tu progreso automáticamente.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Paso 1: Crea tu Primer Proyecto</h3>
        <div className="card p-5 space-y-3 text-sm">
          <p>
            Al abrir la app, siempre empezarás en la pantalla de **"Mis Proyectos de Gas"**.
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              En la tarjeta de **"Crear Nuevo Proyecto"**, escribe un nombre descriptivo para tu obra (ej: "Casa Familia Pérez", "Obra San Martín 123").
            </li>
            <li>
              Haz clic en el botón **"Crear y Abrir Calculadora"**.
            </li>
            <li>
              ¡Listo! Serás llevado directamente a la calculadora, dentro de tu nuevo proyecto.
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Paso 2: Usa la Calculadora</h3>
        <div className="card p-5 space-y-3 text-sm">
            <p className="font-medium text-base">La calculadora tiene 3 secciones principales:</p>
            <ul className="list-disc list-inside space-y-3 pl-2">
                <li>
                    <strong>Datos Generales:</strong> Aquí eliges el tipo de gas (natural o envasado) y el sistema de cañerías. También puedes definir las plantas de la instalación (ej: "Planta Baja", "Primer Piso"), agregando o quitando según necesites.
                </li>
                <li>
                    <strong>Bocas y Recorrido:</strong> Este es el corazón del cálculo. Haz clic en **"+ Agregar Boca"** para cada artefacto que instalarás, desde el más cercano al nicho hasta el más lejano. En cada "Boca" deberás completar:
                    <ul className="list-['-_'] list-inside space-y-1 pl-6 mt-2">
                        <li><strong>Ubicación:</strong> La planta donde se encuentra.</li>
                        <li><strong>Distancia:</strong> Los metros de caño desde la boca anterior (o desde el nicho si es la primera).</li>
                        <li><strong>Artefacto:</strong> El tipo y su consumo en kcal/h. Si es un calefactor, aparecerá un botón `?` para usar el ayudante de cálculo por m².</li>
                        <li><strong>Accesorios:</strong> La cantidad de codos o "T" que usarás en ese tramo.</li>
                    </ul>
                </li>
                 <li>
                    <strong>Materiales Adicionales:</strong> Un anotador simple para que agregues ítems que no son parte del cálculo de cañerías, como teflón, sellador, etc.
                </li>
            </ul>
        </div>
      </div>

       <div className="space-y-4">
        <h3 className="text-xl font-semibold">Paso 3: Calcula y Guarda</h3>
        <div className="card p-5 space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              Una vez que hayas cargado todas las bocas, presiona el botón azul **"Calcular Instalación"**.
            </li>
            <li>
              Debajo aparecerá la sección de **Resultados**, con los diámetros recomendados para cada tramo y el cómputo total de materiales.
            </li>
            <li>
              Para que tu trabajo quede grabado, haz clic en el botón **"Guardar Cálculo en el Proyecto"**. La próxima vez que entres, todos los datos estarán cargados.
            </li>
          </ol>
        </div>
      </div>

       <div className="space-y-4">
        <h3 className="text-xl font-semibold">Paso 4: Edita y Exporta tus Proyectos</h3>
        <div className="card p-5 space-y-3 text-sm">
           <p>
            Vuelve a la página de **"Proyectos"** (haciendo clic en el menú superior) para gestionar tus obras.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
                <strong>Editar/Ver Cálculo:</strong> Te lleva de nuevo a la calculadora con los últimos datos que guardaste para ese proyecto.
            </li>
            <li>
                <strong>Ver Resumen y Exportar:</strong> Te abre una página de resumen ideal para compartir. Desde allí podrás:
                 <ul className="list-['-_'] list-inside space-y-1 pl-6 mt-2">
                    <li>Imprimir o **Guardar como PDF** la lista de materiales.</li>
                    <li>Descargar un archivo CSV para abrir en planillas de cálculo.</li>
                    <li>**Compartir** un resumen rápido por WhatsApp o email.</li>
                </ul>
            </li>
             <li>
                <strong>Eliminar:</strong> Borra el proyecto permanentemente.
            </li>
          </ul>
        </div>
      </div>

    </section>
  );
}