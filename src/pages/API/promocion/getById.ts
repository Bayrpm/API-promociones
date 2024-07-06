import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const idpromocion = url.searchParams.get('id'); // Obtener el ID de la promoción desde los parámetros de la URL

  if (!idpromocion) {
    return new Response(JSON.stringify({ error: "ID de promoción no proporcionado" }), { status: 400 });
  }

  try {
    // Obtener una promoción específica por ID
    const { data, error } = await supabase
      .from('promociones')
      .select('*, promociones_productos(idproducto)')
      .eq('idpromocion', idpromocion)
      .single();

    if (error) {
      throw error;
    }

    // Devolver la respuesta en formato JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
};
