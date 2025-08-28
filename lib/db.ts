// lib/db.ts
import Dexie, { type Table } from 'dexie';
import type { Project } from './project/types';

/**
 * Define la estructura de la base de datos de la aplicación.
 * Usamos Dexie.js, una envoltura amigable para IndexedDB.
 */
export class AppDatabase extends Dexie {
  /**
   * Tabla de Proyectos.
   * Dexie la usará para crear una "tabla" (Object Store) en IndexedDB
   * donde cada fila será un objeto de tipo 'Project'.
   */
  projects!: Table<Project, string>; // El segundo tipo 'string' indica que la clave primaria es un string (el UUID).

  constructor() {
    // El nombre de la base de datos en el navegador del usuario.
    super('BobGasistaDatabase');
    
    // Definimos las versiones de nuestra base de datos.
    // Si en el futuro necesitas cambiar la estructura (ej. agregar una tabla),
    // crearías una version(2) y Dexie se encargaría de la migración.
    this.version(1).stores({
      /**
       * Definición de la tabla 'projects'.
       * "id": Es la clave primaria (primary key). No necesita '++' porque nosotros mismos generamos el UUID.
       * "name": Creamos un "índice" en el nombre. Esto nos permitirá hacer búsquedas y ordenamientos por nombre de manera súper eficiente.
       * "updatedAt": También creamos un índice en la fecha de actualización para poder ordenar los proyectos por los más recientes.
       */
      projects: 'id, name, updatedAt',
    });
  }
}

// Creamos una instancia única de la base de datos que usaremos en toda la aplicación.
export const db = new AppDatabase();