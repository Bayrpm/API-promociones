import type { APIRoute } from "astro";
import { supabase } from "../../../db/supabase";

export const GET: APIRoute = async () => {
  try {
    // Validar la conexión a la base de datos
    if (!supabase) {
      throw new Error('Error en la conexión a la base de datos');
    }

    const { data: promociones, error } = await supabase
      .from('promociones')
      .select('*, promociones_productos(idproducto)')

    if (error) {
      throw error;
    }

    // Verificar si la consulta devuelve resultados
    if (!promociones || promociones.length === 0) {
      const noPromotionsResponse = new Response(JSON.stringify({ message: 'No se encontraron promociones' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return noPromotionsResponse;
    }

    const responseBody = JSON.stringify(promociones); // Convertir el array de promociones a JSON

    const response = new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  } catch (err) {
    const errorMessage = (err as Error).message;

    const errorResponse = new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return errorResponse;
  }
};
