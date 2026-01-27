#!/usr/bin/env npx tsx
/**
 * SEED - Sistema de Gestión de Clínica Médica
 * Datos de prueba realistas para Argentina
 *
 * Uso: npx tsx seed.ts
 */

import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Leer .env del backend y parsear DATABASE_URL
function loadEnv(): { host: string; port: number; user: string; password: string; database: string } {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: No existe backend/.env');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/DATABASE_URL=mysql\+aiomysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\S+)/);
  if (!match) {
    console.error('Error: No se encontró DATABASE_URL válida en .env');
    process.exit(1);
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  };
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  const dbConfig = loadEnv();
  console.log('\n🏥 SEED - Sistema de Clínica Médica\n');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Database: ${dbConfig.database}\n`);

  const connection = await mysql.createConnection({
    ...dbConfig,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // ========== 1. ORGANIZACIÓN ==========
    console.log('📦 Creando organización...');

    const [orgs] = await connection.execute(
      'SELECT id FROM organizaciones WHERE codigo = ?',
      ['DEMO']
    ) as [any[], any];

    let orgId: number;

    if (orgs.length > 0) {
      orgId = orgs[0].id;
      await connection.execute(
        `UPDATE organizaciones SET nombre = ?, titulo = ?, eslogan = ? WHERE id = ?`,
        ['Clínica Demo', 'Clínica Demo', 'Sistema de gestión clínica', orgId]
      );
      console.log('   ⚠ Organización DEMO ya existe (id: ' + orgId + ') - actualizada');
    } else {
      const [result] = await connection.execute(
        `INSERT INTO organizaciones (nombre, codigo, titulo, eslogan, descripcion, activo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Clínica Demo', 'DEMO', 'Clínica Demo', 'Sistema de gestión clínica', 'Sistema integral para gestión de clínicas', true]
      ) as [any, any];
      orgId = result.insertId;
      console.log('   ✓ Organización creada (id: ' + orgId + ')');
    }

    // ========== 2. ROLES ==========
    console.log('\n👥 Creando roles...');

    const roles = [
      { nombre: 'Administrador', codigo: 'admin', descripcion: 'Acceso total al sistema' },
      { nombre: 'Médico', codigo: 'medico', descripcion: 'Acceso a consultas y pacientes' },
      { nombre: 'Recepcionista', codigo: 'recepcion', descripcion: 'Gestión de turnos y pacientes' },
    ];

    const roleIds: Record<string, number> = {};

    for (const rol of roles) {
      const [existing] = await connection.execute(
        'SELECT id FROM roles WHERE codigo = ? AND organizacion_id = ?',
        [rol.codigo, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO roles (nombre, codigo, descripcion, organizacion_id, activo) VALUES (?, ?, ?, ?, ?)`,
          [rol.nombre, rol.codigo, rol.descripcion, orgId, true]
        ) as [any, any];
        roleIds[rol.codigo] = result.insertId;
        console.log(`   ✓ Rol "${rol.codigo}" creado`);
      } else {
        roleIds[rol.codigo] = existing[0].id;
        console.log(`   ⚠ Rol "${rol.codigo}" ya existe`);
      }
    }

    // ========== 3. USUARIOS ==========
    console.log('\n👤 Creando usuarios...');

    const usuarios = [
      { email: 'admin@clinica.com', password: 'admin123', nombre: 'Admin', apellido: 'Sistema', rol: 'admin' },
      { email: 'medico@clinica.com', password: 'medico123', nombre: 'Dr. Juan', apellido: 'Pérez', rol: 'medico' },
      { email: 'recepcion@clinica.com', password: 'recep123', nombre: 'María', apellido: 'García', rol: 'recepcion' },
    ];

    for (const usuario of usuarios) {
      const [existing] = await connection.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [usuario.email]
      ) as [any[], any];

      if (existing.length === 0) {
        const hashedPassword = await hashPassword(usuario.password);
        await connection.execute(
          `INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [usuario.email, hashedPassword, usuario.nombre, usuario.apellido, usuario.rol, orgId, true]
        );
        console.log(`   ✓ Usuario "${usuario.email}" creado`);
      } else {
        console.log(`   ⚠ Usuario "${usuario.email}" ya existe`);
      }
    }

    // ========== 4. ESPECIALIDADES ==========
    console.log('\n🩺 Creando especialidades...');

    const especialidades = [
      { nombre: 'Clínica Médica', codigo: 'CM', duracion: 20, color: '#3B82F6', icono: 'Stethoscope' },
      { nombre: 'Cardiología', codigo: 'CAR', duracion: 30, color: '#EF4444', icono: 'Heart' },
      { nombre: 'Pediatría', codigo: 'PED', duracion: 25, color: '#10B981', icono: 'Baby' },
      { nombre: 'Traumatología', codigo: 'TRA', duracion: 20, color: '#F59E0B', icono: 'Bone' },
      { nombre: 'Ginecología', codigo: 'GIN', duracion: 30, color: '#EC4899', icono: 'UserRound' },
      { nombre: 'Dermatología', codigo: 'DER', duracion: 20, color: '#8B5CF6', icono: 'Scan' },
      { nombre: 'Oftalmología', codigo: 'OFT', duracion: 20, color: '#06B6D4', icono: 'Eye' },
      { nombre: 'Neurología', codigo: 'NEU', duracion: 40, color: '#6366F1', icono: 'Brain' },
    ];

    const especialidadIds: Record<string, number> = {};

    for (const esp of especialidades) {
      const [existing] = await connection.execute(
        'SELECT id FROM especialidades WHERE codigo = ? AND organizacion_id = ?',
        [esp.codigo, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO especialidades (nombre, codigo, duracion_turno_default, color, icono, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [esp.nombre, esp.codigo, esp.duracion, esp.color, esp.icono, orgId, true]
        ) as [any, any];
        especialidadIds[esp.codigo] = result.insertId;
        console.log(`   ✓ Especialidad "${esp.nombre}" creada`);
      } else {
        especialidadIds[esp.codigo] = existing[0].id;
        console.log(`   ⚠ Especialidad "${esp.nombre}" ya existe`);
      }
    }

    // ========== 5. CONSULTORIOS ==========
    console.log('\n🚪 Creando consultorios...');

    const consultorios = [
      { numero: '101', piso: 1, sector: 'A', especialidad: 'CM' },
      { numero: '102', piso: 1, sector: 'A', especialidad: 'CAR' },
      { numero: '103', piso: 1, sector: 'B', especialidad: 'PED' },
      { numero: '201', piso: 2, sector: 'A', especialidad: 'GIN' },
      { numero: '202', piso: 2, sector: 'B', especialidad: 'DER' },
      { numero: '203', piso: 2, sector: 'B', especialidad: 'OFT' },
    ];

    for (const cons of consultorios) {
      const [existing] = await connection.execute(
        'SELECT id FROM consultorios WHERE numero = ? AND organizacion_id = ?',
        [cons.numero, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO consultorios (numero, piso, sector, especialidad_id, estado, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [cons.numero, cons.piso, cons.sector, especialidadIds[cons.especialidad], 'disponible', orgId, true]
        );
        console.log(`   ✓ Consultorio "${cons.numero}" creado`);
      } else {
        console.log(`   ⚠ Consultorio "${cons.numero}" ya existe`);
      }
    }

    // ========== 6. OBRAS SOCIALES ==========
    console.log('\n🛡️ Creando obras sociales...');

    const obrasSociales = [
      { nombre: 'OSDE', codigo: 'OSDE', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'Swiss Medical', codigo: 'SMG', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'IOMA', codigo: 'IOMA', tipo: 'obra_social', cobertura: 70 },
      { nombre: 'PAMI', codigo: 'PAMI', tipo: 'obra_social', cobertura: 100 },
      { nombre: 'Galeno', codigo: 'GAL', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'Particular', codigo: 'PART', tipo: 'particular', cobertura: 0 },
    ];

    const obraSocialIds: Record<string, number> = {};

    for (const os of obrasSociales) {
      const [existing] = await connection.execute(
        'SELECT id FROM obras_sociales WHERE codigo = ? AND organizacion_id = ?',
        [os.codigo, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO obras_sociales (nombre, codigo, tipo, cobertura_porcentaje, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [os.nombre, os.codigo, os.tipo, os.cobertura, orgId, true]
        ) as [any, any];
        obraSocialIds[os.codigo] = result.insertId;
        console.log(`   ✓ Obra social "${os.nombre}" creada`);
      } else {
        obraSocialIds[os.codigo] = existing[0].id;
        console.log(`   ⚠ Obra social "${os.nombre}" ya existe`);
      }
    }

    // ========== 7. MÉDICOS ==========
    console.log('\n👨‍⚕️ Creando médicos...');

    const medicos = [
      { nombre: 'Roberto', apellido: 'González', documento: '20456789', matricula: 'MP 12345', especialidad: 'CM', email: 'rgonzalez@clinica.com', fechaIngreso: '2015-03-01' },
      { nombre: 'Carlos', apellido: 'Fernández', documento: '18345678', matricula: 'MP 34567', especialidad: 'CAR', email: 'cfernandez@clinica.com', fechaIngreso: '2010-01-10' },
      { nombre: 'María Elena', apellido: 'Rodríguez', documento: '22567890', matricula: 'MP 45678', especialidad: 'PED', email: 'merodriguez@clinica.com', fechaIngreso: '2012-08-20' },
      { nombre: 'Patricia', apellido: 'Suárez', documento: '23456789', matricula: 'MP 78901', especialidad: 'GIN', email: 'psuarez@clinica.com', fechaIngreso: '2016-09-01' },
      { nombre: 'Daniela', apellido: 'Romero', documento: '26789012', matricula: 'MP 89012', especialidad: 'DER', email: 'dromero@clinica.com', fechaIngreso: '2019-03-10' },
    ];

    const medicoIds: Record<string, number> = {};

    for (const med of medicos) {
      const [existing] = await connection.execute(
        'SELECT id FROM medicos WHERE documento = ? AND organizacion_id = ?',
        [med.documento, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO medicos (nombre, apellido, documento, matricula_provincial, especialidad_id, email, duracion_turno, fecha_ingreso, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [med.nombre, med.apellido, med.documento, med.matricula, especialidadIds[med.especialidad], med.email, 20, med.fechaIngreso, orgId, true]
        ) as [any, any];
        medicoIds[med.documento] = result.insertId;
        console.log(`   ✓ Médico "Dr. ${med.apellido}" creado`);
      } else {
        medicoIds[med.documento] = existing[0].id;
        console.log(`   ⚠ Médico "Dr. ${med.apellido}" ya existe`);
      }
    }

    // ========== 8. PACIENTES ==========
    console.log('\n👥 Creando pacientes...');

    const pacientes = [
      { nombre: 'Juan Carlos', apellido: 'Pérez', documento: '25678901', fechaNac: '1975-05-15', sexo: 'masculino', celular: '11-6666-1111', obraSocial: 'OSDE' },
      { nombre: 'María Laura', apellido: 'García', documento: '30123456', fechaNac: '1988-09-22', sexo: 'femenino', celular: '11-6666-2222', obraSocial: 'SMG' },
      { nombre: 'Roberto', apellido: 'Sánchez', documento: '18456789', fechaNac: '1962-03-10', sexo: 'masculino', celular: '11-6666-3333', obraSocial: 'PAMI' },
      { nombre: 'Lucía', apellido: 'Fernández', documento: '35789012', fechaNac: '1995-12-01', sexo: 'femenino', celular: '11-6666-4444', obraSocial: 'GAL' },
      { nombre: 'Martín', apellido: 'López', documento: '28901234', fechaNac: '1982-07-18', sexo: 'masculino', celular: '11-6666-5555', obraSocial: 'IOMA' },
      { nombre: 'Sofía', apellido: 'Martínez', documento: '40123456', fechaNac: '2018-04-25', sexo: 'femenino', celular: '11-6666-6666', obraSocial: 'OSDE' },
      { nombre: 'Eduardo', apellido: 'Ruiz', documento: '22345678', fechaNac: '1970-11-30', sexo: 'masculino', celular: '11-6666-7777', obraSocial: 'PART' },
      { nombre: 'Valentina', apellido: 'Torres', documento: '33456789', fechaNac: '1992-02-14', sexo: 'femenino', celular: '11-6666-8888', obraSocial: 'SMG' },
    ];

    for (const pac of pacientes) {
      const [existing] = await connection.execute(
        'SELECT id FROM pacientes WHERE documento = ? AND organizacion_id = ?',
        [pac.documento, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO pacientes (nombre, apellido, tipo_documento, documento, fecha_nacimiento, sexo, celular, obra_social_id, organizacion_id, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pac.nombre, pac.apellido, 'dni', pac.documento, pac.fechaNac, pac.sexo, pac.celular, obraSocialIds[pac.obraSocial], orgId, true]
        );
        console.log(`   ✓ Paciente "${pac.nombre} ${pac.apellido}" creado`);
      } else {
        console.log(`   ⚠ Paciente "${pac.nombre} ${pac.apellido}" ya existe`);
      }
    }

    // ========== 9. DEPARTAMENTOS ==========
    console.log('\n🏢 Creando departamentos...');

    const departamentos = [
      { nombre: 'Recepción', codigo: 'REC' },
      { nombre: 'Enfermería', codigo: 'ENF' },
      { nombre: 'Administración', codigo: 'ADM' },
      { nombre: 'Laboratorio', codigo: 'LAB' },
    ];

    for (const dep of departamentos) {
      const [existing] = await connection.execute(
        'SELECT id FROM departamentos WHERE codigo = ? AND organizacion_id = ?',
        [dep.codigo, orgId]
      ) as [any[], any];

      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO departamentos (nombre, codigo, organizacion_id, activo)
           VALUES (?, ?, ?, ?)`,
          [dep.nombre, dep.codigo, orgId, true]
        );
        console.log(`   ✓ Departamento "${dep.nombre}" creado`);
      } else {
        console.log(`   ⚠ Departamento "${dep.nombre}" ya existe`);
      }
    }

    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('📋 Resumen:');
    console.log(`   • 1 Organización`);
    console.log(`   • ${roles.length} Roles`);
    console.log(`   • ${usuarios.length} Usuarios`);
    console.log(`   • ${especialidades.length} Especialidades`);
    console.log(`   • ${consultorios.length} Consultorios`);
    console.log(`   • ${obrasSociales.length} Obras Sociales`);
    console.log(`   • ${medicos.length} Médicos`);
    console.log(`   • ${pacientes.length} Pacientes`);
    console.log(`   • ${departamentos.length} Departamentos`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   • admin@clinica.com / admin123');
    console.log('   • medico@clinica.com / medico123');
    console.log('   • recepcion@clinica.com / recep123\n');

  } finally {
    await connection.end();
  }
}

// Ejecutar
seed().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
