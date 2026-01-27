#!/usr/bin/env npx tsx
/**
 * SEED COMPLETO - Sistema de Gestión de Clínica Médica
 * Genera 20-30 registros por tabla con datos realistas
 *
 * Uso: npx tsx seed-completo.ts
 */

import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Helpers
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function randomTime(hourStart: number, hourEnd: number): string {
  const hour = randomInt(hourStart, hourEnd);
  const min = randomChoice([0, 15, 30, 45]);
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// Datos realistas argentinos
const nombresHombre = ['Juan', 'Carlos', 'Roberto', 'Martín', 'Pablo', 'Diego', 'Lucas', 'Nicolás', 'Alejandro', 'Sebastián', 'Matías', 'Federico', 'Gabriel', 'Leonardo', 'Agustín'];
const nombresMujer = ['María', 'Laura', 'Patricia', 'Lucía', 'Sofía', 'Valentina', 'Camila', 'Florencia', 'Carolina', 'Daniela', 'Victoria', 'Andrea', 'Paula', 'Romina', 'Julieta'];
const apellidos = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Pérez', 'Sánchez', 'Romero', 'Torres', 'Díaz', 'Álvarez', 'Ruiz', 'Gómez', 'Suárez', 'Silva', 'Castro', 'Morales', 'Giménez', 'Acosta'];
const ciudades = ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Rosario', 'Córdoba', 'Mendoza', 'San Isidro', 'Vicente López', 'Quilmes', 'Tigre'];

function loadEnv(): { host: string; port: number; user: string; password: string; database: string } {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/DATABASE_URL=mysql\+aiomysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\S+)/);
  if (!match) throw new Error('DATABASE_URL no encontrada');
  return { user: match[1], password: match[2], host: match[3], port: parseInt(match[4]), database: match[5] };
}

