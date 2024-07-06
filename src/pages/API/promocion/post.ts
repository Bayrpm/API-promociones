import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase";

interface Promocion {
    nombre: string;
    descripcion: string;
    descuento: number;
    valido_desde: string;
    valido_hasta: string;
    productos: number[];
}

function isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

function isDateInRange(start: string, end: string): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const currentDate = new Date();

    // valido_desde no puede ser anterior a la fecha actual ni superior a valido_hasta
    if (startDate < currentDate || startDate > endDate) {
        return false;
    }

    // valido_hasta no puede ser inferior a valido_desde
    if (endDate < startDate) {
        return false;
    }

    return true;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const { nombre, descripcion, descuento, valido_desde, valido_hasta, productos }: Promocion = await request.json();

        // Validaciones
        if (!nombre) {
            return new Response(JSON.stringify({ error: "El nombre de la promoción es requerido" }), { status: 400 });
        }

        if (!descripcion) {
            return new Response(JSON.stringify({ error: "La descripción de la promoción es requerida" }), { status: 400 });
        }

        if (descuento == null || !Number.isInteger(descuento) || descuento < 1 || descuento > 100) {
            return new Response(JSON.stringify({ error: "El descuento debe ser un número entero entre 1 y 100" }), { status: 400 });
        }

        if (!valido_desde || !isValidDate(valido_desde)) {
            return new Response(JSON.stringify({ error: "La fecha 'Valido_desde' debe estar en formato AAAA-MM-DD" }), { status: 400 });
        }

        if (!valido_hasta || !isValidDate(valido_hasta)) {
            return new Response(JSON.stringify({ error: "La fecha 'Valido_hasta' debe estar en formato AAAA-MM-DD" }), { status: 400 });
        }

        if (!isDateInRange(valido_desde, valido_hasta)) {
            return new Response(JSON.stringify({ error: "Las fechas 'Valido_desde' y 'Valido_hasta' no están en un rango válido" }), { status: 400 });
        }

        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return new Response(JSON.stringify({ error: "Debe seleccionar al menos un producto para la promoción" }), { status: 400 });
        }

        // Insertar la promoción en la base de datos
        const { data: promocion, error } = await supabase
            .from('promociones')
            .insert([{ nombre, descripcion, descuento, valido_desde, valido_hasta }])
            .select()
            .single();

        if (error) {
            console.error('Error al insertar la promoción:', error);
            return new Response(JSON.stringify({ error: "Error al insertar la promoción en la base de datos" }), { status: 400 });
        }

        const { idpromocion } = promocion;

        // Insertar los productos asociados a la promoción
        const productEntries = productos.map(idproducto => ({ idpromocion, idproducto }));
        const { error: productsError } = await supabase.from('promociones_productos').insert(productEntries);

        if (productsError) {
            console.error('Error al insertar los productos de la promoción:', productsError);
            return new Response(JSON.stringify({ error: "Error al insertar los productos de la promoción en la base de datos" }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Promoción ha sido creada con éxito." }), { status: 201 });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return new Response(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 400 });
    }
}