async function seed() {
  const dbConfig = loadEnv();
  console.log('\n🏥 SEED COMPLETO - Sistema de Clínica Médica\n');

  const conn = await mysql.createConnection({ ...dbConfig, ssl: { rejectUnauthorized: false } });

  try {
    // ========== ORGANIZACIÓN ==========
    let orgId: number;
    const [orgs] = await conn.execute('SELECT id FROM organizaciones WHERE codigo = ?', ['DEMO']) as [any[], any];
    if (orgs.length > 0) {
      orgId = orgs[0].id;
      console.log('✓ Organización existente (id: ' + orgId + ')');
    } else {
      const [r] = await conn.execute(
        `INSERT INTO organizaciones (nombre, codigo, titulo, eslogan, descripcion, activo) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Clínica San Martín', 'DEMO', 'Clínica San Martín', 'Tu salud, nuestra prioridad', 'Centro médico integral', true]
      ) as [any, any];
      orgId = r.insertId;
      console.log('✓ Organización creada (id: ' + orgId + ')');
    }

    // ========== ROLES ==========
    console.log('\n📋 Creando roles...');
    const rolesData = [
      { nombre: 'Administrador', codigo: 'admin', descripcion: 'Acceso total' },
      { nombre: 'Médico', codigo: 'medico', descripcion: 'Atención pacientes' },
      { nombre: 'Recepcionista', codigo: 'recepcion', descripcion: 'Gestión turnos' },
      { nombre: 'Enfermero', codigo: 'enfermero', descripcion: 'Apoyo médico' },
    ];
    const roleIds: Record<string, number> = {};
    for (const r of rolesData) {
      const [ex] = await conn.execute('SELECT id FROM roles WHERE codigo = ? AND organizacion_id = ?', [r.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [res] = await conn.execute('INSERT INTO roles (nombre, codigo, descripcion, organizacion_id, activo) VALUES (?,?,?,?,?)', [r.nombre, r.codigo, r.descripcion, orgId, true]) as [any, any];
        roleIds[r.codigo] = res.insertId;
      } else {
        roleIds[r.codigo] = ex[0].id;
      }
    }
    console.log(`   ✓ ${rolesData.length} roles`);

    // ========== USUARIOS ==========
    console.log('\n👤 Creando usuarios...');
    const usuarios = [
      { email: 'admin@clinica.com', password: 'admin123', nombre: 'Admin', apellido: 'Sistema', rol: 'admin' },
      { email: 'medico@clinica.com', password: 'medico123', nombre: 'Dr. Juan', apellido: 'Pérez', rol: 'medico' },
      { email: 'recepcion@clinica.com', password: 'recep123', nombre: 'María', apellido: 'García', rol: 'recepcion' },
    ];
    for (const u of usuarios) {
      const [ex] = await conn.execute('SELECT id FROM usuarios WHERE email = ?', [u.email]) as [any[], any];
      if (ex.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        await conn.execute('INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, organizacion_id, activo) VALUES (?,?,?,?,?,?,?)',
          [u.email, hash, u.nombre, u.apellido, u.rol, orgId, true]);
      }
    }
    console.log(`   ✓ ${usuarios.length} usuarios`);

    // ========== ESPECIALIDADES ==========
    console.log('\n🩺 Creando especialidades...');
    const especialidades = [
      { nombre: 'Clínica Médica', codigo: 'CM', duracion: 20, color: '#3B82F6' },
      { nombre: 'Cardiología', codigo: 'CAR', duracion: 30, color: '#EF4444' },
      { nombre: 'Pediatría', codigo: 'PED', duracion: 25, color: '#10B981' },
      { nombre: 'Traumatología', codigo: 'TRA', duracion: 20, color: '#F59E0B' },
      { nombre: 'Ginecología', codigo: 'GIN', duracion: 30, color: '#EC4899' },
      { nombre: 'Dermatología', codigo: 'DER', duracion: 20, color: '#8B5CF6' },
      { nombre: 'Oftalmología', codigo: 'OFT', duracion: 20, color: '#06B6D4' },
      { nombre: 'Neurología', codigo: 'NEU', duracion: 40, color: '#6366F1' },
      { nombre: 'Gastroenterología', codigo: 'GAS', duracion: 30, color: '#84CC16' },
      { nombre: 'Urología', codigo: 'URO', duracion: 25, color: '#F97316' },
    ];
    const espIds: Record<string, number> = {};
    for (const e of especialidades) {
      const [ex] = await conn.execute('SELECT id FROM especialidades WHERE codigo = ? AND organizacion_id = ?', [e.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO especialidades (nombre, codigo, duracion_turno_default, color, organizacion_id, activo) VALUES (?,?,?,?,?,?)',
          [e.nombre, e.codigo, e.duracion, e.color, orgId, true]) as [any, any];
        espIds[e.codigo] = r.insertId;
      } else {
        espIds[e.codigo] = ex[0].id;
      }
    }
    console.log(`   ✓ ${especialidades.length} especialidades`);

    // ========== CONSULTORIOS ==========
    console.log('\n🚪 Creando consultorios...');
    const consultorioIds: number[] = [];
    for (let piso = 1; piso <= 3; piso++) {
      for (let num = 1; num <= 4; num++) {
        const numero = `${piso}0${num}`;
        const [ex] = await conn.execute('SELECT id FROM consultorios WHERE numero = ? AND organizacion_id = ?', [numero, orgId]) as [any[], any];
        if (ex.length === 0) {
          const espCodigo = randomChoice(Object.keys(espIds));
          const [r] = await conn.execute('INSERT INTO consultorios (numero, piso, sector, especialidad_id, estado, organizacion_id, activo) VALUES (?,?,?,?,?,?,?)',
            [numero, piso, piso <= 2 ? 'A' : 'B', espIds[espCodigo], 'disponible', orgId, true]) as [any, any];
          consultorioIds.push(r.insertId);
        } else {
          consultorioIds.push(ex[0].id);
        }
      }
    }
    console.log(`   ✓ ${consultorioIds.length} consultorios`);

    // ========== OBRAS SOCIALES ==========
    console.log('\n🛡️ Creando obras sociales...');
    const obrasSociales = [
      { nombre: 'OSDE', codigo: 'OSDE', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'Swiss Medical', codigo: 'SMG', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'IOMA', codigo: 'IOMA', tipo: 'obra_social', cobertura: 70 },
      { nombre: 'PAMI', codigo: 'PAMI', tipo: 'obra_social', cobertura: 100 },
      { nombre: 'Galeno', codigo: 'GAL', tipo: 'prepaga', cobertura: 80 },
      { nombre: 'Medifé', codigo: 'MED', tipo: 'prepaga', cobertura: 75 },
      { nombre: 'OSECAC', codigo: 'OSEC', tipo: 'obra_social', cobertura: 70 },
      { nombre: 'Particular', codigo: 'PART', tipo: 'particular', cobertura: 0 },
    ];
    const osIds: Record<string, number> = {};
    for (const os of obrasSociales) {
      const [ex] = await conn.execute('SELECT id FROM obras_sociales WHERE codigo = ? AND organizacion_id = ?', [os.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO obras_sociales (nombre, codigo, tipo, cobertura_porcentaje, organizacion_id, activo) VALUES (?,?,?,?,?,?)',
          [os.nombre, os.codigo, os.tipo, os.cobertura, orgId, true]) as [any, any];
        osIds[os.codigo] = r.insertId;
      } else {
        osIds[os.codigo] = ex[0].id;
      }
    }
    console.log(`   ✓ ${obrasSociales.length} obras sociales`);

    // ========== DEPARTAMENTOS ==========
    console.log('\n🏢 Creando departamentos...');
    const departamentos = [
      { nombre: 'Recepción', codigo: 'REC' },
      { nombre: 'Enfermería', codigo: 'ENF' },
      { nombre: 'Administración', codigo: 'ADM' },
      { nombre: 'Laboratorio', codigo: 'LAB' },
      { nombre: 'Imágenes', codigo: 'IMG' },
      { nombre: 'Farmacia', codigo: 'FAR' },
    ];
    const depIds: Record<string, number> = {};
    for (const d of departamentos) {
      const [ex] = await conn.execute('SELECT id FROM departamentos WHERE codigo = ? AND organizacion_id = ?', [d.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO departamentos (nombre, codigo, organizacion_id, activo) VALUES (?,?,?,?)',
          [d.nombre, d.codigo, orgId, true]) as [any, any];
        depIds[d.codigo] = r.insertId;
      } else {
        depIds[d.codigo] = ex[0].id;
      }
    }
    console.log(`   ✓ ${departamentos.length} departamentos`);

    // ========== EMPLEADOS ==========
    console.log('\n👷 Creando empleados...');
    const empleadoIds: number[] = [];
    const cargos = ['recepcionista', 'enfermero', 'administrativo', 'tecnico'];
    for (let i = 0; i < 20; i++) {
      const sexo = randomChoice(['M', 'F']);
      const nombre = sexo === 'M' ? randomChoice(nombresHombre) : randomChoice(nombresMujer);
      const apellido = randomChoice(apellidos);
      const doc = `${randomInt(20000000, 45000000)}`;
      const [ex] = await conn.execute('SELECT id FROM empleados WHERE documento = ? AND organizacion_id = ?', [doc, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute(
          'INSERT INTO empleados (nombre, apellido, documento, email, departamento_id, cargo, fecha_ingreso, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?)',
          [nombre, apellido, doc, `${nombre.toLowerCase()}.${apellido.toLowerCase()}@clinica.com`, randomChoice(Object.values(depIds)), randomChoice(cargos), randomDate(new Date(2018, 0, 1), new Date(2024, 0, 1)), orgId, true]
        ) as [any, any];
        empleadoIds.push(r.insertId);
      } else {
        empleadoIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${empleadoIds.length} empleados`);

    // ========== MÉDICOS ==========
    console.log('\n👨‍⚕️ Creando médicos...');
    const medicoIds: number[] = [];
    for (let i = 0; i < 25; i++) {
      const sexo = randomChoice(['M', 'F']);
      const nombre = sexo === 'M' ? randomChoice(nombresHombre) : randomChoice(nombresMujer);
      const apellido = randomChoice(apellidos);
      const doc = `${randomInt(15000000, 35000000)}`;
      const matricula = `MP ${randomInt(10000, 99999)}`;
      const espCodigo = randomChoice(Object.keys(espIds));

      const [ex] = await conn.execute('SELECT id FROM medicos WHERE documento = ? AND organizacion_id = ?', [doc, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute(
          'INSERT INTO medicos (nombre, apellido, documento, matricula_provincial, especialidad_id, email, duracion_turno, fecha_ingreso, honorarios_consulta, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          [nombre, apellido, doc, matricula, espIds[espCodigo], `dr.${apellido.toLowerCase()}@clinica.com`, randomChoice([15, 20, 30]), randomDate(new Date(2010, 0, 1), new Date(2023, 0, 1)), randomInt(5000, 15000), orgId, true]
        ) as [any, any];
        medicoIds.push(r.insertId);
      } else {
        medicoIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${medicoIds.length} médicos`);

    // ========== PACIENTES ==========
    console.log('\n👥 Creando pacientes...');
    const pacienteIds: number[] = [];
    for (let i = 0; i < 100; i++) {
      const sexo = randomChoice(['masculino', 'femenino']);
      const nombre = sexo === 'masculino' ? randomChoice(nombresHombre) : randomChoice(nombresMujer);
      const apellido = randomChoice(apellidos);
      const doc = `${randomInt(10000000, 50000000)}`;
      const fechaNac = randomDate(new Date(1940, 0, 1), new Date(2020, 0, 1));
      const osCodigo = randomChoice(Object.keys(osIds));

      const [ex] = await conn.execute('SELECT id FROM pacientes WHERE documento = ? AND organizacion_id = ?', [doc, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute(
          'INSERT INTO pacientes (nombre, apellido, tipo_documento, documento, fecha_nacimiento, sexo, celular, email, ciudad, obra_social_id, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          [nombre, apellido, 'dni', doc, fechaNac, sexo, `11-${randomInt(4000, 9999)}-${randomInt(1000, 9999)}`, `${nombre.toLowerCase()}.${apellido.toLowerCase()}@gmail.com`, randomChoice(ciudades), osIds[osCodigo], orgId, true]
        ) as [any, any];
        pacienteIds.push(r.insertId);
      } else {
        pacienteIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${pacienteIds.length} pacientes`);

    // ========== TURNOS (últimos 30 días + próximos 30 días) ==========
    console.log('\n📅 Creando turnos...');
    const estados = ['reservado', 'confirmado', 'atendido', 'cancelado', 'ausente'];
    const tipos = ['primera_vez', 'control', 'urgencia'];
    const canales = ['presencial', 'telefono', 'web', 'app'];
    const turnoIds: number[] = [];

    for (let i = 0; i < 300; i++) {
      const fecha = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      const hora = randomTime(8, 18);
      const estado = fecha < new Date().toISOString().split('T')[0] ? randomChoice(['atendido', 'cancelado', 'ausente']) : randomChoice(['reservado', 'confirmado']);
      const medicoId = randomChoice(medicoIds);
      const pacienteId = randomChoice(pacienteIds);
      const espId = randomChoice(Object.values(espIds));
      const osId = randomChoice(Object.values(osIds));

      const [r] = await conn.execute(
        'INSERT INTO turnos (paciente_id, medico_id, consultorio_id, especialidad_id, fecha, hora, duracion_minutos, estado, tipo, obra_social_id, canal_reserva, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [pacienteId, medicoId, randomChoice(consultorioIds), espId, fecha, hora, 20, estado, randomChoice(tipos), osId, randomChoice(canales), orgId, true]
      ) as [any, any];
      turnoIds.push(r.insertId);
    }
    console.log(`   ✓ ${turnoIds.length} turnos`);

    // ========== HISTORIAS CLÍNICAS ==========
    console.log('\n📁 Creando historias clínicas...');
    const hcIds: number[] = [];
    for (let i = 0; i < pacienteIds.length; i++) {
      const pacId = pacienteIds[i];
      const [ex] = await conn.execute('SELECT id FROM historias_clinicas WHERE paciente_id = ?', [pacId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute(
          'INSERT INTO historias_clinicas (paciente_id, numero, fecha_apertura, estado, organizacion_id, activo) VALUES (?,?,?,?,?,?)',
          [pacId, `HC-${String(i + 1).padStart(6, '0')}`, randomDate(new Date(2020, 0, 1), new Date()), 'activa', orgId, true]
        ) as [any, any];
        hcIds.push(r.insertId);
      } else {
        hcIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${hcIds.length} historias clínicas`);

    // ========== EVOLUCIONES ==========
    console.log('\n📝 Creando evoluciones...');
    const turnosAtendidos = turnoIds.slice(0, 100); // Solo algunos
    for (const turnoId of turnosAtendidos) {
      const hcId = randomChoice(hcIds);
      const medicoId = randomChoice(medicoIds);
      await conn.execute(
        'INSERT INTO evoluciones (historia_clinica_id, turno_id, medico_id, fecha, motivo_consulta, enfermedad_actual, examen_fisico, diagnostico_presuntivo, plan_tratamiento, estado, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [hcId, turnoId, medicoId, randomDate(new Date(2024, 0, 1), new Date()), 'Control de rutina', 'Paciente refiere síntomas leves', 'Signos vitales normales', 'Estado general bueno', 'Continuar tratamiento', 'firmado', orgId, true]
      );
    }
    console.log(`   ✓ ${turnosAtendidos.length} evoluciones`);

    // ========== MEDICAMENTOS ==========
    console.log('\n💊 Creando medicamentos...');
    const medicamentos = [
      { nombre: 'Ibuprofeno 400mg', generico: 'Ibuprofeno', forma: 'comprimido' },
      { nombre: 'Paracetamol 500mg', generico: 'Paracetamol', forma: 'comprimido' },
      { nombre: 'Amoxicilina 500mg', generico: 'Amoxicilina', forma: 'capsula' },
      { nombre: 'Omeprazol 20mg', generico: 'Omeprazol', forma: 'capsula' },
      { nombre: 'Loratadina 10mg', generico: 'Loratadina', forma: 'comprimido' },
      { nombre: 'Metformina 850mg', generico: 'Metformina', forma: 'comprimido' },
      { nombre: 'Enalapril 10mg', generico: 'Enalapril', forma: 'comprimido' },
      { nombre: 'Atorvastatina 20mg', generico: 'Atorvastatina', forma: 'comprimido' },
      { nombre: 'Diclofenac Gel', generico: 'Diclofenac', forma: 'crema' },
      { nombre: 'Salbutamol Aerosol', generico: 'Salbutamol', forma: 'inhalador' },
    ];
    const medIds: number[] = [];
    for (const m of medicamentos) {
      const [ex] = await conn.execute('SELECT id FROM medicamentos WHERE nombre_comercial = ? AND organizacion_id = ?', [m.nombre, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute(
          'INSERT INTO medicamentos (nombre_comercial, nombre_generico, presentacion, forma_farmaceutica, via_administracion, organizacion_id, activo) VALUES (?,?,?,?,?,?,?)',
          [m.nombre, m.generico, 'Caja x 30', m.forma, 'oral', orgId, true]
        ) as [any, any];
        medIds.push(r.insertId);
      } else {
        medIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${medicamentos.length} medicamentos`);

    // ========== DIAGNÓSTICOS CIE-10 ==========
    console.log('\n🏷️ Creando diagnósticos...');
    const diagnosticos = [
      { codigo: 'J00', nombre: 'Rinofaringitis aguda (resfriado común)' },
      { codigo: 'J06.9', nombre: 'Infección aguda de las vías respiratorias superiores' },
      { codigo: 'K29.7', nombre: 'Gastritis, no especificada' },
      { codigo: 'M54.5', nombre: 'Lumbago no especificado' },
      { codigo: 'I10', nombre: 'Hipertensión esencial (primaria)' },
      { codigo: 'E11', nombre: 'Diabetes mellitus tipo 2' },
      { codigo: 'J45', nombre: 'Asma' },
      { codigo: 'F41.1', nombre: 'Trastorno de ansiedad generalizada' },
      { codigo: 'K21', nombre: 'Enfermedad por reflujo gastroesofágico' },
      { codigo: 'N39.0', nombre: 'Infección de vías urinarias' },
    ];
    for (const d of diagnosticos) {
      const [ex] = await conn.execute('SELECT id FROM diagnosticos WHERE codigo_cie10 = ? AND organizacion_id = ?', [d.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        await conn.execute('INSERT INTO diagnosticos (codigo_cie10, nombre, organizacion_id, activo) VALUES (?,?,?,?)', [d.codigo, d.nombre, orgId, true]);
      }
    }
    console.log(`   ✓ ${diagnosticos.length} diagnósticos CIE-10`);

    // ========== CATEGORÍAS DE ESTUDIO ==========
    console.log('\n📊 Creando categorías de estudio...');
    const catEstudios = [
      { nombre: 'Laboratorio General', tipo: 'laboratorio' },
      { nombre: 'Imágenes', tipo: 'imagen' },
      { nombre: 'Cardiología', tipo: 'otro' },
    ];
    const catEstIds: number[] = [];
    for (const c of catEstudios) {
      const [ex] = await conn.execute('SELECT id FROM categorias_estudio WHERE nombre = ? AND organizacion_id = ?', [c.nombre, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO categorias_estudio (nombre, tipo, organizacion_id, activo) VALUES (?,?,?,?)', [c.nombre, c.tipo, orgId, true]) as [any, any];
        catEstIds.push(r.insertId);
      } else {
        catEstIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${catEstudios.length} categorías de estudio`);

    // ========== TIPOS DE ESTUDIO ==========
    console.log('\n🔬 Creando tipos de estudio...');
    const tiposEstudio = [
      { nombre: 'Hemograma completo', codigo: 'HEM' },
      { nombre: 'Glucemia', codigo: 'GLU' },
      { nombre: 'Colesterol total', codigo: 'COL' },
      { nombre: 'Triglicéridos', codigo: 'TRI' },
      { nombre: 'Radiografía de tórax', codigo: 'RXT' },
      { nombre: 'Ecografía abdominal', codigo: 'ECA' },
      { nombre: 'Electrocardiograma', codigo: 'ECG' },
      { nombre: 'Ecocardiograma', codigo: 'ECO' },
    ];
    for (const t of tiposEstudio) {
      const [ex] = await conn.execute('SELECT id FROM tipos_estudio WHERE codigo = ? AND organizacion_id = ?', [t.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        await conn.execute('INSERT INTO tipos_estudio (nombre, codigo, categoria_id, precio_particular, organizacion_id, activo) VALUES (?,?,?,?,?,?)',
          [t.nombre, t.codigo, randomChoice(catEstIds), randomInt(2000, 15000), orgId, true]);
      }
    }
    console.log(`   ✓ ${tiposEstudio.length} tipos de estudio`);

    // ========== PROVEEDORES ==========
    console.log('\n🚚 Creando proveedores...');
    const proveedores = [
      { nombre: 'Distribuidora Médica SA', rubro: 'Insumos médicos' },
      { nombre: 'Farmacéutica del Norte', rubro: 'Medicamentos' },
      { nombre: 'Equipos Hospitalarios SRL', rubro: 'Equipamiento' },
      { nombre: 'Lab Suministros', rubro: 'Reactivos' },
    ];
    const provIds: number[] = [];
    for (const p of proveedores) {
      const [ex] = await conn.execute('SELECT id FROM proveedores WHERE razon_social = ? AND organizacion_id = ?', [p.nombre, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO proveedores (razon_social, rubro, organizacion_id, activo) VALUES (?,?,?,?)', [p.nombre, p.rubro, orgId, true]) as [any, any];
        provIds.push(r.insertId);
      } else {
        provIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${proveedores.length} proveedores`);

    // ========== CATEGORÍAS DE INSUMO ==========
    console.log('\n📦 Creando categorías de insumo...');
    const catInsumos = ['Material descartable', 'Medicamentos', 'Reactivos', 'Limpieza'];
    const catInsIds: number[] = [];
    for (const c of catInsumos) {
      const [ex] = await conn.execute('SELECT id FROM categorias_insumo WHERE nombre = ? AND organizacion_id = ?', [c, orgId]) as [any[], any];
      if (ex.length === 0) {
        const [r] = await conn.execute('INSERT INTO categorias_insumo (nombre, organizacion_id, activo) VALUES (?,?,?)', [c, orgId, true]) as [any, any];
        catInsIds.push(r.insertId);
      } else {
        catInsIds.push(ex[0].id);
      }
    }
    console.log(`   ✓ ${catInsumos.length} categorías de insumo`);

    // ========== INSUMOS ==========
    console.log('\n🧪 Creando insumos...');
    const insumos = [
      { nombre: 'Guantes látex (caja x100)', codigo: 'GL100' },
      { nombre: 'Jeringa descartable 5ml', codigo: 'JD5' },
      { nombre: 'Gasa estéril 10x10', codigo: 'GE10' },
      { nombre: 'Alcohol 70% 1L', codigo: 'ALC1' },
      { nombre: 'Barbijo quirúrgico x50', codigo: 'BQ50' },
      { nombre: 'Cinta adhesiva hipoalergénica', codigo: 'CAH' },
    ];
    for (const ins of insumos) {
      const [ex] = await conn.execute('SELECT id FROM insumos WHERE codigo = ? AND organizacion_id = ?', [ins.codigo, orgId]) as [any[], any];
      if (ex.length === 0) {
        await conn.execute('INSERT INTO insumos (nombre, codigo, categoria_id, unidad, stock_actual, stock_minimo, proveedor_id, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?)',
          [ins.nombre, ins.codigo, randomChoice(catInsIds), 'unidad', randomInt(50, 500), 20, randomChoice(provIds), orgId, true]);
      }
    }
    console.log(`   ✓ ${insumos.length} insumos`);

    // ========== CONCEPTOS FACTURACIÓN ==========
    console.log('\n💰 Creando conceptos de facturación...');
    const conceptos = [
      { nombre: 'Consulta médica', tipo: 'consulta', precio: 8000 },
      { nombre: 'Consulta especialista', tipo: 'consulta', precio: 12000 },
      { nombre: 'Práctica menor', tipo: 'practica', precio: 5000 },
      { nombre: 'Estudio laboratorio', tipo: 'estudio', precio: 3500 },
    ];
    for (const c of conceptos) {
      const [ex] = await conn.execute('SELECT id FROM conceptos_facturacion WHERE nombre = ? AND organizacion_id = ?', [c.nombre, orgId]) as [any[], any];
      if (ex.length === 0) {
        await conn.execute('INSERT INTO conceptos_facturacion (nombre, tipo, precio_default, organizacion_id, activo) VALUES (?,?,?,?,?)', [c.nombre, c.tipo, c.precio, orgId, true]);
      }
    }
    console.log(`   ✓ ${conceptos.length} conceptos de facturación`);

    // ========== AGENDAS MÉDICO ==========
    console.log('\n📆 Creando agendas médico...');
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    let agendasCount = 0;
    for (const medicoId of medicoIds.slice(0, 15)) {
      for (const dia of dias.slice(0, randomInt(3, 5))) {
        await conn.execute(
          'INSERT INTO agendas_medico (medico_id, consultorio_id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, sobreturnos_max, organizacion_id, activo) VALUES (?,?,?,?,?,?,?,?,?)',
          [medicoId, randomChoice(consultorioIds), dia, '08:00', '16:00', 20, 2, orgId, true]
        );
        agendasCount++;
      }
    }
    console.log(`   ✓ ${agendasCount} agendas médico`);

    // ========== RESUMEN ==========
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED COMPLETADO EXITOSAMENTE!');
    console.log('='.repeat(50));
    console.log('\n📊 Resumen de datos creados:');
    console.log('   • 1 Organización');
    console.log(`   • ${rolesData.length} Roles`);
    console.log(`   • ${usuarios.length} Usuarios`);
    console.log(`   • ${especialidades.length} Especialidades`);
    console.log(`   • ${consultorioIds.length} Consultorios`);
    console.log(`   • ${obrasSociales.length} Obras Sociales`);
    console.log(`   • ${departamentos.length} Departamentos`);
    console.log(`   • ${empleadoIds.length} Empleados`);
    console.log(`   • ${medicoIds.length} Médicos`);
    console.log(`   • ${pacienteIds.length} Pacientes`);
    console.log(`   • ${turnoIds.length} Turnos`);
    console.log(`   • ${hcIds.length} Historias Clínicas`);
    console.log(`   • ${turnosAtendidos.length} Evoluciones`);
    console.log(`   • ${medicamentos.length} Medicamentos`);
    console.log(`   • ${diagnosticos.length} Diagnósticos CIE-10`);
    console.log(`   • ${agendasCount} Agendas Médico`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   • admin@clinica.com / admin123');
    console.log('   • medico@clinica.com / medico123');
    console.log('   • recepcion@clinica.com / recep123\n');

  } finally {
    await conn.end();
  }
}

seed().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
